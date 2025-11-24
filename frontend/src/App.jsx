import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import AnalyzePR from './components/AnalyzePR'
import AnalysisDetail from './components/AnalysisDetail'
import Statistics from './components/Statistics'
import { Github, BarChart3, FileSearch, Home } from 'lucide-react'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analyze" element={<AnalyzePR />} />
            <Route path="/analysis/:taskId" element={<AnalysisDetail />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <Github size={24} />
          <span>AI PR Review System</span>
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">
            <Home size={18} />
            Dashboard
          </Link>
          <Link to="/analyze" className="nav-link">
            <FileSearch size={18} />
            Analyze PR
          </Link>
          <Link to="/statistics" className="nav-link">
            <BarChart3 size={18} />
            Statistics
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default App

