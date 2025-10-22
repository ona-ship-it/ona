'use client';

export default function WalletClient() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Wallet</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Balance</h2>
          <div className="text-3xl font-bold text-green-600 mb-2">$0.00</div>
          <p className="text-gray-600">Your current wallet balance</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded">
              Add Funds
            </button>
            <button className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded">
              Withdraw
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}