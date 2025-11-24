import axios from 'axios'

const API_BASE_URL = 'http://127.0.0.1:8080'
const FASTAPI_BASE_URL = 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const startPRAnalysis = async (repoUrl, prNumber, githubToken = null) => {
  try {
    const response = await api.post('/start_task/', {
      repo_url: repoUrl,
      pr_number: prNumber,
      github_token: githubToken,
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to start analysis')
  }
}

export const getTaskStatus = async (taskId) => {
  try {
    const response = await api.get(`/task_status_view/${taskId}/`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to get task status')
  }
}

export const getPRAnalysis = async (taskId) => {
  try {
    const response = await api.get(`/api/get_pr_analysis/${taskId}/`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to get analysis')
  }
}

export const getAllAnalyses = async () => {
  try {
    const response = await api.get('/api/get_all_analyses/')
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to get analyses')
  }
}

export const getStatistics = async () => {
  try {
    const response = await api.get('/api/statistics/')
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to get statistics')
  }
}

