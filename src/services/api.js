import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Local storage keys for persistence
const ANALYSIS_HISTORY_KEY = 'sentiment_analysis_history'
const DASHBOARD_STATS_KEY = 'dashboard_stats'
const USER_PREFERENCES_KEY = 'user_preferences'

// Helper functions for local storage
const getAnalysisHistory = () => {
  try {
    const history = localStorage.getItem(ANALYSIS_HISTORY_KEY)
    return history ? JSON.parse(history) : []
  } catch (error) {
    console.error('Error reading analysis history:', error)
    return []
  }
}

const saveAnalysisHistory = (history) => {
  try {
    localStorage.setItem(ANALYSIS_HISTORY_KEY, JSON.stringify(history))
  } catch (error) {
    console.error('Error saving analysis history:', error)
  }
}

const getDashboardStats = () => {
  try {
    const stats = localStorage.getItem(DASHBOARD_STATS_KEY)
    return stats ? JSON.parse(stats) : {
      totalAnalysis: 0,
      positive: 0,
      negative: 0,
      neutral: 0,
      averagePolarity: 0,
      lastUpdated: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error reading dashboard stats:', error)
    return {
      totalAnalysis: 0,
      positive: 0,
      negative: 0,
      neutral: 0,
      averagePolarity: 0,
      lastUpdated: new Date().toISOString()
    }
  }
}

const saveDashboardStats = (stats) => {
  try {
    localStorage.setItem(DASHBOARD_STATS_KEY, JSON.stringify({
      ...stats,
      lastUpdated: new Date().toISOString()
    }))
  } catch (error) {
    console.error('Error saving dashboard stats:', error)
  }
}

// Enhanced sentiment analysis with better logic
const analyzeSentiment = (text) => {
  const lowerText = text.toLowerCase()
  
  // Enhanced keyword matching
  const positiveWords = ['excellent', 'great', 'good', 'amazing', 'wonderful', 'perfect', 'outstanding', 'fantastic', 'awesome', 'brilliant', 'love', 'best', 'happy', 'satisfied', 'pleased', 'impressed']
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'poor', 'disappointing', 'worst', 'hate', 'angry', 'frustrated', 'annoyed', 'useless', 'waste', 'broken', 'failed']
  
  const positiveMatches = positiveWords.filter(word => lowerText.includes(word)).length
  const negativeMatches = negativeWords.filter(word => lowerText.includes(word)).length
  
  // Calculate polarity based on keyword matches and text length
  let polarity = 0
  
  if (positiveMatches > negativeMatches) {
    polarity = Math.min(0.1 + (positiveMatches * 0.15), 0.9)
  } else if (negativeMatches > positiveMatches) {
    polarity = Math.max(-0.1 - (negativeMatches * 0.15), -0.9)
  } else {
    // Neutral or mixed sentiment
    polarity = (Math.random() * 0.4) - 0.2 // Random between -0.2 and 0.2
  }
  
  // Adjust based on text length and exclamation marks
  const exclamationCount = (text.match(/!/g) || []).length
  if (exclamationCount > 0) {
    polarity += (polarity > 0 ? 0.1 : -0.1) * Math.min(exclamationCount, 3)
  }
  
  // Determine sentiment
  let sentiment = 'neutral'
  if (polarity > 0.25) sentiment = 'positive'
  if (polarity < -0.25) sentiment = 'negative'
  
  // Calculate subjectivity based on text characteristics
  const wordCount = text.split(/\s+/).length
  const emotionalWords = positiveMatches + negativeMatches
  const subjectivity = Math.min(0.2 + (emotionalWords / wordCount) * 0.8, 0.9)
  
  return {
    polarity: parseFloat(polarity.toFixed(3)),
    sentiment,
    subjectivity: parseFloat(subjectivity.toFixed(3))
  }
}

// Update stats when new analysis is added
const updateDashboardStats = (newAnalysis) => {
  const stats = getDashboardStats()
  const history = getAnalysisHistory()
  
  // Calculate new averages
  const allAnalyses = [newAnalysis, ...history]
  const totalPolarity = allAnalyses.reduce((sum, item) => sum + item.polarity, 0)
  const averagePolarity = totalPolarity / allAnalyses.length
  
  const newStats = {
    totalAnalysis: allAnalyses.length,
    positive: allAnalyses.filter(item => item.sentiment === 'positive').length,
    negative: allAnalyses.filter(item => item.sentiment === 'negative').length,
    neutral: allAnalyses.filter(item => item.sentiment === 'neutral').length,
    averagePolarity: parseFloat(averagePolarity.toFixed(3))
  }
  
  saveDashboardStats(newStats)
  return newStats
}

export const sentimentAPI = {
  // Single text analysis
  analyzeText: async (text) => {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('Invalid text input')
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const analysis = analyzeSentiment(text.trim())
          
          const result = {
            text: text.trim(),
            ...analysis,
            timestamp: new Date().toISOString(),
            id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            wordCount: text.trim().split(/\s+/).length
          }

          // Save to history
          const history = getAnalysisHistory()
          const newHistory = [result, ...history].slice(0, 100) // Keep last 100 analyses
          saveAnalysisHistory(newHistory)
          
          // Update dashboard stats
          updateDashboardStats(result)

          resolve({ data: result })
        } catch (error) {
          console.error('Analysis error:', error)
          resolve({ 
            data: null, 
            error: 'Failed to analyze text' 
          })
        }
      }, 800) // Reduced delay for better UX
    })
  },

  // Batch analysis
  analyzeBatch: async (texts) => {
    if (!Array.isArray(texts) || texts.length === 0) {
      throw new Error('Invalid texts array')
    }

    // Filter valid texts
    const validTexts = texts
      .map(text => typeof text === 'string' ? text.trim() : '')
      .filter(text => text.length > 0)

    if (validTexts.length === 0) {
      throw new Error('No valid texts to analyze')
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const results = validTexts.map(text => {
            const analysis = analyzeSentiment(text)
            return {
              text,
              ...analysis,
              timestamp: new Date().toISOString(),
              id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              wordCount: text.split(/\s+/).length
            }
          })

          // Save to history
          const history = getAnalysisHistory()
          const newHistory = [...results, ...history].slice(0, 100)
          saveAnalysisHistory(newHistory)
          
          // Update dashboard stats for all results
          results.forEach(result => updateDashboardStats(result))

          resolve({ 
            data: results,
            summary: {
              total: results.length,
              positive: results.filter(r => r.sentiment === 'positive').length,
              negative: results.filter(r => r.sentiment === 'negative').length,
              neutral: results.filter(r => r.sentiment === 'neutral').length
            }
          })
        } catch (error) {
          console.error('Batch analysis error:', error)
          resolve({ 
            data: [], 
            error: 'Failed to analyze batch' 
          })
        }
      }, Math.max(1000, validTexts.length * 200)) // Dynamic delay based on batch size
    })
  },

  // Get analysis history with pagination
  getAnalysisHistory: (page = 1, limit = 10) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const history = getAnalysisHistory()
          const startIndex = (page - 1) * limit
          const endIndex = startIndex + limit
          const paginatedHistory = history.slice(startIndex, endIndex)
          
          resolve({ 
            data: paginatedHistory,
            pagination: {
              page,
              limit,
              total: history.length,
              totalPages: Math.ceil(history.length / limit)
            }
          })
        } catch (error) {
          console.error('Error fetching history:', error)
          resolve({ data: [], pagination: { page, limit, total: 0, totalPages: 0 } })
        }
      }, 300)
    })
  },

  // Get dashboard stats
  getDashboardStats: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const stats = getDashboardStats()
          const history = getAnalysisHistory()
          
          // Ensure stats are in sync with history
          const totalPolarity = history.reduce((sum, item) => sum + item.polarity, 0)
          const averagePolarity = history.length > 0 ? totalPolarity / history.length : 0
          
          const syncedStats = {
            totalAnalysis: history.length,
            positive: history.filter(item => item.sentiment === 'positive').length,
            negative: history.filter(item => item.sentiment === 'negative').length,
            neutral: history.filter(item => item.sentiment === 'neutral').length,
            averagePolarity: parseFloat(averagePolarity.toFixed(3)),
            lastUpdated: stats.lastUpdated
          }
          
          saveDashboardStats(syncedStats)
          resolve({ data: syncedStats })
        } catch (error) {
          console.error('Error fetching stats:', error)
          resolve({ 
            data: {
              totalAnalysis: 0,
              positive: 0,
              negative: 0,
              neutral: 0,
              averagePolarity: 0,
              lastUpdated: new Date().toISOString()
            } 
          })
        }
      }, 200)
    })
  },

  // Clear all history
  clearAnalysisHistory: () => {
    return new Promise((resolve) => {
      try {
        localStorage.removeItem(ANALYSIS_HISTORY_KEY)
        localStorage.removeItem(DASHBOARD_STATS_KEY)
        resolve({ 
          data: { 
            success: true,
            message: 'All analysis history cleared successfully'
          } 
        })
      } catch (error) {
        console.error('Error clearing history:', error)
        resolve({ 
          data: { 
            success: false,
            error: 'Failed to clear history'
          } 
        })
      }
    })
  },

  // Export analysis data
  exportAnalysisData: () => {
    return new Promise((resolve) => {
      try {
        const history = getAnalysisHistory()
        const stats = getDashboardStats()
        
        const exportData = {
          metadata: {
            exportedAt: new Date().toISOString(),
            totalRecords: history.length,
            version: '1.0'
          },
          statistics: stats,
          analyses: history
        }
        
        resolve({ data: exportData })
      } catch (error) {
        console.error('Error exporting data:', error)
        resolve({ data: null, error: 'Failed to export data' })
      }
    })
  },

  // Search analyses
  searchAnalyses: (query, sentimentFilter = 'all') => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const history = getAnalysisHistory()
          const lowerQuery = query.toLowerCase()
          
          const filtered = history.filter(item => {
            const matchesText = item.text.toLowerCase().includes(lowerQuery)
            const matchesSentiment = sentimentFilter === 'all' || item.sentiment === sentimentFilter
            return matchesText && matchesSentiment
          })
          
          resolve({ 
            data: filtered,
            summary: {
              total: filtered.length,
              query,
              sentimentFilter
            }
          })
        } catch (error) {
          console.error('Error searching analyses:', error)
          resolve({ data: [], summary: { total: 0, query, sentimentFilter } })
        }
      }, 400)
    })
  }
}

export default api