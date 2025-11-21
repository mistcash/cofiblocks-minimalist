'use client';

import React, { useState, useEffect } from 'react';
import { Button, baseUIBoxClasses } from './UI';
import { ShoppingCart, WalletMinimal, Send, CheckCircle, AlertCircle } from 'lucide-react';
import Image from "next/image";
import StarknetWalletGate from './StarknetWalletGate';
import { useAccount, useContract, useSendTransaction, useProvider } from '@starknet-react/core';
import { uint256 } from "starknet";
import { useMist } from '@mistcash/react';
import { txSecret } from '@mistcash/crypto';
import { ERC20_ABI } from '@mistcash/config';
import { fmtAmount, fmtAmtToBigInt } from '@mistcash/sdk';
import { SN_CONTRACT_ADDRESS, USDC_ADDRESS, USDC_TOKEN } from '@/lib/config';
import logo from '../public/images/logo.png';

if (!SN_CONTRACT_ADDRESS) {
	throw new Error('Starknet contract address not configured');
}

interface Product {
	id: string;
	name: string;
	roaster: string;
	price: number;
	quantity: number;
}

const products: Product[] = [
	{
		id: '1',
		name: 'Caturra & Catuai Blend',
		roaster: 'Tio Hugo',
		price: 7.5,
		quantity: 250
	},
	{
		id: '2',
		name: 'Caturra & Catuai Blend',
		roaster: 'Las Peñas',
		price: 7.5,
		quantity: 250
	}
];

const Shop: React.FC = () => {
	const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
	const [customerName, setCustomerName] = useState<string>('');
	const [customerEmail, setCustomerEmail] = useState<string>('');
	const [isProcessing, setIsProcessing] = useState<boolean>(false);
	const [processStatus, setProcessStatus] = useState<string>('');
	const [txHash, setTxHash] = useState<string>('');
	const [errorDetails, setErrorDetails] = useState<string>('');
	const [salt, setSalt] = useState<string>('');

	const { address } = useAccount();
	const { sendAsync } = useSendTransaction({});
	const { contract, isPending, txError: error, chamberAddress } = useMist(useProvider(), useSendTransaction({}));
	const { contract: usdcContract } = useContract({ abi: ERC20_ABI, address: USDC_ADDRESS as `0x${string}` });
	const [balance, setBalance] = useState<string>('0');

	// Generate salt on mount
	useEffect(() => {
		setSalt(genSalt());
	}, []);

	// Fetch USDC balance
	useEffect(() => {
		(async () => {
			if (usdcContract && address) {
				try {
					const bal = await usdcContract.balanceOf(address as string);
					const balanceValue = uint256.uint256ToBN(bal as any);
					setBalance(parseFloat(fmtAmount(balanceValue, 6)).toFixed(2));
				} catch (error) {
					console.error("Failed to fetch balance:", error);
				}
			}
		})();
	}, [address, usdcContract]);

	const handlePayment = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const product = products.find(p => p.id === selectedProduct);

		if (!product || !customerName || !customerEmail || !address || !usdcContract || !contract) {
			console.error("Missing required fields");
			return;
		}

		setIsProcessing(true);
		setProcessStatus("Preparing transaction...");

		try {
			const claimingKey = await hashOrderData('salt', customerEmail, customerName);
			const txSecretValue = await txSecret(claimingKey.toString(), SN_CONTRACT_ADDRESS);

			console.log('claimingKey', claimingKey, 'txSecretValue', txSecretValue)

			// Convert USDC amount to proper format (6 decimals for USDC)
			const amount_bi = fmtAmtToBigInt(product.price.toFixed(2), USDC_TOKEN.decimals || 6);
			const amountCharged = uint256.bnToUint256(amount_bi);

			usdcContract.address = USDC_ADDRESS;
			const asset = {
				amount: amountCharged,
				addr: USDC_ADDRESS
			};

			setProcessStatus("Submitting MIST transaction...");

			// Execute the Mist deposit transaction
			const txResponse = await sendAsync([
				usdcContract.populate('approve', [chamberAddress, asset.amount]),
				contract.populate('deposit', [txSecretValue, asset])
			]);

			setTxHash(txResponse.transaction_hash);
			setProcessStatus("Transaction submitted, saving order details...");

			// Save order to Firebase
			const orderData = {
				customerName,
				customerEmail,
				walletAddress: address,
				product: {
					id: product.id,
					name: product.name,
					roaster: product.roaster,
					price: product.price
				},
				amount: product.price,
				salt,
				claimingKey: claimingKey.toString(),
				transactionHash: txResponse.transaction_hash,
				timestamp: new Date().toISOString()
			};

			const saveResponse = await fetch('/api/orders/save', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(orderData)
			});

			if (!saveResponse.ok) {
				throw new Error('Failed to save order details');
			}
			setProcessStatus("Success! Order completed.");
		} catch (error) {
			console.error("Payment failed:", error);
			setProcessStatus("Error occurred");
			setErrorDetails(error instanceof Error ? error.message : 'Unknown error occurred');
		}
	};

	const waiting = isPending || isProcessing;
	const selectedProductData = products.find(p => p.id === selectedProduct);

	return (
		<div className="w-full">
			{/* Hero Image */}
			<div className="mb-8 flex justify-center">
				<Image
					src="/images/logo.png"
					alt="Coffee"
					width={80}
					height={200}
					priority
				/>
			</div>

			<div className='p-6 mb-8 bg-green'>
				<h2 className="text-lg font-light text-yellow text-center mb-4">
					The Coffee Community
				</h2>
				<p className="text-3xl text-gray-300 text-center max-w-2xl mx-auto">
					Choose your coffee
				</p>
			</div>

			<div className='max-w-4xl m-auto px-6'>

				{/* Product Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
					{products.map((product) => (
						<div
							key={product.id}
							onClick={() => setSelectedProduct(product.id)}
							className={`rounded-lg p-6 border-2 transition-all cursor-pointer ${selectedProduct === product.id
								? 'border-yellow shadow-lg shadow-yellow/20 bg-yellow/20'
								: 'border-gray-700 hover:border-gray-600 opacity-80'
								}`}
						>
							<div className="flex items-start justify-between mb-4">
								<div>
									<h3 className="text-xl font-bold text-green mb-1">
										{product.name}
									</h3>
									<p className="text-gray-800 text-sm">Roasted by {product.roaster}</p>
								</div>
								{selectedProduct === product.id && (
									<div className="bg-yellow text-black rounded-full p-2">
										{/* <ShoppingCart className="w-5 h-5" /> */}
										<CheckCircle className="w-5 h-5" />
									</div>
								)}
							</div>
							<div className="flex items-center justify-between">
								<span className="text-gray-600">{product.quantity}g</span>
								<span className="text-2xl font-bold text-yellow">
									${product.price.toFixed(2)}
								</span>
							</div>
						</div>
					))}
				</div>

				{/* Checkout Form */}
				{selectedProduct && (
					<form onSubmit={handlePayment} className="rounded-lg p-6 border border-gray-700" style={{ backgroundColor: '#1a423d' }}>
						<h3 className="text-lg font-normal text-white mb-4">Check out our counter for stock availability.</h3>
						<div className="mb-4">
							<label className="text-white text-xs font-medium mb-1 ml-1 block">
								Full Name
							</label>
							<input
								type="text"
								required
								className="w-full text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow focus:outline-none"
								style={{ backgroundColor: '#0d2e2a' }}
								placeholder="John Doe"
								value={customerName}
								onChange={(e) => setCustomerName(e.target.value)}
							/>
						</div>

						<div className="mb-6">
							<label className="text-white text-xs font-medium mb-1 ml-1 block">
								Email Address
							</label>
							<input
								type="email"
								required
								className="w-full text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow focus:outline-none"
								style={{ backgroundColor: '#0d2e2a' }}
								placeholder="john@example.com"
								value={customerEmail}
								onChange={(e) => setCustomerEmail(e.target.value)}
							/>
						</div>

						<StarknetWalletGate connectedClass="text-white" label={<><WalletMinimal className="w-5 h-5" />Connect Wallet</>}>
							<Button disabled={waiting} type="submit" variant="primary">
								<Send className="w-5 h-5" />
								{waiting ? 'Processing...' : `Pay $${selectedProductData?.price.toFixed(2)}`}
							</Button>
						</StarknetWalletGate>

						{error && (
							<div className={baseUIBoxClasses + " bg-red-800 px-3 py-2 mt-2"}>
								{error.message}
							</div>
						)}
					</form>
				)}

				{/* Processing Overlay */}
				{isProcessing && (
					<div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4" style={{ 'backdropFilter': 'blur(4px)' }}>
						<div className="bg-green rounded-xl p-8 max-w-lg w-full shadow-2xl" style={{
							borderColor: processStatus.includes("Error") ? '#ef4444' : processStatus.includes("Success") ? '#10b981' : '#facc15'
						}}>
							<div className="text-center">
								{/* Icon */}
								<div className="mb-6">
									{processStatus.includes("Error") ? (
										<div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
											<AlertCircle className="w-12 h-12 text-red-500" />
										</div>
									) : processStatus.includes("Success") ? (
										<div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto animate-bounce">
											<CheckCircle className="w-12 h-12 text-green-500" />
										</div>
									) : (
										<div className="w-20 h-20 bg-yellow/20 rounded-full flex items-center justify-center mx-auto">
											<div className="w-12 h-12 border-4 border-yellow border-t-transparent rounded-full animate-spin" />
										</div>
									)}
								</div>

								{/* Title */}
								<h3 className="text-2xl font-bold text-white mb-3">
									{processStatus.includes("Error") ? "❌ Transaction Failed" :
										processStatus.includes("Success") ? "🎉 Order Successful!" : "⏳ Processing..."}
								</h3>

								{/* Status Message */}
								<p className="text-gray-300 text-lg mb-6">{processStatus}</p>

								{/* Success Details */}
								{processStatus.includes("Success") && selectedProductData && (
									<div className="rounded-lg p-4 mb-6 text-left" style={{ backgroundColor: '#1a423d' }}>
										<div className="flex items-center justify-between mb-2">
											<span className="text-gray-400 text-sm">Product:</span>
											<span className="text-white font-semibold">{selectedProductData.name}</span>
										</div>
										<div className="flex items-center justify-between mb-2">
											<span className="text-gray-400 text-sm">Roaster:</span>
											<span className="text-white">{selectedProductData.roaster}</span>
										</div>
										<div className="flex items-center justify-between mb-2">
											<span className="text-gray-400 text-sm">Amount:</span>
											<span className="text-green-400 font-bold">${selectedProductData.price.toFixed(2)}</span>
										</div>
										{txHash && (
											<div className="mt-3 pt-3 border-t border-gray-700">
												<span className="text-gray-400 text-xs block mb-1">Transaction Hash:</span>
												<a
													href={`https://starkscan.co/tx/${txHash}`}
													target="_blank"
													rel="noopener noreferrer"
													className="text-blue-400 hover:text-blue-300 text-xs font-mono break-all"
												>
													{txHash.slice(0, 10)}...{txHash.slice(-8)}
												</a>
											</div>
										)}
									</div>
								)}

								{/* Error Details */}
								{processStatus.includes("Error") && (
									<div className="bg-red-900/30 border border-red-600 rounded-lg p-4 mb-6 text-left">
										<p className="text-red-200 text-sm mb-2"><strong>Error Details:</strong></p>
										<p className="text-red-100 text-sm font-mono break-all">{errorDetails || 'An unexpected error occurred'}</p>
										{error && (
											<p className="text-red-200 text-xs mt-2">{error.message}</p>
										)}
									</div>
								)}

								{/* Action Buttons */}
								<div className="flex gap-3">
									{processStatus.includes("Success") && (
										<>
											<button
												onClick={() => {
													setIsProcessing(false);
													setSelectedProduct(null);
													setCustomerName('');
													setCustomerEmail('');
													setSalt(genSalt());
												}}
												className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
											>
												Order More Coffee
											</button>
											{txHash && (
												<a
													href={`https://starkscan.co/tx/${txHash}`}
													target="_blank"
													rel="noopener noreferrer"
													className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold transition-colors text-center"
												>
													View on Explorer
												</a>
											)}
										</>
									)}
									{processStatus.includes("Error") && (
										<>
											<button
												onClick={() => {
													setIsProcessing(false);
													setErrorDetails('');
												}}
												className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
											>
												Try Again
											</button>
											<a
												href="https://t.me/mistcash"
												target="_blank"
												rel="noopener noreferrer"
												className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold transition-colors text-center"
											>
												Get Help
											</a>
										</>
									)}
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Shop;

function genSalt(): string {
	return '0x' + Math.random().toString(16).substring(1, 8) + Math.random().toString(16).substring(1, 8)
}

async function hashOrderData(salt: string, email: string, name: string): Promise<bigint> {
	salt += '';
	const data = email + name;
	const encoder = new TextEncoder();
	const dataBuffer = encoder.encode(data);
	const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	// Take only first 30 bytes (200 bits) to keep under 200 bit limit
	const hashHex = hashArray.slice(0, 30).map(b => b.toString(16).padStart(2, '0')).join('');
	return BigInt('0x' + hashHex);
}

