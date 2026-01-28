'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { IconHeart, IconUpload, IconX } from '@tabler/icons-react';

const CATEGORIES = [
  'Medical',
  'Emergency',
  'Education',
  'Memorial',
  'Animals & Pets',
  'Community',
  'Sports',
  'Creative',
  'Other'
];

export default function CreateFundraiseClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const [formData, setFormData] = useState({
    title: '',
    story: '',
    category: 'Medical',
    goal_amount: '',
    location: '',
    country: '',
    beneficiary_name: '',
    beneficiary_relationship: '',
    wallet_address: '',
    cover_image: '',
  });

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login?redirect=/fundraise/create');
      return;
    }
    setUser(user);
    
    // Set default wallet address if available
    const { data: profile } = await supabase
      .from('users')
      .select('wallet_address')
      .eq('id', user.id)
      .single();
    
    if (profile?.wallet_address) {
      setFormData(prev => ({ ...prev, wallet_address: profile.wallet_address }));
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const supabase = createClient();
      
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('fundraiser-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('fundraiser-images')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, cover_image: publicUrl }));
      setImagePreview(URL.createObjectURL(file));
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  }

  function removeImage() {
    setFormData(prev => ({ ...prev, cover_image: '' }));
    setImagePreview('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      const supabase = createClient();
      const { data, error } = await supabase
        .from('fundraisers')
        .insert([
          {
            user_id: user.id,
            title: formData.title,
            story: formData.story,
            category: formData.category,
            goal_amount: parseFloat(formData.goal_amount),
            location: formData.location || null,
            country: formData.country || null,
            beneficiary_name: formData.beneficiary_name || null,
            beneficiary_relationship: formData.beneficiary_relationship || null,
            wallet_address: formData.wallet_address,
            cover_image: formData.cover_image || null,
            status: 'active',
            published_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      router.push(`/fundraise/${data.id}`);
    } catch (error: any) {
      console.error('Error creating fundraiser:', error);
      alert(error.message || 'Failed to create fundraiser');
    } finally {
      setLoading(false);
    }
  }

  const isStepValid = () => {
    if (currentStep === 1) {
      return formData.title.length >= 10 && formData.category;
    }
    if (currentStep === 2) {
      return formData.story.length >= 50;
    }
    if (currentStep === 3) {
      return formData.goal_amount && parseFloat(formData.goal_amount) > 0 && formData.wallet_address;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Start Your Fundraiser</h1>
          <p className="text-gray-300">Raise money with crypto. It's fast, secure, and transparent.</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    currentStep >= step
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-16 h-1 ${
                      currentStep > step ? 'bg-green-600' : 'bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-16 mt-3 text-sm text-gray-400">
            <div>Basics</div>
            <div>Story</div>
            <div>Goal</div>
            <div>Review</div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl p-8">
          {/* Step 1: Basics */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Help Sarah Beat Cancer"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-gray-900"
                  required
                  minLength={10}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.title.length}/80 characters (minimum 10)
                </p>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-gray-900"
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, State"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="e.g., United States"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-gray-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Story */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Tell Your Story *
                </label>
                <textarea
                  name="story"
                  value={formData.story}
                  onChange={handleChange}
                  placeholder="Share your story with potential donors. Why are you fundraising? How will the funds be used?"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-gray-900 min-h-[300px]"
                  required
                  minLength={50}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.story.length} characters (minimum 50)
                </p>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Cover Image
                </label>
                
                {imagePreview || formData.cover_image ? (
                  <div className="relative">
                    <img 
                      src={imagePreview || formData.cover_image} 
                      alt="Cover preview" 
                      className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
                    >
                      <IconX size={20} />
                    </button>
                  </div>
                ) : (
                  <label className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    <IconUpload size={48} className="text-gray-400 mb-4" />
                    <p className="text-gray-600 font-semibold mb-2">
                      {uploadingImage ? 'Uploading...' : 'Click to upload cover image'}
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG up to 5MB
                    </p>
                  </label>
                )}
                
                <p className="text-sm text-gray-500 mt-2">
                  Add a compelling image to increase donations (optional)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Beneficiary Name
                  </label>
                  <input
                    type="text"
                    name="beneficiary_name"
                    value={formData.beneficiary_name}
                    onChange={handleChange}
                    placeholder="Who will receive the funds?"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Relationship
                  </label>
                  <input
                    type="text"
                    name="beneficiary_relationship"
                    value={formData.beneficiary_relationship}
                    onChange={handleChange}
                    placeholder="e.g., Myself, My Sister, Friend"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-gray-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Goal & Wallet */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Fundraising Goal (USDC) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    name="goal_amount"
                    value={formData.goal_amount}
                    onChange={handleChange}
                    placeholder="10000"
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-gray-900"
                    required
                    min="1"
                    step="0.01"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Set a realistic goal for your campaign
                </p>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Wallet Address (Polygon) *
                </label>
                <input
                  type="text"
                  name="wallet_address"
                  value={formData.wallet_address}
                  onChange={handleChange}
                  placeholder="0x..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-gray-900 font-mono text-sm"
                  required
                  pattern="^0x[a-fA-F0-9]{40}$"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Donations will be sent directly to this wallet address
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">💡 Why Crypto?</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>✓ Instant transfers - no waiting for banks</li>
                  <li>✓ Lower fees than traditional payment processors</li>
                  <li>✓ Global reach - accept donations from anywhere</li>
                  <li>✓ Transparent - all transactions on blockchain</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{formData.title}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <span className="ml-2 font-semibold">{formData.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Goal:</span>
                    <span className="ml-2 font-semibold">${parseFloat(formData.goal_amount || '0').toLocaleString()} USDC</span>
                  </div>
                  {formData.location && (
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <span className="ml-2 font-semibold">{formData.location}</span>
                    </div>
                  )}
                  {formData.beneficiary_name && (
                    <div>
                      <span className="text-gray-600">Beneficiary:</span>
                      <span className="ml-2 font-semibold">{formData.beneficiary_name}</span>
                    </div>
                  )}
                </div>
                <div className="border-t pt-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{formData.story}</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Before You Launch</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Double-check your wallet address</li>
                  <li>• Ensure your story is compelling and honest</li>
                  <li>• Share your campaign on social media</li>
                  <li>• Keep donors updated with regular posts</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!isStepValid()}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {loading ? 'Creating...' : 'Launch Campaign'} 
                <IconHeart size={20} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
