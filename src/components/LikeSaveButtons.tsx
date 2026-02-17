'use client';

import { useEffect, useState } from 'react';
import { Heart, Bookmark } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface LikeSaveButtonsProps {
  postId: string;
  postType: 'giveaway' | 'raffle' | 'fundraiser' | 'marketplace';
  initialLiked?: boolean;
  initialSaved?: boolean;
  initialLikeCount?: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function LikeSaveButtons({
  postId,
  postType,
  initialLiked = false,
  initialSaved = false,
  initialLikeCount = 0,
  showCount = true,
  size = 'md'
}: LikeSaveButtonsProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [saved, setSaved] = useState(initialSaved);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
    void checkUserState();
  }, [postId, postType]);

  const checkUserState = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: likeData } = await supabase
      .from('post_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .eq('post_type', postType)
      .single();

    setLiked(Boolean(likeData));

    const { data: saveData } = await supabase
      .from('post_saves')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .eq('post_type', postType)
      .single();

    setSaved(Boolean(saveData));

    const { count } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
      .eq('post_type', postType);

    if (count !== null) setLikeCount(count);
  };

  const handleLike = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please sign in to like posts');
      return;
    }

    setLoading(true);

    if (liked) {
      await supabase
        .from('post_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .eq('post_type', postType);

      setLiked(false);
      setLikeCount((prev) => Math.max(0, prev - 1));
    } else {
      await supabase
        .from('post_likes')
        .insert({
          user_id: user.id,
          post_id: postId,
          post_type: postType
        });

      setLiked(true);
      setLikeCount((prev) => prev + 1);
    }

    setLoading(false);
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please sign in to save posts');
      return;
    }

    setLoading(true);

    if (saved) {
      await supabase
        .from('post_saves')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .eq('post_type', postType);

      setSaved(false);
    } else {
      await supabase
        .from('post_saves')
        .insert({
          user_id: user.id,
          post_id: postId,
          post_type: postType
        });

      setSaved(true);
    }

    setLoading(false);
  };

  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 24 : 20;

  return (
    <>
      <div className="like-save-buttons">
        <button
          onClick={handleLike}
          disabled={loading}
          className={`action-btn like-btn ${liked ? 'liked' : ''} size-${size}`}
          aria-label={liked ? 'Unlike' : 'Like'}
          type="button"
        >
          <Heart
            size={iconSize}
            fill={liked ? 'currentColor' : 'none'}
            strokeWidth={2.5}
          />
          {showCount && likeCount > 0 && (
            <span className="count">{likeCount}</span>
          )}
        </button>

        <button
          onClick={handleSave}
          disabled={loading}
          className={`action-btn save-btn ${saved ? 'saved' : ''} size-${size}`}
          aria-label={saved ? 'Unsave' : 'Save'}
          type="button"
        >
          <Bookmark
            size={iconSize}
            fill={saved ? 'currentColor' : 'none'}
            strokeWidth={2.5}
          />
        </button>
      </div>

      <style jsx>{`
        .like-save-buttons {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 0.875rem;
          font-weight: 600;
        }

        .action-btn:hover {
          background: rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }

        .action-btn:active {
          transform: scale(0.95);
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .like-btn.liked {
          color: #ff6b6b;
          background: rgba(255, 107, 107, 0.1);
          border-color: rgba(255, 107, 107, 0.3);
        }

        .like-btn.liked :global(svg) {
          animation: heartbeat 0.5s ease;
        }

        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.2); }
          50% { transform: scale(0.95); }
        }

        .like-btn:hover {
          color: #ff6b6b;
        }

        .save-btn.saved {
          color: #00D4D4;
          background: rgba(0, 212, 212, 0.1);
          border-color: rgba(0, 212, 212, 0.3);
        }

        .save-btn.saved :global(svg) {
          animation: bookmark 0.3s ease;
        }

        @keyframes bookmark {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .save-btn:hover {
          color: #00D4D4;
        }

        .count {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.125rem 0.375rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 0.25rem;
        }

        .action-btn.size-sm {
          padding: 0.375rem;
          gap: 0.375rem;
        }

        .action-btn.size-lg {
          padding: 0.625rem;
          gap: 0.625rem;
        }

        @media (max-width: 768px) {
          .action-btn {
            min-width: 44px;
            min-height: 44px;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}
