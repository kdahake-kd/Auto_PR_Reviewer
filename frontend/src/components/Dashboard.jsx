import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllAnalyses } from '../services/api'
import { Clock, FileCode, ExternalLink, ArrowRight } from 'lucide-react'

export default function Dashboard() {
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAnalyses()
  }, [])

  const loadAnalyses = async () => {
    try {
      setLoading(true)
      const data = await getAllAnalyses()
      setAnalyses(data.results || [])
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  if (loading) {
    return (
      <div className="card">
        <div className="loading">Loading analyses...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="card">
        <h1 style={{ marginBottom: '1rem', color: '#2d3748' }}>PR Analysis Dashboard</h1>
        <p style={{ color: '#718096', marginBottom: '2rem' }}>
          View all your analyzed pull requests and their results
        </p>

        {error && <div className="error">{error}</div>}

        {analyses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
            <FileCode size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>No analyses yet. Start analyzing a PR to see results here.</p>
            <Link to="/analyze" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Analyze Your First PR
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {analyses.map((analysis) => (
              <Link
                key={analysis.task_id}
                to={`/analysis/${analysis.task_id}`}
                style={{
                  display: 'block',
                  background: '#f7fafc',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.2s',
                  border: '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#667eea'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ color: '#2d3748', margin: 0 }}>{analysis.repo_url}</h3>
                      <ExternalLink size={16} style={{ color: '#718096' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.75rem' }}>
                      <span className="badge badge-info">PR #{analysis.pr_number}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#718096', fontSize: '0.875rem' }}>
                        <FileCode size={14} />
                        {analysis.file_count} files
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#718096', fontSize: '0.875rem' }}>
                        <Clock size={14} />
                        {formatDate(analysis.created_at)}
                      </span>
                    </div>
                  </div>
                  <ArrowRight size={20} style={{ color: '#667eea' }} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

