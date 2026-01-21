'use client';

export default function FundraiseClient() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Fundraise</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 mb-4">
          Start your fundraising campaign and reach your goals.
        </p>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
          Create Campaign
        </button>
      </div>
    </div>
  );
}