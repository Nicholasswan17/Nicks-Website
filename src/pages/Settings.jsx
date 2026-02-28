import { useState } from 'react'
import { supabase } from '../supabase'
import '../styles/settings.css'

export default function Settings({ user }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwStatus, setPwStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const changePassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPwStatus({ ok: false, msg: "Passwords don't match." })
      return
    }
    if (newPassword.length < 6) {
      setPwStatus({ ok: false, msg: 'Password must be at least 6 characters.' })
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPwStatus({ ok: false, msg: error.message })
    } else {
      setPwStatus({ ok: true, msg: 'Password updated successfully!' })
      setNewPassword('')
      setConfirmPassword('')
    }
    setLoading(false)
    setTimeout(() => setPwStatus(null), 4000)
  }

  return (
    <div className="settings-page">
      <div className="settings-inner">
        <h1 className="settings-title">Settings</h1>

        <div className="settings-card">
          <h2>🔒 Change Password</h2>
          <form onSubmit={changePassword} className="settings-form">
            <div className="settings-field">
              <label>New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>
            <div className="settings-field">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>
            {pwStatus && (
              <p className={`settings-status ${pwStatus.ok ? 'ok' : 'err'}`}>
                {pwStatus.msg}
              </p>
            )}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        <div className="settings-card">
          <h2>👤 Account</h2>
          <div className="settings-info-row">
            <span className="settings-info-label">Email</span>
            <span className="settings-info-val">{user.email}</span>
          </div>
          <div className="settings-info-row">
            <span className="settings-info-label">Display Name</span>
            <span className="settings-info-val">{user.displayName || user.name}</span>
          </div>
        </div>

        <div className="settings-card danger-zone">
          <h2>⚠️ Danger Zone</h2>
          <p>Deleting your account is permanent. Bruno will be devastated.</p>
          <button className="btn-danger" disabled>Delete Account (coming soon)</button>
        </div>
      </div>
    </div>
  )
}