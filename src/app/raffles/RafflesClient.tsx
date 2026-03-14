'use client';

export default function RafflesClient() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Raffles</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Active Raffles</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-lg font-medium">Sample Raffle</h3>
            <p className="text-gray-600">Join exciting raffles and win amazing prizes!</p>
            <button className="mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
              Enter Raffle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}