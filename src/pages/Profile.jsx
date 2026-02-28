import { useRef, useState } from 'react'
import { supabase } from '../supabase'
import '../styles/profile.css'

async function uploadAvatar(userId, file) {
  const ext = file.name.split('.').pop()
  const path = `${userId}/avatar.${ext}`
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })
  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(path)

  await supabase.from('profiles').upsert({ id: userId, avatar_url: publicUrl })
  return publicUrl
}

export default function Profile({ user, avatarUrl, onAvatarUpdate, onDisplayNameUpdate }) {
  const fileRef = useRef()
  const [uploading, setUploading] = useState(false)
  const [avatarSuccess, setAvatarSuccess] = useState(false)

  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(user.displayName || user.name)
  const [nameSaving, setNameSaving] = useState(false)
  const [nameSuccess, setNameSuccess] = useState(false)
  const [nameError, setNameError] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setAvatarSuccess(false)
    try {
      const url = await uploadAvatar(user.id, file)
      onAvatarUpdate(url)
      setAvatarSuccess(true)
      setTimeout(() => setAvatarSuccess(false), 3000)
    } catch (err) {
      console.error('Upload failed:', err)
      alert('Upload failed. Check your Supabase storage bucket.')
    }
    setUploading(false)
  }

  const saveName = async () => {
    if (!nameInput.trim()) {
      setNameError('Name cannot be empty.')
      return
    }
    setNameSaving(true)
    setNameError('')
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, display_name: nameInput.trim() })
    if (error) {
      setNameError('Failed to save. Try again.')
    } else {
      onDisplayNameUpdate(nameInput.trim())
      setEditingName(false)
      setNameSuccess(true)
      setTimeout(() => setNameSuccess(false), 3000)
    }
    setNameSaving(false)
  }

  return (
    <div className="profile-page">
      <div className="profile-page-inner">
        <h1 className="profile-title">Profile</h1>

        {/* Avatar */}
        <div className="profile-hero">
          <div className="profile-avatar-wrap">
            {avatarUrl ? (
              <img src={avatarUrl} alt={user.displayName} className="profile-avatar-lg" />
            ) : (
              <div className="profile-initial-lg">
                {(user.displayName || user.name)?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <button
              className="profile-upload-btn"
              onClick={() => fileRef.current.click()}
              disabled={uploading}
            >
              {uploading ? '⏳ Uploading...' : '📷 Change Photo'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          </div>
          {avatarSuccess && <p className="profile-success">✅ Profile picture updated!</p>}
          {nameSuccess  && <p className="profile-success">✅ Display name updated!</p>}
        </div>

        {/* Info */}
        <div className="profile-card">
          <h2>Account Info</h2>

          {/* Display name — editable */}
          <div className="profile-field">
            <label>Display Name</label>
            {editingName ? (
              <div className="profile-name-edit">
                <input
                  className="profile-name-input"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveName()}
                  autoFocus
                />
                <button className="profile-save-btn" onClick={saveName} disabled={nameSaving}>
                  {nameSaving ? '...' : 'Save'}
                </button>
                <button className="profile-cancel-btn" onClick={() => { setEditingName(false); setNameInput(user.displayName || user.name); setNameError('') }}>
                  Cancel
                </button>
              </div>
            ) : (
              <div className="profile-name-row">
                <span>{user.displayName || user.name}</span>
                <button className="profile-edit-btn" onClick={() => setEditingName(true)}>✏️ Edit</button>
              </div>
            )}
          </div>
          {nameError && <p className="profile-error">{nameError}</p>}

          <div className="profile-field">
            <label>Email</label>
            <span>{user.email}</span>
          </div>
          <div className="profile-field">
            <label>Member Since</label>
            <span>Nicktopia Founder Era 🐾</span>
          </div>
        </div>

        {/* Bruno */}
        <div className="profile-bruno-note">
          <img src="/HappyBruno.jpg" alt="Bruno" className="profile-bruno-img" />
          <p>Bruno has reviewed your profile and given it <strong>5/5 bones.</strong></p>
        </div>
      </div>
    </div>
  )
}