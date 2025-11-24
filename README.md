# AI-Powered PR Review System

A comprehensive microservices-based automated code review system that leverages AI to analyze GitHub Pull Requests in real-time. The system provides intelligent code analysis including style checks, bug detection, performance optimization suggestions, and best practice recommendations.

## 🎯 Features

- **AI-Powered Code Analysis**: Uses Groq LLM to analyze code for issues
- **Real-time Status Tracking**: Monitor analysis progress with live updates
- **Interactive Dashboard**: Beautiful React frontend to view and manage analyses
- **Statistics Dashboard**: Track issues across all PRs with visual analytics
- **Asynchronous Processing**: Scalable task queue using Celery and Redis
- **RESTful API**: Clean API design for easy integration

## 🏗️ Architecture

```
┌─────────────┐
│   React     │  Frontend (Port 3000)
│   Frontend  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   FastAPI   │  Gateway (Port 8000)
│   Gateway   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Django    │  Backend (Port 8080)
│   REST API  │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│   Celery    │◄────┤    Redis    │
│   Workers   │     │   Broker    │
└──────┬──────┘     └─────────────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│  GitHub API │     │   Groq API   │
│             │     │     (LLM)    │
└─────────────┘     └─────────────┘
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.10+**
- **Node.js 18+** and npm
- **Redis Server**
- **Git**

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
cd /Users/kirandahake/Downloads/Auto_pr_review_system/Microservice
```

### Step 2: Backend Setup (Django + FastAPI)

#### 2.1 Create and Activate Virtual Environment

```bash
# Create virtual environment
python3 -m venv env

# Activate virtual environment
# On macOS/Linux:
source env/bin/activate
# On Windows:
# env\Scripts\activate
```

#### 2.2 Install Python Dependencies

```bash
pip install django==5.1.5
pip install djangorestframework
pip install celery==5.4.0
pip install redis==5.2.1
pip install fastapi
pip install uvicorn
pip install httpx
pip install groq
pip install django-cors-headers
pip install requests
```

Or create a `requirements.txt` file:

```bash
pip install -r requirements.txt
```

#### 2.3 Configure Django Database

```bash
cd django_app
python manage.py migrate
```

#### 2.4 Update Groq API Key

Edit `django_app/Home/utils/ai_agent.py` and replace the API key:

```python
key = "your_groq_api_key_here"
```

You can get a free API key from [Groq Console](https://console.groq.com/)

### Step 3: Frontend Setup (React)

#### 3.1 Navigate to Frontend Directory

```bash
cd frontend
```

#### 3.2 Install Dependencies

```bash
npm install
```

### Step 4: Start Redis Server

Open a new terminal and start Redis:

```bash
# On macOS (if installed via Homebrew):
brew services start redis

# Or run directly:
redis-server

# On Linux:
sudo systemctl start redis

# On Windows (if using WSL):
redis-server
```

Verify Redis is running:

```bash
redis-cli ping
# Should return: PONG
```

## 🎮 How to Run the Application

You need to run **5 services** simultaneously. Open **5 separate terminal windows/tabs**.

### Terminal 1: Redis Server

```bash
redis-server
```

### Terminal 2: Celery Worker

```bash
# Activate virtual environment first
source env/bin/activate  # On macOS/Linux
# or: env\Scripts\activate  # On Windows

cd django_app
celery -A django_app worker -l info
```

### Terminal 3: Django Backend

```bash
# Activate virtual environment
source env/bin/activate  # On macOS/Linux
# or: env\Scripts\activate  # On Windows

cd django_app
python manage.py runserver 8080
```

You should see:
```
Starting development server at http://127.0.0.1:8080/
```

### Terminal 4: FastAPI Gateway

```bash
# Activate virtual environment
source env/bin/activate  # On macOS/Linux
# or: env\Scripts\activate  # On Windows

cd fastapi_app
uvicorn main:app --reload --port 8000
```

You should see:
```
Uvicorn running on http://127.0.0.1:8000
```

### Terminal 5: React Frontend

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

## 🌐 Access the Application

Once all services are running:

- **Frontend Dashboard**: http://localhost:3000
- **FastAPI Gateway**: http://localhost:8000
- **Django API**: http://127.0.0.1:8080
- **FastAPI Docs**: http://localhost:8000/docs

## 📖 How to Use

### 1. Analyze a Pull Request

1. Open http://localhost:3000 in your browser
2. Click **"Analyze PR"** in the navigation
3. Fill in the form:
   - **Repository URL**: Full GitHub URL (e.g., `https://github.com/owner/repo`)
   - **PR Number**: The pull request number (e.g., `1`)
   - **GitHub Token** (Optional): Required for private repositories
4. Click **"Start Analysis"**
5. Wait for the analysis to complete (status updates automatically)
6. View detailed results with issues categorized by type

### 2. View Analysis Results

- Click on any analysis from the **Dashboard** to see detailed results
- Issues are categorized by:
  - **Style**: Code formatting and style issues
  - **Bugs**: Potential errors and logical issues
  - **Performance**: Optimization opportunities
  - **Best Practice**: Coding standards and best practices

### 3. View Statistics

- Click **"Statistics"** in the navigation
- See overview of all analyses and issues detected
- View breakdown by issue type

## 🔌 API Usage Examples

### Using cURL

#### Start PR Analysis

```bash
curl -X POST http://127.0.0.1:8080/start_task/ \
  -H "Content-Type: application/json" \
  -d '{
    "repo_url": "https://github.com/owner/repo",
    "pr_number": 1,
    "github_token": "optional_token"
  }'
```

Response:
```json
{
  "task_id": "abc123-def456-...",
  "status": "Task Started"
}
```

#### Check Task Status

```bash
curl http://127.0.0.1:8080/task_status_view/abc123-def456-.../
```

Response:
```json
{
  "task_id": "abc123-def456-...",
  "status": "SUCCESS",
  "result": {
    "task_id": "abc123-def456-...",
    "status": "SAVED"
  }
}
```

#### Get Analysis Results

```bash
curl http://127.0.0.1:8080/api/get_pr_analysis/abc123-def456-.../
```

#### Get All Analyses

```bash
curl http://127.0.0.1:8080/api/get_all_analyses/
```

#### Get Statistics

```bash
curl http://127.0.0.1:8080/api/statistics/
```

### Using Python

```python
import requests

# Start analysis
response = requests.post('http://127.0.0.1:8080/start_task/', json={
    'repo_url': 'https://github.com/owner/repo',
    'pr_number': 1,
    'github_token': None
})
task_id = response.json()['task_id']

# Check status
status_response = requests.get(f'http://127.0.0.1:8080/task_status_view/{task_id}/')
print(status_response.json())

# Get results
results = requests.get(f'http://127.0.0.1:8080/api/get_pr_analysis/{task_id}/')
print(results.json())
```

### Using JavaScript/Fetch

```javascript
// Start analysis
const startAnalysis = async () => {
  const response = await fetch('http://127.0.0.1:8080/start_task/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      repo_url: 'https://github.com/owner/repo',
      pr_number: 1,
      github_token: null
    })
  });
  const data = await response.json();
  return data.task_id;
};

// Check status
const checkStatus = async (taskId) => {
  const response = await fetch(`http://127.0.0.1:8080/task_status_view/${taskId}/`);
  return await response.json();
};
```

## 📁 Project Structure

```
Microservice/
├── django_app/              # Django backend service
│   ├── Home/                # Main application
│   │   ├── models.py        # Database models
│   │   ├── views.py         # API views
│   │   ├── task.py          # Celery tasks
│   │   ├── utils/           # Utility modules
│   │   │   ├── ai_agent.py  # Groq LLM integration
│   │   │   ├── github.py    # GitHub API client
│   │   │   └── features.py  # Feature roadmap
│   │   └── urls.py          # URL routing
│   ├── django_app/          # Django configuration
│   │   ├── settings.py      # App settings
│   │   └── celery.py        # Celery configuration
│   └── manage.py
├── fastapi_app/             # FastAPI gateway service
│   └── main.py              # Gateway endpoints
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AnalyzePR.jsx
│   │   │   ├── AnalysisDetail.jsx
│   │   │   └── Statistics.jsx
│   │   ├── services/        # API services
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables (Optional)

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key
GITHUB_TOKEN=your_github_token
REDIS_URL=redis://127.0.0.1:6379
```

### Django Settings

Key settings in `django_app/django_app/settings.py`:

- `CELERY_BROKER_URL`: Redis connection URL
- `CORS_ALLOWED_ORIGINS`: Frontend URLs allowed to access API
- `DEBUG`: Set to `False` in production

## 🐛 Troubleshooting

### Issue: Redis Connection Error

**Solution**: Make sure Redis is running:
```bash
redis-cli ping
# Should return: PONG
```

### Issue: Celery Worker Not Processing Tasks

**Solution**: 
1. Check Redis is running
2. Restart Celery worker
3. Check Celery logs for errors

### Issue: CORS Errors in Browser

**Solution**: 
1. Verify `django-cors-headers` is installed
2. Check `CORS_ALLOWED_ORIGINS` in settings.py includes your frontend URL
3. Restart Django server

### Issue: API Key Errors

**Solution**: 
1. Verify Groq API key is correct in `ai_agent.py`
2. Check API key has sufficient credits/quota
3. For GitHub private repos, ensure GitHub token is valid

### Issue: Frontend Can't Connect to Backend

**Solution**:
1. Verify Django is running on port 8080
2. Check browser console for CORS errors
3. Verify API URLs in `frontend/src/services/api.js`

## 🚀 Production Deployment

### Backend

1. Set `DEBUG = False` in Django settings
2. Use environment variables for secrets
3. Use PostgreSQL instead of SQLite
4. Set up proper CORS origins
5. Use a production WSGI server (Gunicorn)
6. Set up proper logging

### Frontend

1. Build the React app:
```bash
cd frontend
npm run build
```

2. Serve with a web server (nginx, Apache, etc.)

## 📝 API Endpoints

### Django Backend (Port 8080)

- `POST /start_task/` - Start PR analysis
- `GET /task_status_view/<task_id>/` - Get task status
- `GET /api/get_pr_analysis/<task_id>/` - Get analysis results
- `GET /api/get_all_analyses/` - Get all analyses
- `GET /api/statistics/` - Get statistics

### FastAPI Gateway (Port 8000)

- `POST /start_task` - Start PR analysis (proxies to Django)
- `GET /task_status/{task_id}/` - Get task status (proxies to Django)
- `GET /docs` - Interactive API documentation

## 🎓 Learning Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Celery Documentation](https://docs.celeryq.dev/)
- [Groq API Documentation](https://console.groq.com/docs)

## 📄 License

This project is part of a portfolio demonstration.

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements!

---

**Happy Coding! 🚀**

