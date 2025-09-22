'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface GiveawayFormProps {
  onSubmit: (data: { title: string; description: string; prize: string; photo: string | null }) => void;
  onCancel: () => void;
}

export default function GiveawayForm({ onSubmit, onCancel }: GiveawayFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prize, setPrize] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      prize,
      photo: photoPreview
    });
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-white">Create Your Giveaway</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-white mb-2">Giveaway Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            placeholder="Enter giveaway title"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-white mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            placeholder="Describe your giveaway"
            rows={4}
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-white mb-2">Prize</label>
          <input
            type="text"
            value={prize}
            onChange={(e) => setPrize(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            placeholder="What are you giving away?"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-white mb-2">Giveaway Photo</label>
          <div 
            onClick={triggerFileInput}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-purple-500 transition-colors ${photoPreview ? 'border-purple-500' : 'border-gray-600'}`}
          >
            {photoPreview ? (
              <div className="relative w-full h-48">
                <Image 
                  src={photoPreview} 
                  alt="Giveaway preview" 
                  fill 
                  style={{ objectFit: 'contain' }} 
                  className="rounded-lg"
                />
              </div>
            ) : (
              <div className="py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p className="mt-2 text-sm text-gray-400">Click to upload a photo for your giveaway</p>
                <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
          >
            Create Giveaway
          </button>
        </div>
      </form>
    </div>
  );
}