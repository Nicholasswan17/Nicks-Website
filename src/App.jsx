import { useState } from 'react'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Navbar from './components/Navbar'
import './styles/global.css'

export default function App() {
  const [user, setUser] = useState(null)
  const [showLogin, setShowLogin] = useState(false)

  const handleLogin = (userData) => {
    setUser(userData)
    setShowLogin(false)
  }

  const handleLogout = () => {
    setUser(null)
  }

  if (showLogin) {
    return <Login onLogin={handleLogin} onBack={() => setShowLogin(false)} />
  }

  if (!user) {
    return <Landing onEnter={() => setShowLogin(true)} />
  }

  return (
    <div className="app">
      <Navbar user={user} onLogout={handleLogout} />
      <Dashboard user={user} />
    </div>
  )
}
