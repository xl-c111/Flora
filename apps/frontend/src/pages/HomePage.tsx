import React from 'react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-400 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Fresh Flowers, Delivered with Love
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Discover our beautiful collection of fresh flowers, bouquets, and
              arrangements. Perfect for any occasion or just to brighten your
              day.
            </p>
            <div className="space-x-4">
              <Link
                to="/products"
                className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
              >
                Shop Now
              </Link>
              <Link
                to="/subscriptions"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition duration-300"
              >
                Subscriptions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600">
              Find the perfect flowers for every occasion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
              <div className="h-48 bg-gradient-to-br from-pink-200 to-rose-300"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Bouquets</h3>
                <p className="text-gray-600 mb-4">
                  Beautiful hand-tied bouquets perfect for gifts
                </p>
                <Link
                  to="/categories/bouquets"
                  className="text-green-600 font-semibold hover:text-green-700"
                >
                  Shop Bouquets →
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
              <div className="h-48 bg-gradient-to-br from-yellow-200 to-orange-300"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Arrangements</h3>
                <p className="text-gray-600 mb-4">
                  Elegant floral arrangements for home and office
                </p>
                <Link
                  to="/categories/arrangements"
                  className="text-green-600 font-semibold hover:text-green-700"
                >
                  Shop Arrangements →
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
              <div className="h-48 bg-gradient-to-br from-purple-200 to-indigo-300"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Subscriptions</h3>
                <p className="text-gray-600 mb-4">
                  Regular flower deliveries to brighten your space
                </p>
                <Link
                  to="/subscriptions"
                  className="text-green-600 font-semibold hover:text-green-700"
                >
                  Learn More →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Flora?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fresh Daily</h3>
              <p className="text-gray-600">
                All our flowers are sourced fresh daily to ensure the highest
                quality
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Same-day delivery available for orders placed before 2 PM
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Satisfaction Guarantee
              </h3>
              <p className="text-gray-600">
                100% satisfaction guaranteed or your money back
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
