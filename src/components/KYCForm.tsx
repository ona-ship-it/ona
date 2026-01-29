'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { IconUpload, IconCheck, IconX } from '@tabler/icons-react';

interface KYCFormProps {
  fundraiserId: string;
  fundraiserTitle: string;
  escrowBalance: number;
  onComplete: () => void;
}

export default function KYCForm({ fundraiserId, fundraiserTitle, escrowBalance, onComplete }: KYCFormProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // Form data
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    dateOfBirth: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    country: '',
    withdrawalWalletAddress: '',
  });

  const [files, setFiles] = useState({
    passportPhoto: null as File | null,
    idDocument: null as File | null,
    proofOfAddress: null as File | null,
  });

  async function uploadFile(file: File, userId: string, documentType: string): Promise<string> {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${documentType}_${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('kyc-documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('kyc-documents')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!files.passportPhoto) {
      alert('Passport photo is required');
      return;
    }

    try {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('Please sign in to submit KYC');
        return;
      }

      // Upload documents
      const passportUrl = await uploadFile(files.passportPhoto, user.id, 'passport');
      const idUrl = files.idDocument ? await uploadFile(files.idDocument, user.id, 'id_document') : null;
      const addressProofUrl = files.proofOfAddress ? await uploadFile(files.proofOfAddress, user.id, 'proof_of_address') : null;

      // Submit KYC
      const { error } = await supabase.from('kyc_submissions').insert([
        {
          fundraiser_id: fundraiserId,
          user_id: user.id,
          ...formData,
          passport_photo_url: passportUrl,
          id_document_url: idUrl,
          proof_of_address_url: addressProofUrl,
          status: 'pending',
        },
      ]);

      if (error) throw error;

      // Update fundraiser KYC status
      await supabase.from('fundraisers').update({
        kyc_status: 'submitted',
        kyc_submitted_at: new Date().toISOString(),
      }).eq('id', fundraiserId);

      alert('KYC submitted successfully! We will review your documents within 2-3 business days.');
      onComplete();
    } catch (error: any) {
      console.error('Error submitting KYC:', error);
      alert('Failed to submit KYC: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete KYC Verification</h2>
        <p className="text-gray-600">
          To withdraw your funds (${escrowBalance.toFixed(2)} USDC in escrow), please complete identity verification.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Legal Name *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="+1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold mb-4">Address</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1 *</label>
              <input
                type="text"
                required
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code *</label>
                <input
                  type="text"
                  required
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold mb-4">Identity Documents</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passport Photo * (Clear photo of your passport/ID)
              </label>
              <input
                type="file"
                required
                accept="image/*"
                onChange={(e) => setFiles({ ...files, passportPhoto: e.target.files?.[0] || null })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Withdrawal Wallet */}
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold mb-4">Withdrawal Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Withdrawal Wallet Address * (Where you want to receive funds)
            </label>
            <input
              type="text"
              required
              value={formData.withdrawalWalletAddress}
              onChange={(e) => setFormData({ ...formData, withdrawalWalletAddress: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 font-mono text-sm"
              placeholder="0x..."
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit KYC'}
          </button>
        </div>
      </form>
    </div>
  );
}
