import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPRAnalysis } from '../services/api'
import { AlertCircle, CheckCircle, Zap, Code, ArrowLeft, Loader } from 'lucide-react'

export default function AnalysisDetail() {
  const { taskId } = useParams()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAnalysis()
  }, [taskId])

  const loadAnalysis = async (retryCount = 0) => {
    try {
      setLoading(true)
      const data = await getPRAnalysis(taskId)
      setAnalysis(data)
      setError(null)
      setLoading(false)
    } catch (err) {
      // If not found and we haven't retried too many times, wait and retry
      const errorMsg = err.message.toLowerCase()
      if ((errorMsg.includes('not found') || errorMsg.includes('404')) && retryCount < 3) {
        // Keep loading state and retry
        setTimeout(() => {
          loadAnalysis(retryCount + 1)
        }, 2000) // Wait 2 seconds before retry
      } else {
        setError(err.message + (retryCount > 0 ? ' (After retries)' : ''))
        setLoading(false)
      }
    }
  }

  const getIssueIcon = (type) => {
    switch (type) {
      case 'bugs':
        return <AlertCircle size={18} style={{ color: '#e53e3e' }} />
      case 'performance':
        return <Zap size={18} style={{ color: '#d69e2e' }} />
      case 'style':
        return <Code size={18} style={{ color: '#3182ce' }} />
      case 'best_practice':
        return <CheckCircle size={18} style={{ color: '#38a169' }} />
      default:
        return <AlertCircle size={18} />
    }
  }

  const getIssueBadgeClass = (type) => {
    switch (type) {
      case 'bugs':
        return 'badge-error'
      case 'performance':
        return 'badge-warning'
      case 'style':
        return 'badge-info'
      case 'best_practice':
        return 'badge-success'
      default:
        return 'badge-info'
    }
  }

  const parseAnalysisResult = (result) => {
    if (typeof result === 'string') {
      try {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = result.match(/```json\s*([\s\S]*?)\s*```/) || result.match(/```\s*([\s\S]*?)\s*```/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[1])
        }
        return JSON.parse(result)
      } catch {
        return { issues: [], raw: result }
      }
    }
    return result || { issues: [] }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="loading">
          <Loader size={24} className="spinning" style={{ marginBottom: '1rem' }} />
          Loading analysis... This may take a moment.
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="error">{error}</div>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="card">
        <div className="error">Analysis not found</div>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const analysisResults = analysis.analysis_result || []
  
  // Debug: Log the analysis result structure
  console.log('Analysis Result:', analysis)
  console.log('Analysis Results Array:', analysisResults)
  console.log('Is Array:', Array.isArray(analysisResults))
  console.log('Length:', analysisResults.length)

  return (
    <div>
      <Link to="/" className="btn btn-secondary" style={{ marginBottom: '1rem' }}>
        <ArrowLeft size={18} />
        Back to Dashboard
      </Link>

      <div className="card">
        <h1 style={{ marginBottom: '1rem', color: '#2d3748' }}>Analysis Results</h1>
        <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f7fafc', borderRadius: '8px' }}>
          <p><strong>Repository:</strong> {analysis.repo_url}</p>
          <p><strong>PR Number:</strong> #{analysis.pr_number}</p>
          <p><strong>Task ID:</strong> {analysis.task_id}</p>
          <p><strong>Analyzed At:</strong> {new Date(analysis.created_at).toLocaleString()}</p>
          <p><strong>Files Analyzed:</strong> {Array.isArray(analysisResults) ? analysisResults.length : 'N/A'}</p>
        </div>

        {!Array.isArray(analysisResults) || analysisResults.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
            <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>No analysis results available for this PR.</p>
            <p style={{ fontSize: '0.875rem' }}>
              This could mean:
              <ul style={{ textAlign: 'left', display: 'inline-block', marginTop: '0.5rem' }}>
                <li>The PR has no files changed</li>
                <li>There was an error during analysis</li>
                <li>The analysis is still processing</li>
              </ul>
            </p>
            <details style={{ marginTop: '1rem', textAlign: 'left', background: '#f7fafc', padding: '1rem', borderRadius: '8px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '0.5rem' }}>Debug Information</summary>
              <pre style={{ fontSize: '0.75rem', overflow: 'auto', maxHeight: '300px' }}>
                {JSON.stringify(analysis, null, 2)}
              </pre>
            </details>
            <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#a0aec0' }}>
              Check the Celery worker logs for more details.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '2rem' }}>
            {analysisResults.map((fileResult, index) => {
              const parsed = parseAnalysisResult(fileResult.analysis)
              const issues = parsed.issues || []

              return (
                <div key={index} style={{ border: '2px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
                  <h2 style={{ marginBottom: '1rem', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Code size={20} />
                    {fileResult.file_name}
                  </h2>

                  {issues.length === 0 ? (
                    <div style={{ padding: '1rem', background: '#c6f6d5', borderRadius: '8px', color: '#22543d' }}>
                      <CheckCircle size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />
                      No issues found! Great job! 🎉
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {issues.map((issue, issueIndex) => (
                        <div
                          key={issueIndex}
                          style={{
                            padding: '1rem',
                            background: '#f7fafc',
                            borderRadius: '8px',
                            borderLeft: '4px solid #667eea',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            {getIssueIcon(issue.type)}
                            <span className={`badge ${getIssueBadgeClass(issue.type)}`}>
                              {issue.type || 'issue'}
                            </span>
                            {issue.line && (
                              <span style={{ color: '#718096', fontSize: '0.875rem' }}>
                                Line {issue.line}
                              </span>
                            )}
                          </div>
                          <p style={{ marginBottom: '0.5rem', fontWeight: 600, color: '#2d3748' }}>
                            {issue.description || 'Issue detected'}
                          </p>
                          {issue.suggestion && (
                            <div style={{ padding: '0.75rem', background: 'white', borderRadius: '6px', marginTop: '0.5rem' }}>
                              <strong style={{ color: '#4a5568' }}>Suggestion:</strong>
                              <p style={{ marginTop: '0.25rem', color: '#718096' }}>{issue.suggestion}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {parsed.raw && !parsed.issues && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#f7fafc', borderRadius: '8px' }}>
                      <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem', color: '#4a5568' }}>
                        {parsed.raw}
                      </pre>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

