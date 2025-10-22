'use client';

export default function ViewProfileClient() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-2xl text-gray-600">👤</span>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">User Profile</h2>
            <p className="text-gray-600">Manage your profile information</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input 
              type="text" 
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="Enter your display name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea 
              className="w-full p-2 border border-gray-300 rounded-lg h-24"
              placeholder="Tell us about yourself"
            />
          </div>
          
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
}