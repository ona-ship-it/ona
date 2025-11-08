'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { createGiveaway } from './actions';
import { toast } from 'sonner';

interface FieldErrors {
  title?: string;
  description?: string;
  entryCost?: string;
  prizeAmount?: string;
  endsAt?: string;
  image?: string;
}

export default function AdminNewGiveawayPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [entryCost, setEntryCost] = useState(0);
  const [prizeAmount, setPrizeAmount] = useState(100);
  const [endsAt, setEndsAt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const supabase = createClient();

  // Validation functions
  const validateField = (fieldName: string, value: any): string | undefined => {
    switch (fieldName) {
      case 'title':
        if (!value || !value.trim()) return 'Title is required';
        if (value.trim().length < 3) return 'Title must be at least 3 characters';
        if (value.trim().length > 100) return 'Title must be less than 100 characters';
        break;
      case 'description':
        if (!value || !value.trim()) return 'Description is required';
        if (value.trim().length < 10) return 'Description must be at least 10 characters';
        if (value.trim().length > 1000) return 'Description must be less than 1000 characters';
        break;
      case 'entryCost':
        if (value < 0) return 'Entry cost cannot be negative';
        if (value > 10000) return 'Entry cost cannot exceed 10,000 USDT';
        break;
      case 'prizeAmount':
        if (!value || value <= 0) return 'Prize amount must be greater than 0';
        if (value > 1000000) return 'Prize amount cannot exceed 1,000,000 USDT';
        break;
      case 'endsAt':
        if (!value) return 'End date is required';
        const endDate = new Date(value);
        const now = new Date();
        const minDate = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
        const maxDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
        if (endDate <= minDate) return 'End date must be at least 1 hour in the future';
        if (endDate > maxDate) return 'End date cannot be more than 1 year in the future';
        break;
      case 'image':
        if (!imageUrl) return 'Image is required';
        break;
    }
    return undefined;
  };

  const validateAllFields = (): FieldErrors => {
    return {
      title: validateField('title', title),
      description: validateField('description', description),
      entryCost: validateField('entryCost', entryCost),
      prizeAmount: validateField('prizeAmount', prizeAmount),
      endsAt: validateField('endsAt', endsAt),
      image: validateField('image', imageUrl),
    };
  };

  const handleFieldChange = (fieldName: string, value: any, setter: (value: any) => void) => {
    setter(value);
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    // Real-time validation
    const error = validateField(fieldName, value);
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    setPhoto(file);
    setPhotoError('');

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setPhotoError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setPhotoError('Image size must be less than 5MB');
      return;
    }

    try {
      setPhotoLoading(true);

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to upload images');
      }

      // Upload to Supabase Storage with correct bucket and path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `giveaway-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('giveaways')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('giveaways')
        .getPublicUrl(filePath);

      setImageUrl(data.publicUrl);
      
      // Trigger image validation
      setTouched(prev => ({ ...prev, image: true }));
      const imageError = validateField('image', data.publicUrl);
      setFieldErrors(prev => ({ ...prev, image: imageError }));
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setPhotoError(err.message || 'Failed to upload image');
      setPhotoPreview('');
      setImageUrl('');
    } finally {
      setPhotoLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Mark all fields as touched
      setTouched({
        title: true,
        description: true,
        entryCost: true,
        prizeAmount: true,
        endsAt: true,
        image: true,
      });

      // Comprehensive validation
      const errors = validateAllFields();
      const hasErrors = Object.values(errors).some(error => error !== undefined);
      
      if (hasErrors) {
        setFieldErrors(errors);
        throw new Error('Please fix the validation errors before submitting');
      }

      // Create FormData for server action
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('entry_cost', entryCost.toString());
      formData.append('prize_amount', prizeAmount.toString());
      formData.append('ends_at', endsAt);
      formData.append('image_url', imageUrl);

      // Call server action
      const result = await createGiveaway(formData);
      
      // If successful, reset form
      setTitle('');
      setDescription('');
      setEntryCost(0);
      setPrizeAmount(100);
      setEndsAt('');
      setImageUrl('');
      setPhotoPreview('');
      setFieldErrors({});
      setTouched({});
      
      // Show success message
      setError('');
      toast.success('Giveaway created successfully!');
      
    } catch (err: any) {
      console.error('Error creating giveaway:', err);
      setError(err.message || 'Failed to create giveaway');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-black/30 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Create New Giveaway (Admin)
          </h1>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-purple-300 mb-2 font-medium">
                Title * <span className="text-sm text-gray-400">(3-100 characters)</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => handleFieldChange('title', e.target.value, setTitle)}
                className={`w-full bg-purple-900/50 border rounded-lg p-3 text-white focus:outline-none focus:ring-2 transition-colors ${
                  fieldErrors.title && touched.title
                    ? 'border-red-500/50 focus:ring-red-400'
                    : 'border-purple-500/30 focus:ring-purple-400'
                }`}
                placeholder="Enter giveaway title"
                maxLength={100}
                required
              />
              {fieldErrors.title && touched.title && (
                <p className="text-red-400 text-sm mt-1">{fieldErrors.title}</p>
              )}
              <p className="text-gray-400 text-xs mt-1">{title.length}/100 characters</p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-purple-300 mb-2 font-medium">
                Description * <span className="text-sm text-gray-400">(10-1000 characters)</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => handleFieldChange('description', e.target.value, setDescription)}
                rows={4}
                className={`w-full bg-purple-900/50 border rounded-lg p-3 text-white focus:outline-none focus:ring-2 transition-colors resize-none ${
                  fieldErrors.description && touched.description
                    ? 'border-red-500/50 focus:ring-red-400'
                    : 'border-purple-500/30 focus:ring-purple-400'
                }`}
                placeholder="Describe your giveaway in detail"
                maxLength={1000}
                required
              />
              {fieldErrors.description && touched.description && (
                <p className="text-red-400 text-sm mt-1">{fieldErrors.description}</p>
              )}
              <p className="text-gray-400 text-xs mt-1">{description.length}/1000 characters</p>
            </div>

            {/* Entry Cost */}
            <div>
              <label htmlFor="entry_cost" className="block text-purple-300 mb-2 font-medium">
                Entry Cost (USDT) <span className="text-sm text-gray-400">(0-10,000)</span>
              </label>
              <input
                type="number"
                id="entry_cost"
                value={entryCost}
                onChange={(e) => handleFieldChange('entryCost', Number(e.target.value), setEntryCost)}
                min="0"
                max="10000"
                step="0.01"
                className={`w-full bg-purple-900/50 border rounded-lg p-3 text-white focus:outline-none focus:ring-2 transition-colors ${
                  fieldErrors.entryCost && touched.entryCost
                    ? 'border-red-500/50 focus:ring-red-400'
                    : 'border-purple-500/30 focus:ring-purple-400'
                }`}
                placeholder="0.00 (Free entry if 0)"
              />
              {fieldErrors.entryCost && touched.entryCost && (
                <p className="text-red-400 text-sm mt-1">{fieldErrors.entryCost}</p>
              )}
              <p className="text-gray-400 text-xs mt-1">Set to 0 for free entry</p>
            </div>

            {/* Prize Amount */}
            <div>
              <label htmlFor="prize_amount" className="block text-purple-300 mb-2 font-medium">
                Prize Amount (USDT) * <span className="text-sm text-gray-400">(1-1,000,000)</span>
              </label>
              <input
                type="number"
                id="prize_amount"
                value={prizeAmount}
                onChange={(e) => handleFieldChange('prizeAmount', Number(e.target.value), setPrizeAmount)}
                min="1"
                max="1000000"
                step="0.01"
                className={`w-full bg-purple-900/50 border rounded-lg p-3 text-white focus:outline-none focus:ring-2 transition-colors ${
                  fieldErrors.prizeAmount && touched.prizeAmount
                    ? 'border-red-500/50 focus:ring-red-400'
                    : 'border-purple-500/30 focus:ring-purple-400'
                }`}
                placeholder="100.00"
                required
              />
              {fieldErrors.prizeAmount && touched.prizeAmount && (
                <p className="text-red-400 text-sm mt-1">{fieldErrors.prizeAmount}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="ends_at" className="block text-purple-300 mb-2 font-medium">
                End Date * <span className="text-sm text-gray-400">(At least 1 hour from now)</span>
              </label>
              <input
                type="datetime-local"
                id="ends_at"
                value={endsAt}
                onChange={(e) => handleFieldChange('endsAt', e.target.value, setEndsAt)}
                min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)} // 1 hour from now
                max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)} // 1 year from now
                className={`w-full bg-purple-900/50 border rounded-lg p-3 text-white focus:outline-none focus:ring-2 transition-colors ${
                  fieldErrors.endsAt && touched.endsAt
                    ? 'border-red-500/50 focus:ring-red-400'
                    : 'border-purple-500/30 focus:ring-purple-400'
                }`}
                required
              />
              {fieldErrors.endsAt && touched.endsAt && (
                <p className="text-red-400 text-sm mt-1">{fieldErrors.endsAt}</p>
              )}
              <p className="text-gray-400 text-xs mt-1">Must be between 1 hour and 1 year from now</p>
            </div>

            {/* Image Upload */}
            <div>
              <label htmlFor="image" className="block text-purple-300 mb-2 font-medium">
                Giveaway Image * <span className="text-sm text-gray-400">(Max 5MB, JPG/PNG/GIF/WebP)</span>
              </label>
              <input
                type="file"
                id="image"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageUpload}
                className={`w-full bg-purple-900/50 border rounded-lg p-3 text-white focus:outline-none focus:ring-2 transition-colors ${
                  (fieldErrors.image && touched.image) || photoError
                    ? 'border-red-500/50 focus:ring-red-400'
                    : 'border-purple-500/30 focus:ring-purple-400'
                }`}
                required
              />
              {photoError && (
                <p className="text-red-400 text-sm mt-2">{photoError}</p>
              )}
              {fieldErrors.image && touched.image && !photoError && (
                <p className="text-red-400 text-sm mt-2">{fieldErrors.image}</p>
              )}
              {photoLoading && (
                <div className="flex items-center mt-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
                  <p className="text-blue-400 text-sm">Uploading image...</p>
                </div>
              )}
              {photoPreview && (
                <div className="mt-4">
                  <p className="text-green-400 text-sm mb-2">✓ Image uploaded successfully</p>
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="h-32 w-32 object-cover rounded-lg border border-green-500/30"
                  />
                </div>
              )}
              <p className="text-gray-400 text-xs mt-1">Supported formats: JPEG, PNG, GIF, WebP (max 5MB)</p>
            </div>

            {/* Image URL Display */}
            {imageUrl && (
              <div>
                <label className="block text-purple-300 mb-2 font-medium">
                  Image URL
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  readOnly
                  className="w-full bg-gray-800/50 border border-gray-600/30 rounded-lg p-3 text-gray-300"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || photoLoading || Object.values(fieldErrors).some(error => error !== undefined)}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Giveaway...
                </div>
              ) : photoLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Uploading Image...
                </div>
              ) : Object.values(fieldErrors).some(error => error !== undefined) ? (
                'Please Fix Validation Errors'
              ) : (
                'Create Giveaway'
              )}
            </button>
            
            {/* Form Status */}
            {Object.values(fieldErrors).some(error => error !== undefined) && (
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mt-4">
                <p className="text-yellow-300 text-sm">
                  ⚠️ Please fix the validation errors above before submitting
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}