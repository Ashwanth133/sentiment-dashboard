import React, { useState } from 'react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

function DashboardAnalysis() {  // ✅ Keep this name
  const [uploading, setUploading] = useState(false)
  const [analysisData, setAnalysisData] = useState(null)
  const [fileName, setFileName] = useState('')

  const COLORS = ['#10B981', '#EF4444', '#6B7280']

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setFileName(file.name)
    setUploading(true)

    // Simulate file processing
    setTimeout(() => {
      // Mock analysis results
      const mockData = {
        summary: {
          totalRecords: 1500,
          positive: 800,
          negative: 400,
          neutral: 300
        },
        dailyTrends: [
          { date: '2024-01-01', positive: 45, negative: 20, neutral: 15 },
          { date: '2024-01-02', positive: 52, negative: 18, neutral: 12 },
          { date: '2024-01-03', positive: 48, negative: 22, neutral: 16 },
          { date: '2024-01-04', positive: 60, negative: 15, neutral: 10 },
          { date: '2024-01-05', positive: 55, negative: 25, neutral: 18 }
        ],
        sentimentDistribution: [
          { name: 'Positive', value: 800 },
          { name: 'Negative', value: 400 },
          { name: 'Neutral', value: 300 }
        ],
        commonWords: [
          { word: 'excellent', count: 120, sentiment: 'positive' },
          { word: 'poor', count: 80, sentiment: 'negative' },
          { word: 'average', count: 60, sentiment: 'neutral' },
          { word: 'great', count: 95, sentiment: 'positive' },
          { word: 'terrible', count: 70, sentiment: 'negative' }
        ]
      }

      setAnalysisData(mockData)
      setUploading(false)
    }, 2000)
  }

  const StatCard = ({ emoji, title, value, color }) => (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">
        {emoji}
      </div>
      <div className="stat-content">
        <h3>{value.toLocaleString()}</h3>
        <p>{title}</p>
      </div>
    </div>
  )

  return (
    <div className="dataset-analysis">
      <div className="analysis-header">
        <h1>Dataset Analysis</h1>
        <p>Upload and analyze bulk customer feedback data</p>
      </div>

      {/* File Upload Section */}
      <div className="upload-section">
        <div className="upload-card">
          <div className="upload-header">
            <span className="stat-icon">📁</span>
            <h2>Upload Dataset</h2>
            <p>Supported formats: CSV, Excel, JSON</p>
          </div>

          <div className="upload-area">
            <input
              type="file"
              id="dataset-upload"
              accept=".csv,.xlsx,.json"
              onChange={handleFileUpload}
              className="file-input"
            />
            <label htmlFor="dataset-upload" className="upload-label">
              {uploading ? (
                <div className="uploading">
                  <div className="spinner"></div>
                  <p>Processing {fileName}...</p>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <span style={{fontSize: '3rem'}}>📤</span>
                  <p>Choose file or drag and drop here</p>
                  <span>Max file size: 10MB</span>
                </div>
              )}
            </label>
          </div>

          {fileName && !uploading && (
            <div className="file-info">
              <span>📄 {fileName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Results */}
      {analysisData && (
        <div className="analysis-results">
          {/* Summary Stats */}
          <div className="stats-grid">
            <StatCard
              emoji="📊"
              title="Total Records"
              value={analysisData.summary.totalRecords}
              color="blue"
            />
            <StatCard
              emoji="😊"
              title="Positive"
              value={analysisData.summary.positive}
              color="green"
            />
            <StatCard
              emoji="😞"
              title="Negative"
              value={analysisData.summary.negative}
              color="red"
            />
            <StatCard
              emoji="😐"
              title="Neutral"
              value={analysisData.summary.neutral}
              color="gray"
            />
          </div>

          {/* Charts Grid */}
          <div className="charts-grid">
            {/* Sentiment Distribution Pie Chart */}
            <div className="chart-card">
              <h3>Sentiment Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analysisData.sentimentDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analysisData.sentimentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Daily Trends Line Chart */}
            <div className="chart-card">
              <h3>Sentiment Trends Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analysisData.dailyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="positive" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="negative" stroke="#EF4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="neutral" stroke="#6B7280" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Common Words Bar Chart */}
            <div className="chart-card">
              <h3>Most Common Words</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analysisData.commonWords}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="word" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Sentiment Comparison Bar Chart */}
            <div className="chart-card">
              <h3>Sentiment Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analysisData.sentimentDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {analysisData.sentimentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Word Cloud Section */}
          <div className="word-cloud-section">
            <h3>Sentiment Word Cloud</h3>
            <div className="word-cloud">
              {analysisData.commonWords.map((word, index) => (
                <span
                  key={index}
                  className={`word-tag ${word.sentiment}`}
                  style={{ fontSize: `${Math.min(24, 12 + word.count / 10)}px` }}
                >
                  {word.word}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardAnalysis  // ✅ Keep this export name