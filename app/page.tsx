'use client';

import { Button } from "@/components/UI";
import { ShoppingCart, Star, MapPin, Mountain } from 'lucide-react';

interface CoffeeProduct {
  id: string;
  name: string;
  roaster: string;
  price: number;
  weight: string;
  description: string;
}

const coffeeProducts: CoffeeProduct[] = [
  {
    id: 'tio-hugo',
    name: 'Caturra & Catuai Blend',
    roaster: 'Roasted by Tio Hugo',
    price: 7.5,
    weight: '250g',
    description: 'A harmonious blend of Caturra and Catuai beans, expertly roasted by Tio Hugo to bring out rich, balanced flavors with notes of chocolate and caramel.',
  },
  {
    id: 'las-penas',
    name: 'Caturra & Catuai Blend',
    roaster: 'Roasted by Las Peñas',
    price: 7.5,
    weight: '250g',
    description: 'Premium Caturra and Catuai blend roasted by Las Peñas farm, offering a smooth, full-bodied experience with hints of citrus and nuts.',
  },
];

const producerInfo = {
  farm: 'Las Peñas',
  region: 'Costa Rica',
  altitude: '1350 meters',
  coordinates: '10°30, 98N; 84°13, 14W',
  rating: 4,
  maxRating: 5,
  sales: 20,
};

export default function Home() {
  const handlePurchase = (product: CoffeeProduct) => {
    alert(`Purchase ${product.name} by ${product.roaster} for $${product.price}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            CofiBlocks
          </h1>
          <p className="text-xl text-gray-300">
            Premium Costa Rican Coffee
          </p>
        </div>

        {/* Coffee Products Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {coffeeProducts.map((product) => (
            <div
              key={product.id}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-yellow-400 transition-colors"
            >
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {product.name}
                </h2>
                <p className="text-lg text-yellow-400 mb-2">
                  {product.roaster}
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  {product.weight}
                </p>
              </div>

              <p className="text-gray-300 mb-6 min-h-[80px]">
                {product.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-white">
                  ${product.price.toFixed(2)}
                </span>
              </div>

              <Button
                onClick={() => handlePurchase(product)}
                className="w-full"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </Button>
            </div>
          ))}
        </div>

        {/* Producer Information */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            About the Producer
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">Farm</p>
                  <p className="text-lg text-white font-semibold">{producerInfo.farm}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">Region</p>
                  <p className="text-lg text-white font-semibold">{producerInfo.region}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mountain className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">Altitude</p>
                  <p className="text-lg text-white font-semibold">{producerInfo.altitude}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">Reviews</p>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(producerInfo.maxRating)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < producerInfo.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-white font-semibold">
                      {producerInfo.rating}/{producerInfo.maxRating}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShoppingCart className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">Sales on Cofiblocks</p>
                  <p className="text-lg text-white font-semibold">{producerInfo.sales}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">Coordinates</p>
                  <p className="text-sm text-white font-mono">{producerInfo.coordinates}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
