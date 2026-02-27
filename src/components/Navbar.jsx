import { NavLink } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  return (
    <header className="site-header">
      <h1>The Dachshund Dynasty</h1>
      <nav className="navbar">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
        <NavLink to="/general" className={({ isActive }) => isActive ? 'active' : ''}>General</NavLink>
        <NavLink to="/history" className={({ isActive }) => isActive ? 'active' : ''}>History</NavLink>
        <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>Contact</NavLink>
      </nav>
    </header>
  )
}
