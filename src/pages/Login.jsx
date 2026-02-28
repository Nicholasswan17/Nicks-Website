import { useState } from 'react'
import { supabase } from '../supabase'
import '../styles/login.css'

export default function Login({ onLogin, onBack }) {
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 600)
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!form.email || !form.password) {
      setError('Fill in all the fields. Bruno is watching.')
      triggerShake()
      setLoading(false)
      return
    }

    if (tab === 'signup') {
      if (!form.name) {
        setError("We need your name. Bruno needs to know who you are.")
        triggerShake()
        setLoading(false)
        return
      }
      const { data, error: err } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.name } }
      })
      if (err) {
        setError(err.message)
        triggerShake()
      } else {
        onLogin({ name: form.name, email: form.email, id: data.user.id })
      }
    } else {
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (err) {
        setError(err.message)
        triggerShake()
      } else {
        const name = data.user.user_metadata?.full_name || data.user.email.split('@')[0]
        onLogin({ name, email: data.user.email, id: data.user.id })
      }
    }
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-bg" />
      <button className="login-back" onClick={onBack}>← Back</button>
      <div className={`login-card ${shake ? 'shake' : ''}`}>
        <div className="login-bruno">
          <img
            src={error ? '/AngryBrunie-removebg-preview.png' : '/TiredBruno-removebg-preview.png'}
            alt="Bruno"
            className="login-bruno-img"
          />
          {error && <div className="login-bruno-speech">{error}</div>}
        </div>

        <div className="login-form-area">
          <img src="/NLogo1.png" alt="Nicktopia" className="login-logo" />
          <div className="login-tabs">
            <button className={`login-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError('') }}>Login</button>
            <button className={`login-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); setError('') }}>Sign Up</button>
          </div>

          <form onSubmit={submit} className="login-form">
            {tab === 'signup' && (
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" placeholder="Your name" value={form.name} onChange={handle} autoComplete="name" />
              </div>
            )}
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" placeholder="you@email.com" value={form.email} onChange={handle} autoComplete="email" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" placeholder="••••••••" value={form.password} onChange={handle} autoComplete={tab === 'login' ? 'current-password' : 'new-password'} />
            </div>

            <button type="submit" className="btn-primary login-submit" disabled={loading}>
              {loading ? 'Loading...' : tab === 'login' ? 'Enter Nicktopia' : 'Create Account'}
            </button>

            <div className="login-divider"><span>or</span></div>

            <button type="button" className="btn-google">
              <img src="https://www.google.com/favicon.ico" alt="G" />
              Continue with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}