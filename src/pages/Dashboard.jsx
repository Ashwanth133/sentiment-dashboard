import React, { useState, useEffect } from 'react'
import { sentimentAPI } from '../services/api'

function Dashboard() {
  const [stats, setStats] = useState({
    totalAnalysis: 0,
    positive: 0,
    negative: 0,
    neutral: 0,
    lastUpdated: null
  })
  const [recentAnalysis, setRecentAnalysis] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState('')

  useEffect(() => {
    fetchDashboardData()
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch both stats and recent analysis in parallel
      const [statsResponse, historyResponse] = await Promise.all([
        sentimentAPI.getDashboardStats(),
        sentimentAPI.getAnalysisHistory()
      ])

      setStats(statsResponse.data)
      setRecentAnalysis(historyResponse.data.slice(0, 10)) // Show last 10 analyses
      
      // Format last updated time
      if (statsResponse.data.lastUpdated) {
        setLastUpdated(new Date(statsResponse.data.lastUpdated).toLocaleString())
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearAllData = async () => {
    if (window.confirm('Are you sure you want to clear all analysis history? This action cannot be undone.')) {
      try {
        await sentimentAPI.clearAnalysisHistory()
        fetchDashboardData() // Refresh data
        alert('All analysis history has been cleared.')
      } catch (error) {
        console.error('Error clearing history:', error)
        alert('Failed to clear history.')
      }
    }
  }

  const StatCard = ({ emoji, title, value, color, percentage }) => (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">
        {emoji}
      </div>
      <div className="stat-content">
        <h3>{value.toLocaleString()}</h3>
        <p>{title}</p>
        {percentage > 0 && (
          <span className="percentage">{percentage}%</span>
        )}
      </div>
    </div>
  )

  // Calculate percentages for stats
  const total = stats.totalAnalysis
  const positivePercentage = total > 0 ? Math.round((stats.positive / total) * 100) : 0
  const negativePercentage = total > 0 ? Math.round((stats.negative / total) * 100) : 0
  const neutralPercentage = total > 0 ? Math.round((stats.neutral / total) * 100) : 0

  if (loading && stats.totalAnalysis === 0) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-top">
          <div>
            <h1>Dashboard</h1>
            <p>Real-time Sentiment Analysis Overview</p>
          </div>
          <div className="header-actions">
            {lastUpdated && (
              <span className="last-updated">Last updated: {lastUpdated}</span>
            )}
            <button onClick={clearAllData} className="clear-all-button">
              🗑️ Clear All Data
            </button>
            <button onClick={fetchDashboardData} className="refresh-button">
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {stats.totalAnalysis === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h2>No Analysis Data Yet</h2>
          <p>Start analyzing text in the Analysis page to see statistics here.</p>
          <button 
            onClick={() => window.location.href = '/analysis'}
            className="cta-button"
          >
            Go to Analysis
          </button>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard
              emoji="📊"
              title="Total Analysis"
              value={stats.totalAnalysis}
              color="blue"
            />
            <StatCard
              emoji="😊"
              title="Positive"
              value={stats.positive}
              color="green"
              percentage={positivePercentage}
            />
            <StatCard
              emoji="😞"
              title="Negative"
              value={stats.negative}
              color="red"
              percentage={negativePercentage}
            />
            <StatCard
              emoji="😐"
              title="Neutral"
              value={stats.neutral}
              color="gray"
              percentage={neutralPercentage}
            />
          </div>

          {/* Sentiment Distribution Chart */}
          {total > 0 && (
            <div className="sentiment-distribution">
              <h2>Sentiment Distribution</h2>
              <div className="distribution-bars">
                <div className="distribution-bar positive" style={{ width: `${positivePercentage}%` }}>
                  <span>Positive: {positivePercentage}%</span>
                </div>
                <div className="distribution-bar negative" style={{ width: `${negativePercentage}%` }}>
                  <span>Negative: {negativePercentage}%</span>
                </div>
                <div className="distribution-bar neutral" style={{ width: `${neutralPercentage}%` }}>
                  <span>Neutral: {neutralPercentage}%</span>
                </div>
              </div>
            </div>
          )}

          <div className="recent-analysis">
            <div className="section-header">
              <h2>Recent Analysis</h2>
              <span className="count">Showing {recentAnalysis.length} most recent</span>
            </div>
            
            {recentAnalysis.length > 0 ? (
              <div className="analysis-list">
                {recentAnalysis.map((analysis, index) => (
                  <div key={analysis.id || index} className="analysis-item">
                    <div className="analysis-content">
                      <div className="analysis-text">
                        "{analysis.text}"
                      </div>
                      <div className="analysis-meta">
                        <div className={`sentiment-badge ${analysis.sentiment}`}>
                          {analysis.sentiment}
                        </div>
                        <div className="analysis-score">
                          Score: {analysis.polarity.toFixed(2)}
                        </div>
                        <div className="analysis-time">
                          {new Date(analysis.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-list">
                <p>No recent analyses found.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard