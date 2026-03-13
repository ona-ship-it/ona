"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { X, Save, Upload } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSaved: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  userId,
  onSaved,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    twitter_url: '',
    instagram_url: '',
    tiktok_url: '',
    website_url: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  useEffect(() => {
    if (isOpen && userId) {
      loadProfileData();
    }
  }, [isOpen, userId]);

  const loadProfileData = async () => {
    const supabase = createClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        twitter_url: profile.twitter_url || '',
        instagram_url: profile.instagram_url || '',
        tiktok_url: profile.tiktok_url || '',
        website_url: profile.website_url || '',
      });
      setAvatarPreview(profile.avatar_url || '');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      let avatarUrl = formData.avatar_url || '';

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${userId}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        avatarUrl = publicUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: formData.full_name,
          bio: formData.bio,
          twitter_url: formData.twitter_url || null,
          instagram_url: formData.instagram_url || null,
          tiktok_url: formData.tiktok_url || null,
          website_url: formData.website_url || null,
          avatar_url: avatarUrl || null,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      onSaved();
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(20, 26, 32, 0.95) 0%, rgba(15, 20, 25, 0.98) 100%)',
        border: '1px solid rgba(0, 255, 136, 0.3)',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: '#718096',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#00ff88'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#718096'}
        >
          <X size={24} />
        </button>

        <h2 style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: '28px',
          fontWeight: '700',
          color: '#ffffff',
          marginBottom: '24px',
          textAlign: 'center',
        }}>
          Edit Profile
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Avatar Upload */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '3px solid #00ff88',
              margin: '0 auto 16px',
              overflow: 'hidden',
              background: '#1a202c',
            }}>
              <img
                src={avatarPreview || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=120&h=120&fit=crop&crop=face'}
                alt="Avatar preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <label style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(0, 255, 136, 0.1)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              padding: '10px 16px',
              borderRadius: '10px',
              cursor: 'pointer',
              color: '#00ff88',
              fontWeight: '600',
              transition: 'all 0.3s ease',
            }}>
              <Upload size={16} />
              Change Avatar
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {/* Form Fields */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#a0aec0',
              marginBottom: '8px',
            }}>
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(15, 20, 25, 0.9)',
                border: '1px solid rgba(0, 255, 136, 0.2)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.3s ease',
              }}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#a0aec0',
              marginBottom: '8px',
            }}>
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(15, 20, 25, 0.9)',
                border: '1px solid rgba(0, 255, 136, 0.2)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '16px',
                outline: 'none',
                minHeight: '80px',
                resize: 'vertical',
                transition: 'border-color 0.3s ease',
              }}
              placeholder="Tell us about yourself..."
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#a0aec0',
              marginBottom: '8px',
            }}>
              Twitter URL
            </label>
            <input
              type="url"
              value={formData.twitter_url}
              onChange={(e) => handleInputChange('twitter_url', e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(15, 20, 25, 0.9)',
                border: '1px solid rgba(0, 255, 136, 0.2)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.3s ease',
              }}
              placeholder="https://twitter.com/username"
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#a0aec0',
              marginBottom: '8px',
            }}>
              Instagram URL
            </label>
            <input
              type="url"
              value={formData.instagram_url}
              onChange={(e) => handleInputChange('instagram_url', e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(15, 20, 25, 0.9)',
                border: '1px solid rgba(0, 255, 136, 0.2)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.3s ease',
              }}
              placeholder="https://instagram.com/username"
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#a0aec0',
              marginBottom: '8px',
            }}>
              TikTok URL
            </label>
            <input
              type="url"
              value={formData.tiktok_url}
              onChange={(e) => handleInputChange('tiktok_url', e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(15, 20, 25, 0.9)',
                border: '1px solid rgba(0, 255, 136, 0.2)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.3s ease',
              }}
              placeholder="https://tiktok.com/@username"
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#a0aec0',
              marginBottom: '8px',
            }}>
              Website URL
            </label>
            <input
              type="url"
              value={formData.website_url}
              onChange={(e) => handleInputChange('website_url', e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(15, 20, 25, 0.9)',
                border: '1px solid rgba(0, 255, 136, 0.2)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.3s ease',
              }}
              placeholder="https://yourwebsite.com"
            />
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '24px',
          }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px 24px',
                background: 'transparent',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                borderRadius: '10px',
                color: '#718096',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #00ff88 0%, #00ffaa 100%)',
                border: 'none',
                borderRadius: '10px',
                color: '#0f1419',
                fontSize: '16px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(15, 20, 25, 0.3)',
                    borderTop: '2px solid #0f1419',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;