"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { X, Save, Camera, Check, AlertCircle, ChevronRight, Trash2 } from 'lucide-react';

type EditPostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postType: 'raffle' | 'giveaway';
  onSaved?: () => void;
};

type PostData = {
  title: string;
  description: string;
  image_urls: string[];
  location_name: string;
  country_restriction: string;
};

const EditPostModal = ({ isOpen, onClose, postId, postType, onSaved }: EditPostModalProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [post, setPost] = useState<PostData>({
    title: '',
    description: '',
    image_urls: [],
    location_name: '',
    country_restriction: '',
  });

  // Non-editable fields for display
  const [prizeValue, setPrizeValue] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
  const [ticketsSold, setTicketsSold] = useState(0);

  useEffect(() => {
    if (!isOpen || !postId) return;
    setSaved(false);
    setError('');
    setConfirmDelete(false);

    const load = async () => {
      setLoading(true);
      const supabase = createClient();
      const table = postType === 'raffle' ? 'raffles' : 'giveaways';

      const { data, error: fetchError } = await supabase
        .from(table)
        .select('*')
        .eq('id', postId)
        .single();

      if (fetchError || !data) {
        setError('Post not found');
        setLoading(false);
        return;
      }

      setPost({
        title: data.title || '',
        description: data.description || '',
        image_urls: data.image_urls || data.images || [],
        location_name: data.location_name || '',
        country_restriction: data.country_restriction || '',
      });

      setPrizeValue(data.prize_value || 0);
      setTotalTickets(data.total_tickets || 0);
      setTicketsSold(data.tickets_sold || 0);
      setLoading(false);
    };

    load();
  }, [isOpen, postId, postType]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const supabase = createClient();
      const table = postType === 'raffle' ? 'raffles' : 'giveaways';

      const updateData: Record<string, any> = {
        title: post.title || null,
        description: post.description || null,
        updated_at: new Date().toISOString(),
      };

      if (postType === 'raffle') {
        updateData.image_urls = post.image_urls;
        updateData.location_name = post.location_name || null;
        updateData.country_restriction = post.country_restriction || null;
      } else {
        updateData.image_url = post.image_urls?.[0] || null;
      }

      const { error: updateError } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', postId);

      if (updateError) throw updateError;

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onSaved?.();
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setDeleting(true);
    try {
      const supabase = createClient();
      const table = postType === 'raffle' ? 'raffles' : 'giveaways';

      const { error: deleteError } = await supabase
        .from(table)
        .update({ status: 'deleted' })
        .eq('id', postId);

      if (deleteError) throw deleteError;

      onClose();
      onSaved?.();
    } catch (err: any) {
      setError(err.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const handleAddPhoto = () => {
    if (post.image_urls.length >= 10) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        setUploading(true);
        const supabase = createClient();
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('raffle-images')
          .upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage
          .from('raffle-images')
          .getPublicUrl(fileName);
        setPost(prev => ({ ...prev, image_urls: [...prev.image_urls, publicUrl] }));
      } catch (err) {
        setError('Failed to upload image');
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const removePhoto = (idx: number) => {
    setPost(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== idx),
    }));
  };

  if (!isOpen) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: '10px',
    background: 'rgba(15, 20, 25, 0.8)', border: '1px solid rgba(0,255,136,0.15)',
    color: '#fff', fontSize: '14px', fontFamily: "'Barlow', sans-serif",
    outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '12px', fontWeight: 600, color: '#718096',
    textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Barlow:wght@400;500;600;700&display=swap');
        .editpost-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(8px);
          z-index: 9999; display: flex; align-items: center; justify-content: center;
          padding: 20px; animation: epFadeIn 0.2s ease;
        }
        .editpost-container {
          width: 100%; max-width: 500px; max-height: 85vh;
          background: linear-gradient(135deg, #141a20 0%, #0f1419 100%);
          border: 1px solid rgba(0, 255, 136, 0.2); border-radius: 20px;
          overflow-y: auto; overflow-x: hidden;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 255, 136, 0.1);
          animation: epSlideUp 0.3s ease;
        }
        .editpost-container::-webkit-scrollbar { width: 4px; }
        .editpost-container::-webkit-scrollbar-thumb { background: rgba(0,255,136,0.2); border-radius: 4px; }
        @keyframes epFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes epSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="editpost-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="editpost-container">
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: '1px solid rgba(0,255,136,0.1)',
            position: 'sticky', top: 0, background: '#141a20', zIndex: 10,
          }}>
            <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '22px', color: '#fff', margin: 0 }}>
              Edit {postType === 'raffle' ? 'Raffle' : 'Giveaway'}
            </h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  background: saving ? 'rgba(0,255,136,0.2)' : 'linear-gradient(135deg, #00ff88 0%, #00ffaa 100%)',
                  border: 'none', borderRadius: '8px', padding: '8px 16px',
                  color: '#0f1419', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
                  fontSize: '13px', cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                {saving ? 'Saving...' : saved ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save</>}
              </button>
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={18} color="#718096" />
              </button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div style={{ margin: '12px 20px 0', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)', color: '#ff6b6b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}
          {saved && (
            <div style={{ margin: '12px 20px 0', padding: '10px 14px', borderRadius: '8px', background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={14} /> Post updated successfully!
            </div>
          )}

          {loading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid rgba(0,255,136,0.2)', borderTopColor: '#00ff88', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
              <div style={{ color: '#718096', fontSize: '14px' }}>Loading post...</div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Photos */}
              <div>
                <label style={labelStyle}>Photos</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {post.image_urls.map((url, i) => (
                    <div key={i} style={{ width: '68px', height: '68px', borderRadius: '10px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(0,255,136,0.15)' }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div onClick={() => removePhoto(i)} style={{ position: 'absolute', top: '-2px', right: '-2px', width: '18px', height: '18px', borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid #141a20' }}>
                        <X size={8} color="#fff" />
                      </div>
                      {i === 0 && <div style={{ position: 'absolute', bottom: '2px', left: 0, right: 0, textAlign: 'center', fontSize: '7px', fontWeight: 700, color: '#00ff88' }}>COVER</div>}
                    </div>
                  ))}
                  {post.image_urls.length < 10 && (
                    <div onClick={handleAddPhoto} style={{ width: '68px', height: '68px', borderRadius: '10px', border: '2px dashed rgba(0,255,136,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '2px' }}>
                      {uploading ? (
                        <div style={{ width: '14px', height: '14px', border: '2px solid rgba(0,255,136,0.2)', borderTopColor: '#00ff88', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      ) : (
                        <>
                          <Camera size={14} color="#718096" />
                          <span style={{ fontSize: '8px', color: '#718096' }}>Add</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label style={labelStyle}>Title</label>
                <input
                  style={inputStyle}
                  value={post.title}
                  onChange={(e) => setPost(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Raffle title"
                />
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' as const }}
                  value={post.description}
                  onChange={(e) => setPost(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the prize..."
                  maxLength={500}
                />
                <div style={{ textAlign: 'right', fontSize: '11px', color: '#4a5568', marginTop: '4px' }}>
                  {post.description.length}/500
                </div>
              </div>

              {/* Non-editable fields */}
              <div style={{ background: 'rgba(15, 20, 25, 0.6)', borderRadius: '12px', border: '1px solid rgba(0,255,136,0.08)', padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                  Cannot be modified
                </div>
                {[
                  ['Prize Value', `$${prizeValue.toLocaleString()}`],
                  ['Total Tickets', totalTickets.toLocaleString()],
                  ['Tickets Sold', ticketsSold.toLocaleString()],
                  ['Ticket Price', '1 USDC'],
                ].map(([k, v], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 3 ? '1px solid rgba(0,255,136,0.06)' : 'none' }}>
                    <span style={{ fontSize: '13px', color: '#718096' }}>{k}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Delete Post */}
              <div style={{ borderTop: '1px solid rgba(255,59,48,0.2)', paddingTop: '20px' }}>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '12px',
                    background: confirmDelete ? '#ef4444' : 'rgba(255, 59, 48, 0.08)',
                    border: confirmDelete ? 'none' : '1px solid rgba(255, 59, 48, 0.2)',
                    color: confirmDelete ? '#fff' : '#ff3b30',
                    fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
                    fontSize: '14px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}
                >
                  <Trash2 size={16} />
                  {deleting ? 'Deleting...' : confirmDelete ? 'Confirm Delete (cannot be undone)' : 'Delete Post'}
                </button>
                {confirmDelete && !deleting && (
                  <button
                    onClick={() => setConfirmDelete(false)}
                    style={{ width: '100%', padding: '10px', background: 'transparent', border: 'none', color: '#718096', fontSize: '12px', cursor: 'pointer', marginTop: '8px' }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EditPostModal;
