'use client';

export default function MarketplaceClient() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Marketplace</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-2">Featured Items</h3>
          <p className="text-gray-600">Discover amazing products and services.</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-2">Categories</h3>
          <p className="text-gray-600">Browse by category to find what you need.</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-2">Trending</h3>
          <p className="text-gray-600">See what's popular right now.</p>
        </div>
      </div>
    </div>
  );
}