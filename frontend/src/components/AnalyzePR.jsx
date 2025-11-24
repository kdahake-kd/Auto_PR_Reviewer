import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { startPRAnalysis, getTaskStatus, getPRAnalysis } from '../services/api'
import { Loader, CheckCircle, AlertCircle, Send } from 'lucide-react'

export default function AnalyzePR() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    repoUrl: '',
    prNumber: '',
    githubToken: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [taskId, setTaskId] = useState(null)
  const [status, setStatus] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const response = await startPRAnalysis(
        formData.repoUrl,
        parseInt(formData.prNumber),
        formData.githubToken || null
      )
      
      setTaskId(response.task_id)
      setSuccess('Analysis started successfully!')
      setStatus('PENDING')
      
      // Poll for status
      pollTaskStatus(response.task_id)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const pollTaskStatus = async (id) => {
    const interval = setInterval(async () => {
      try {
        const result = await getTaskStatus(id)
        setStatus(result.status)
        
        if (result.status === 'SUCCESS') {
          clearInterval(interval)
          // Wait a bit more to ensure database save is complete
          setTimeout(async () => {
            try {
              // Verify the analysis is in database before redirecting
              await getPRAnalysis(id)
              setLoading(false)
              setSuccess('Analysis completed! Redirecting...')
              setTimeout(() => {
                navigate(`/analysis/${id}`)
              }, 500)
            } catch (err) {
              // If not found, wait a bit more and try again
              setTimeout(async () => {
                try {
                  await getPRAnalysis(id)
                  setLoading(false)
                  setSuccess('Analysis completed! Redirecting...')
                  navigate(`/analysis/${id}`)
                } catch (retryErr) {
                  setLoading(false)
                  setError('Analysis completed but results not found. Please check the dashboard.')
                }
              }, 2000)
            }
          }, 1000)
        } else if (result.status === 'FAILURE') {
          clearInterval(interval)
          setLoading(false)
          setError('Analysis failed. Please try again.')
        }
      } catch (err) {
        clearInterval(interval)
        setLoading(false)
        setError('Failed to check status: ' + err.message)
      }
    }, 2000) // Poll every 2 seconds
  }

  return (
    <div>
      <div className="card">
        <h1 style={{ marginBottom: '1rem', color: '#2d3748' }}>Analyze Pull Request</h1>
        <p style={{ color: '#718096', marginBottom: '2rem' }}>
          Enter the GitHub repository URL and PR number to start AI-powered code analysis
        </p>

        {error && (
          <div className="error">
            <AlertCircle size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />
            {error}
          </div>
        )}

        {success && (
          <div className="success">
            <CheckCircle size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="repoUrl">Repository URL *</label>
            <input
              type="url"
              id="repoUrl"
              placeholder="https://github.com/owner/repo"
              value={formData.repoUrl}
              onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="prNumber">Pull Request Number *</label>
            <input
              type="number"
              id="prNumber"
              placeholder="1"
              value={formData.prNumber}
              onChange={(e) => setFormData({ ...formData, prNumber: e.target.value })}
              required
              min="1"
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="githubToken">GitHub Token (Optional)</label>
            <input
              type="password"
              id="githubToken"
              placeholder="ghp_xxxxxxxxxxxx"
              value={formData.githubToken}
              onChange={(e) => setFormData({ ...formData, githubToken: e.target.value })}
              disabled={loading}
            />
            <small style={{ color: '#718096', marginTop: '0.25rem', display: 'block' }}>
              Required for private repositories
            </small>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {loading ? (
              <>
                <Loader size={18} className="spinning" />
                {status ? `Status: ${status}` : 'Starting Analysis...'}
              </>
            ) : (
              <>
                <Send size={18} />
                Start Analysis
              </>
            )}
          </button>
        </form>

        {taskId && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f7fafc', borderRadius: '8px' }}>
            <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Task ID:</p>
            <code style={{ background: 'white', padding: '0.5rem', borderRadius: '4px', display: 'block' }}>
              {taskId}
            </code>
            <Link
              to={`/analysis/${taskId}`}
              className="btn btn-secondary"
              style={{ marginTop: '0.75rem' }}
            >
              View Analysis
            </Link>
          </div>
        )}
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem', color: '#2d3748' }}>How to Use</h2>
        <ol style={{ paddingLeft: '1.5rem', color: '#4a5568', lineHeight: '1.8' }}>
          <li>Enter the full GitHub repository URL (e.g., https://github.com/owner/repo)</li>
          <li>Enter the pull request number (found in the PR URL)</li>
          <li>Optionally add a GitHub token for private repositories</li>
          <li>Click "Start Analysis" and wait for the AI to analyze your code</li>
          <li>View detailed results including style issues, bugs, performance suggestions, and best practices</li>
        </ol>
      </div>
    </div>
  )
}

