import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
	try {
		const orderData = await request.json();

		console.log('Received order data:', JSON.stringify(orderData, null, 2));

		// Validate required fields
		if (!orderData.customerName || !orderData.customerEmail || !orderData.walletAddress || !orderData.product) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		// Save to Firebase
		const ordersCollection = db.collection('CopiBlocksOrders');
		const dataToSave = {
			...orderData,
			createdAt: new Date(),
			status: 'pending'
		};

		console.log('Saving to Firebase:', JSON.stringify(dataToSave, null, 2));

		const docRef = await ordersCollection.add(dataToSave);

		return NextResponse.json({
			success: true,
			orderId: docRef.id
		});

	} catch (error) {
		console.error('Error saving order:', error);
		return NextResponse.json(
			{ error: 'Failed to save order' },
			{ status: 500 }
		);
	}
}
