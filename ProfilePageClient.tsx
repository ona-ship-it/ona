      {followingList.length >= followingCount && followingCount > 0 && (<div className="empty-community" style={{ marginTop: '16px' }}>End of following list</div>)}
    </div>
  )}
</div>
</div>
<EditProfileModal
  isOpen={showEditModal}
  onClose={() => setShowEditModal(false)}
  userId={profileData?.id || ''}
  onSaved={() => window.location.reload()}
/>
</>
};