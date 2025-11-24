import { useState, useEffect } from 'react'
import { getStatistics } from '../services/api'
import { BarChart3, TrendingUp, AlertTriangle, Zap, Code, CheckCircle } from 'lucide-react'

export default function Statistics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    try {
      setLoading(true)
      const data = await getStatistics()
      setStats(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="loading">Loading statistics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="error">{error}</div>
      </div>
    )
  }

  const issueTypes = [
    { type: 'style', label: 'Style Issues', icon: Code, color: '#3182ce' },
    { type: 'bugs', label: 'Bugs', icon: AlertTriangle, color: '#e53e3e' },
    { type: 'performance', label: 'Performance', icon: Zap, color: '#d69e2e' },
    { type: 'best_practice', label: 'Best Practices', icon: CheckCircle, color: '#38a169' },
  ]

  const totalIssues = stats?.total_issues_found || 0
  const maxIssues = Math.max(...Object.values(stats?.issues_by_type || {}), 1)

  return (
    <div>
      <div className="card">
        <h1 style={{ marginBottom: '1rem', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={28} />
          Statistics Dashboard
        </h1>
        <p style={{ color: '#718096', marginBottom: '2rem' }}>
          Overview of all PR analyses and issues detected
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <TrendingUp size={24} />
              <h3 style={{ margin: 0 }}>Total Analyses</h3>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{stats?.total_analyses || 0}</p>
          </div>

          <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '12px', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0 }}>Total Issues</h3>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{totalIssues}</p>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', color: '#2d3748' }}>Issues by Type</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {issueTypes.map(({ type, label, icon: Icon, color }) => {
              const count = stats?.issues_by_type?.[type] || 0
              const percentage = maxIssues > 0 ? (count / maxIssues) * 100 : 0

              return (
                <div key={type} style={{ padding: '1rem', background: '#f7fafc', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Icon size={20} style={{ color }} />
                      <span style={{ fontWeight: 600, color: '#2d3748' }}>{label}</span>
                    </div>
                    <span style={{ fontWeight: 'bold', color: '#2d3748', fontSize: '1.25rem' }}>{count}</span>
                  </div>
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${percentage}%`,
                        background: color,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

