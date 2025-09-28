import React, { useState } from 'react'
import { sentimentAPI } from '../services/api'

function Analysis() {
  const [text, setText] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [batchMode, setBatchMode] = useState(false)
  const [batchText, setBatchText] = useState('')

  const analyzeText = async () => {
    if (!text.trim()) return

    setLoading(true)
    try {
      const response = await sentimentAPI.analyzeText(text)
      const result = response.data
      
      setResults(prev => [result, ...prev])
      setText('')
      
      // Show success message
      alert(`Analysis complete! Sentiment: ${result.sentiment}`)
    } catch (error) {
      console.error('Analysis error:', error)
      alert('Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const analyzeBatch = async () => {
    if (!batchText.trim()) return

    const texts = batchText.split('\n').filter(line => line.trim())
    if (texts.length === 0) return

    setLoading(true)
    try {
      const response = await sentimentAPI.analyzeBatch({ texts })
      const batchResults = response.data
      
      setResults(prev => [...batchResults, ...prev])
      setBatchText('')
      
      // Show success message
      const positiveCount = batchResults.filter(r => r.sentiment === 'positive').length
      const negativeCount = batchResults.filter(r => r.sentiment === 'negative').length
      const neutralCount = batchResults.filter(r => r.sentiment === 'neutral').length
      
      alert(`Batch analysis complete!\n\nResults:\n✅ Positive: ${positiveCount}\n❌ Negative: ${negativeCount}\n⚪ Neutral: ${neutralCount}\n\nTotal: ${batchResults.length} texts analyzed`)
    } catch (error) {
      console.error('Batch analysis error:', error)
      alert('Batch analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setResults([])
  }

  const exportResults = () => {
    const dataStr = JSON.stringify(results, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sentiment-analysis-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'green'
      case 'negative': return 'red'
      default: return 'gray'
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <div className="analysis">
      <div className="analysis-header">
        <h1>Sentiment Analysis</h1>
        <p>Analyze text sentiment for e-consultant feedback</p>
      </div>

      <div className="analysis-controls">
        <div className="mode-toggle">
          <button
            className={!batchMode ? 'active' : ''}
            onClick={() => setBatchMode(false)}
          >
            Single Analysis
          </button>
          <button
            className={batchMode ? 'active' : ''}
            onClick={() => setBatchMode(true)}
          >
            Batch Analysis
          </button>
        </div>

        {!batchMode ? (
          <div className="single-analysis">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to analyze sentiment... (e.g., 'The service was excellent and very helpful')"
              rows="6"
            />
            <button
              onClick={analyzeText}
              disabled={loading || !text.trim()}
              className="analyze-button"
            >
              {loading ? '⏳ Analyzing...' : '➤ Analyze Text'}
            </button>
          </div>
        ) : (
          <div className="batch-analysis">
            <textarea
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              placeholder={`Enter multiple texts separated by new lines...\n\nExample:\nThe service was excellent\nVery poor customer support\nIt was okay, nothing special`}
              rows="10"
            />
            <div className="batch-info">
              <span>{batchText.split('\n').filter(line => line.trim()).length} texts ready for analysis</span>
            </div>
            <button
              onClick={analyzeBatch}
              disabled={loading || !batchText.trim()}
              className="analyze-button"
            >
              {loading ? '⏳ Analyzing Batch...' : '➤ Analyze Batch'}
            </button>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="results-section">
          <div className="results-header">
            <h2>Analysis Results ({results.length})</h2>
            <div className="results-actions">
              <button onClick={exportResults} className="export-button">
                📥 Export JSON
              </button>
              <button onClick={clearResults} className="clear-button">
                🗑️ Clear Results
              </button>
            </div>
          </div>

          <div className="results-grid">
            {results.map((result, index) => (
              <div key={result.id || index} className="result-card">
                <div className="result-text">"{result.text}"</div>
                <div className="result-details">
                  <span className={`sentiment ${getSentimentColor(result.sentiment)}`}>
                    {result.sentiment.toUpperCase()}
                  </span>
                  <span className="polarity">
                    Polarity: {result.polarity.toFixed(2)}
                  </span>
                  <span className="subjectivity">
                    Subjectivity: {result.subjectivity.toFixed(2)}
                  </span>
                  {result.timestamp && (
                    <span className="analysis-time">
                      {formatTime(result.timestamp)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Analysis