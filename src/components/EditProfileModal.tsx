"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import {
  X, Camera, User, Mail, Phone, FileText, Globe,
  Twitter, Instagram, Music2, Youtube, Eye, EyeOff,
  Save, Shield, Bell, Link2, Moon, Sun, HelpCircle,
  MessageSquare, FileCheck, Lock, ChevronRight, LogOut,
  Settings, Smartphone, Check, AlertCircle
} from 'lucide-react';

type EditProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSaved?: () => void;
};

type ProfileData = {
  full_name: string;
  bio: string;
  phone_number: string;
  avatar_url: string;
  twitter_url: string;
  instagram_url: string;
  tiktok_url: string;
  youtube_url: string;
  website_url: string;
  facebook_url: string;
  email: string;
};

type PrivacySettings = {
  show_name: boolean;
  show_phone: boolean;
  show_email: boolean;
};

type ActiveView = 'menu' | 'profile' | 'social' | 'privacy' | 'notifications' | 'security';

const EditProfileModal = ({ isOpen, onClose, userId, onSaved }: EditProfileModalProps) => {
  const [activeView, setActiveView] = useState<ActiveView>('menu');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');

  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    bio: '',
    phone_number: '',
    avatar_url: '',
    twitter_url: '',
    instagram_url: '',
    tiktok_url: '',
    youtube_url: '',
    website_url: '',
    facebook_url: '',
    email: '',
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    show_name: true,
    show_phone: false,
    show_email: false,
  });

  useEffect(() => {
    if (!isOpen || !userId) return;
    setActiveView('menu');
    setSaved(false);
    setError('');

    const load = async () => {
      setLoading(true);
      const supabase = createClient();

      const [{ data: profileRow }, { data: onaguiRow }] = await Promise.all([
        supabase
          .from('profiles')
          .select('full_name, bio, phone_number, avatar_url, email, twitter_url, instagram_url, tiktok_url, youtube_url, website_url, facebook_url')
          .eq('id', userId)
          .single(),
        supabase
          .from('onagui_profiles')
          .select('username')
          .eq('id', userId)
          .single(),
      ]);

      if (profileRow) {
        setProfile({
          full_name: profileRow.full_name || '',
          bio: profileRow.bio || '',
          phone_number: profileRow.phone_number || '',
          avatar_url: profileRow.avatar_url || '',
          twitter_url: profileRow.twitter_url || '',
          instagram_url: profileRow.instagram_url || '',
          tiktok_url: profileRow.tiktok_url || '',
          youtube_url: profileRow.youtube_url || '',
          website_url: profileRow.website_url || '',
          facebook_url: profileRow.facebook_url || '',
          email: profileRow.email || '',
        });
      }

      if (onaguiRow) {
        setUsername(onaguiRow.username || '');
      }

      setLoading(false);
    };

    load();
  }, [isOpen, userId]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const supabase = createClient();

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name || null,
          bio: profile.bio || null,
          phone_number: profile.phone_number || null,
          avatar_url: profile.avatar_url || null,
          twitter_url: profile.twitter_url || null,
          instagram_url: profile.instagram_url || null,
          tiktok_url: profile.tiktok_url || null,
          youtube_url: profile.youtube_url || null,
          website_url: profile.website_url || null,
          facebook_url: profile.facebook_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      if (profile.full_name) {
        await supabase
          .from('onagui_profiles')
          .update({ full_name: profile.full_name })
          .eq('id', userId);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onSaved?.();
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const filePath = `avatars/${userId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setError('Failed to upload avatar');
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
  };

  if (!isOpen) return null;

  const menuItems = [
    {
      section: 'ACCOUNT',
      items: [
        { icon: <User size={20} />, label: 'Edit Profile', view: 'profile' as ActiveView, chevron: true },
        { icon: <Link2 size={20} />, label: 'Social Links', view: 'social' as ActiveView, chevron: true },
        { icon: <Eye size={20} />, label: 'Privacy', view: 'privacy' as ActiveView, chevron: true },
        { icon: <Bell size={20} />, label: 'Notifications', view: 'notifications' as ActiveView, chevron: true },
      ]
    },
    {
      section: 'SECURITY',
      items: [
        { icon: <Shield size={20} />, label: 'Security', view: 'security' as ActiveView, chevron: true },
        { icon: <Mail size={20} />, label: 'Email Verification', view: null, right: <span style={{ color: '#00ff88', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600 }}><Check size={14} /> Verified</span> },
        { icon: <Smartphone size={20} />, label: '2FA', view: 'security' as ActiveView, chevron: true },
      ]
    },
    {
      section: 'PREFERENCES',
      items: [
        { icon: <Moon size={20} />, label: 'Dark Mode', view: null, right: <div style={{ width: '44px', height: '24px', borderRadius: '12px', background: '#00ff88', position: 'relative' as const, cursor: 'pointer' }}><div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute' as const, top: '2px', right: '2px', transition: 'all 0.2s' }} /></div> },
        { icon: <Globe size={20} />, label: 'Language', view: null, right: <span style={{ color: '#718096', fontSize: '14px' }}>English</span> },
        { icon: <FileText size={20} />, label: 'Currency', view: null, right: <span style={{ color: '#718096', fontSize: '14px' }}>USD</span> },
      ]
    },
    {
      section: 'SUPPORT',
      items: [
        { icon: <HelpCircle size={20} />, label: 'Help Center', view: null, chevron: true },
        { icon: <MessageSquare size={20} />, label: 'Contact Support', view: null, chevron: true },
        { icon: <FileCheck size={20} />, label: 'Terms of Service', view: null, chevron: true },
        { icon: <Lock size={20} />, label: 'Privacy Policy', view: null, chevron: true },
      ]
    },
  ];

  const renderMenu = () => (
    <div>
      {/* User header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '20px', borderBottom: '1px solid rgba(0,255,136,0.1)', cursor: 'pointer' }} onClick={() => setActiveView('profile')}>
        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: '2px solid #00ff88', overflow: 'hidden', flexShrink: 0 }}>
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={24} color="#fff" />
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '18px', color: '#fff' }}>{profile.full_name || username || 'Set up profile'}</div>
          <div style={{ fontSize: '13px', color: '#718096' }}>{profile.email}</div>
        </div>
        <ChevronRight size={18} color="#718096" />
      </div>

      {/* Menu sections */}
      {menuItems.map((section) => (
        <div key={section.section}>
          <div style={{ padding: '16px 20px 8px', fontSize: '11px', fontWeight: 700, color: '#00ff88', letterSpacing: '1.5px', textTransform: 'uppercase' as const }}>
            {section.section}
          </div>
          <div style={{ margin: '0 12px', background: 'rgba(20, 26, 32, 0.6)', borderRadius: '12px', border: '1px solid rgba(0,255,136,0.08)', overflow: 'hidden' }}>
            {section.items.map((item, idx) => (
              <div
                key={item.label}
                onClick={() => item.view ? setActiveView(item.view) : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
                  cursor: item.view ? 'pointer' : 'default',
                  borderBottom: idx < section.items.length - 1 ? '1px solid rgba(0,255,136,0.06)' : 'none',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => { if (item.view) e.currentTarget.style.background = 'rgba(0,255,136,0.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ color: '#718096' }}>{item.icon}</span>
                <span style={{ flex: 1, fontSize: '15px', fontWeight: 500, color: '#e2e8f0' }}>{item.label}</span>
                {item.right && item.right}
                {item.chevron && <ChevronRight size={16} color="#4a5568" />}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Log Out */}
      <div style={{ padding: '20px 12px' }}>
        <button style={{
          width: '100%', padding: '14px', borderRadius: '12px',
          background: 'rgba(255, 59, 48, 0.08)', border: '1px solid rgba(255, 59, 48, 0.2)',
          color: '#ff3b30', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
          fontSize: '15px', letterSpacing: '1px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          transition: 'all 0.2s',
        }}>
          <LogOut size={18} /> Log Out
        </button>
      </div>

      <div style={{ textAlign: 'center', padding: '0 0 20px', fontSize: '12px', color: '#4a5568' }}>
        Onagui v1.0.0
      </div>
    </div>
  );

  const renderBackHeader = (title: string) => (
    <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(0,255,136,0.1)', gap: '12px' }}>
      <button onClick={() => setActiveView('menu')} style={{ background: 'none', border: 'none', color: '#00ff88', cursor: 'pointer', padding: '4px', display: 'flex' }}>
        <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
      </button>
      <h3 style={{ flex: 1, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '20px', color: '#fff', margin: 0 }}>{title}</h3>
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          background: saving ? 'rgba(0,255,136,0.2)' : 'linear-gradient(135deg, #00ff88 0%, #00ffaa 100%)',
          border: 'none', borderRadius: '8px', padding: '8px 16px',
          color: '#0f1419', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
          fontSize: '13px', letterSpacing: '0.5px', cursor: saving ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}
      >
        {saving ? 'Saving...' : saved ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save</>}
      </button>
    </div>
  );

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: '10px',
    background: 'rgba(15, 20, 25, 0.8)', border: '1px solid rgba(0,255,136,0.15)',
    color: '#fff', fontSize: '14px', fontFamily: "'Barlow', sans-serif",
    outline: 'none', transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '12px', fontWeight: 600, color: '#718096',
    textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '6px',
  };

  const renderProfileEdit = () => (
    <div>
      {renderBackHeader('Edit Profile')}
      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Avatar */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: '3px solid #00ff88', overflow: 'hidden',
              boxShadow: '0 0 30px rgba(0,255,136,0.3)',
            }}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={40} color="#fff" />
                </div>
              )}
            </div>
            <label style={{
              position: 'absolute', bottom: '0', right: '0',
              width: '32px', height: '32px', borderRadius: '50%',
              background: '#00ff88', border: '2px solid #0f1419',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,255,136,0.4)',
            }}>
              <Camera size={16} color="#0f1419" />
              <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        {/* Username (read-only) */}
        <div>
          <label style={labelStyle}>Username</label>
          <div style={{ ...inputStyle, background: 'rgba(15, 20, 25, 0.4)', color: '#4a5568', cursor: 'not-allowed' }}>
            @{username || 'not set'}
          </div>
        </div>

        {/* Display Name */}
        <div>
          <label style={labelStyle}>Display Name</label>
          <input
            style={inputStyle}
            value={profile.full_name}
            onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
            placeholder="Your display name"
            onFocus={(e) => e.target.style.borderColor = 'rgba(0,255,136,0.5)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(0,255,136,0.15)'}
          />
        </div>

        {/* Bio */}
        <div>
          <label style={labelStyle}>Bio</label>
          <textarea
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' as const }}
            value={profile.bio}
            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell people about yourself..."
            maxLength={300}
            onFocus={(e) => e.target.style.borderColor = 'rgba(0,255,136,0.5)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(0,255,136,0.15)'}
          />
          <div style={{ textAlign: 'right', fontSize: '11px', color: '#4a5568', marginTop: '4px' }}>
            {profile.bio.length}/300
          </div>
        </div>

        {/* Email (read-only) */}
        <div>
          <label style={labelStyle}>Email <span style={{ color: '#4a5568', fontWeight: 400, textTransform: 'none' as const }}>(cannot be changed)</span></label>
          <div style={{ ...inputStyle, background: 'rgba(15, 20, 25, 0.4)', color: '#4a5568', cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={14} />
            {profile.email || 'Not set'}
          </div>
        </div>

        {/* Phone */}
        <div>
          <label style={labelStyle}>Phone Number</label>
          <input
            style={inputStyle}
            value={profile.phone_number}
            onChange={(e) => setProfile(prev => ({ ...prev, phone_number: e.target.value }))}
            placeholder="+1 234 567 8900"
            onFocus={(e) => e.target.style.borderColor = 'rgba(0,255,136,0.5)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(0,255,136,0.15)'}
          />
        </div>
      </div>
    </div>
  );

  const socialFields = [
    { key: 'twitter_url', label: 'Twitter / X', icon: <Twitter size={18} />, placeholder: 'https://x.com/yourhandle', color: '#1DA1F2' },
    { key: 'instagram_url', label: 'Instagram', icon: <Instagram size={18} />, placeholder: 'https://instagram.com/yourhandle', color: '#E4405F' },
    { key: 'tiktok_url', label: 'TikTok', icon: <Music2 size={18} />, placeholder: 'https://tiktok.com/@yourhandle', color: '#00f2ea' },
    { key: 'youtube_url', label: 'YouTube', icon: <Youtube size={18} />, placeholder: 'https://youtube.com/@yourchannel', color: '#FF0000' },
    { key: 'website_url', label: 'Website', icon: <Globe size={18} />, placeholder: 'https://yourwebsite.com', color: '#00ff88' },
    { key: 'facebook_url', label: 'Facebook', icon: <Globe size={18} />, placeholder: 'https://facebook.com/yourpage', color: '#1877F2' },
  ];

  const renderSocialLinks = () => (
    <div>
      {renderBackHeader('Social Links')}
      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ fontSize: '13px', color: '#718096', margin: '0 0 8px' }}>
          Add your social media links so followers can find you everywhere.
        </p>
        {socialFields.map((field) => (
          <div key={field.key}>
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: field.color }}>{field.icon}</span>
              {field.label}
            </label>
            <input
              style={inputStyle}
              value={(profile as any)[field.key] || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, [field.key]: e.target.value }))}
              placeholder={field.placeholder}
              onFocus={(e) => e.target.style.borderColor = field.color}
              onBlur={(e) => e.target.style.borderColor = 'rgba(0,255,136,0.15)'}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div>
      {renderBackHeader('Privacy')}
      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <p style={{ fontSize: '13px', color: '#718096', margin: '0 0 16px' }}>
          Control what information is visible on your public profile.
        </p>
        <div style={{ background: 'rgba(20, 26, 32, 0.6)', borderRadius: '12px', border: '1px solid rgba(0,255,136,0.08)', overflow: 'hidden' }}>
          {[
            { key: 'show_name', label: 'Show Display Name', desc: 'Your name will appear on your profile' },
            { key: 'show_phone', label: 'Show Phone Number', desc: 'Other users can see your phone' },
            { key: 'show_email', label: 'Show Email Address', desc: 'Your email will be visible publicly' },
          ].map((item, idx) => (
            <div key={item.key} style={{
              display: 'flex', alignItems: 'center', padding: '16px',
              borderBottom: idx < 2 ? '1px solid rgba(0,255,136,0.06)' : 'none',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 500, color: '#e2e8f0', marginBottom: '2px' }}>{item.label}</div>
                <div style={{ fontSize: '12px', color: '#4a5568' }}>{item.desc}</div>
              </div>
              <div
                onClick={() => setPrivacy(prev => ({ ...prev, [item.key]: !(prev as any)[item.key] }))}
                style={{
                  width: '44px', height: '24px', borderRadius: '12px',
                  background: (privacy as any)[item.key] ? '#00ff88' : 'rgba(74, 85, 104, 0.5)',
                  position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
                }}
              >
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: '2px',
                  left: (privacy as any)[item.key] ? '22px' : '2px',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPlaceholder = (title: string) => (
    <div>
      {renderBackHeader(title)}
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <Settings size={48} color="#4a5568" style={{ marginBottom: '16px' }} />
        <div style={{ fontSize: '16px', color: '#718096', fontWeight: 500 }}>Coming Soon</div>
        <div style={{ fontSize: '13px', color: '#4a5568', marginTop: '8px' }}>This feature is under development.</div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Barlow:wght@400;500;600;700&display=swap');
        .edit-modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(8px);
          z-index: 9999; display: flex; align-items: center; justify-content: center;
          padding: 20px; animation: fadeIn 0.2s ease;
        }
        .edit-modal-container {
          width: 100%; max-width: 440px; max-height: 85vh;
          background: linear-gradient(135deg, #141a20 0%, #0f1419 100%);
          border: 1px solid rgba(0, 255, 136, 0.2); border-radius: 20px;
          overflow-y: auto; overflow-x: hidden;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 255, 136, 0.1);
          animation: slideUp 0.3s ease;
        }
        .edit-modal-container::-webkit-scrollbar { width: 4px; }
        .edit-modal-container::-webkit-scrollbar-track { background: transparent; }
        .edit-modal-container::-webkit-scrollbar-thumb { background: rgba(0,255,136,0.2); border-radius: 4px; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="edit-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="edit-modal-container">
          {/* Header bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: '1px solid rgba(0,255,136,0.1)',
            position: 'sticky', top: 0, background: '#141a20', zIndex: 10,
          }}>
            <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '22px', color: '#fff', margin: 0, letterSpacing: '1px' }}>
              {activeView === 'menu' ? 'Settings' : ''}
            </h2>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
              <X size={18} color="#718096" />
            </button>
          </div>

          {/* Error / Success */}
          {error && (
            <div style={{ margin: '12px 20px 0', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)', color: '#ff6b6b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}
          {saved && activeView === 'menu' && (
            <div style={{ margin: '12px 20px 0', padding: '10px 14px', borderRadius: '8px', background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={14} /> Profile updated successfully!
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid rgba(0,255,136,0.2)', borderTopColor: '#00ff88', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
              <div style={{ color: '#718096', fontSize: '14px' }}>Loading profile...</div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <>
              {activeView === 'menu' && renderMenu()}
              {activeView === 'profile' && renderProfileEdit()}
              {activeView === 'social' && renderSocialLinks()}
              {activeView === 'privacy' && renderPrivacy()}
              {activeView === 'notifications' && renderPlaceholder('Notifications')}
              {activeView === 'security' && renderPlaceholder('Security')}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default EditProfileModal;
