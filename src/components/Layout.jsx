import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'

function Layout({ children }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>Sentiment Analysis</h2>
          <p>E-Consultant</p>
        </div>

        <div className="sidebar-menu">
          <button
            className={`menu-item ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`menu-item ${isActive('/analysis') ? 'active' : ''}`}
            onClick={() => navigate('/analysis')}
          >
            🔍 Analysis
          </button>
          <button
            className={`menu-item ${isActive('/dataset-analysis') ? 'active' : ''}`}
            onClick={() => navigate('/dataset-analysis')}
          >
            📁 Dataset Analysis
          </button>
        </div>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            🚪 Logout
          </button>
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default Layout