# Complete Testing Guide for AI PR Review System

## 🚀 Quick Start Testing

### Step 1: Start All Services

Open **5 separate terminal windows/tabs** and run:

#### Terminal 1: Redis Server
```bash
redis-server
```
**Expected Output:**
```
* Ready to accept connections
```

#### Terminal 2: Celery Worker
```bash
cd /Users/kirandahake/Downloads/Auto_pr_review_system/Microservice
source env/bin/activate
cd django_app
celery -A django_app worker -l info
```
**Expected Output:**
```
celery@your-machine ready.
```

#### Terminal 3: Django Backend
```bash
cd /Users/kirandahake/Downloads/Auto_pr_review_system/Microservice
source env/bin/activate
cd django_app
python manage.py runserver 8080
```
**Expected Output:**
```
Starting development server at http://127.0.0.1:8080/
```

#### Terminal 4: FastAPI Gateway
```bash
cd /Users/kirandahake/Downloads/Auto_pr_review_system/Microservice
source env/bin/activate
cd fastapi_app
uvicorn main:app --reload --port 8000
```
**Expected Output:**
```
Uvicorn running on http://127.0.0.1:8000
```

#### Terminal 5: React Frontend
```bash
cd /Users/kirandahake/Downloads/Auto_pr_review_system/Microservice/frontend
npm run dev
```
**Expected Output:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

---

## 🧪 Testing Methods

### Method 1: Frontend Testing (Recommended)

#### 1.1 Open the Application
- Go to: **http://localhost:3000**
- You should see the Dashboard

#### 1.2 Test PR Analysis
1. Click **"Analyze PR"** in the navigation
2. Fill in the form:
   - **Repository URL**: `https://github.com/boxabhi/MyCurrency`
   - **PR Number**: `1`
   - **GitHub Token**: (leave empty for public repos)
3. Click **"Start Analysis"**
4. Watch the status update:
   - Status will change from "PENDING" to "SUCCESS"
   - You'll see "Analysis completed! Redirecting..."
   - Automatically redirects to results page

#### 1.3 View Results
- Results page shows:
  - Repository info
  - PR number
  - Task ID
  - Analysis for each file with:
    - Code style issues
    - Bugs
    - Performance suggestions
    - Best practices

#### 1.4 Test Dashboard
- Click **"Dashboard"** in navigation
- Should see list of all analyses
- Click any analysis to view details

#### 1.5 Test Statistics
- Click **"Statistics"** in navigation
- Should see:
  - Total analyses count
  - Total issues found
  - Breakdown by issue type

---

### Method 2: API Testing with Postman

#### 2.1 Start PR Analysis

**Request:**
- **Method**: `POST`
- **URL**: `http://127.0.0.1:8080/start_task/`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "repo_url": "https://github.com/boxabhi/MyCurrency",
    "pr_number": 1,
    "github_token": null
  }
  ```

**Expected Response:**
```json
{
  "task_id": "abc123-def456-...",
  "status": "Task Started"
}
```

**Save the `task_id` for next steps!**

#### 2.2 Check Task Status

**Request:**
- **Method**: `GET`
- **URL**: `http://127.0.0.1:8080/task_status_view/{task_id}/`
  - Replace `{task_id}` with the task_id from step 2.1
- **Example**: `http://127.0.0.1:8080/task_status_view/abc123-def456-.../`

**Expected Response (while processing):**
```json
{
  "task_id": "abc123-def456-...",
  "status": "PENDING"
}
```

**Expected Response (when complete):**
```json
{
  "task_id": "abc123-def456-...",
  "status": "SUCCESS",
  "result": {
    "task_id": "abc123-def456-...",
    "status": "SAVED",
    "files_analyzed": 4
  }
}
```

#### 2.3 Get Analysis Results

**Request:**
- **Method**: `GET`
- **URL**: `http://127.0.0.1:8080/api/get_pr_analysis/{task_id}/`
  - Replace `{task_id}` with your task_id

**Expected Response:**
```json
{
  "task_id": "abc123-def456-...",
  "repo_url": "https://github.com/boxabhi/MyCurrency",
  "pr_number": 1,
  "analysis_result": [
    {
      "file_name": "fx_rates/models.py",
      "analysis": "{...JSON with issues...}"
    },
    ...
  ],
  "created_at": "2025-11-24T10:00:00Z"
}
```

#### 2.4 Get All Analyses

**Request:**
- **Method**: `GET`
- **URL**: `http://127.0.0.1:8080/api/get_all_analyses/`

**Expected Response:**
```json
{
  "count": 5,
  "results": [
    {
      "task_id": "abc123-...",
      "repo_url": "https://github.com/...",
      "pr_number": 1,
      "created_at": "2025-11-24T10:00:00Z",
      "file_count": 4
    },
    ...
  ]
}
```

#### 2.5 Get Statistics

**Request:**
- **Method**: `GET`
- **URL**: `http://127.0.0.1:8080/api/statistics/`

**Expected Response:**
```json
{
  "total_analyses": 5,
  "total_issues_found": 23,
  "issues_by_type": {
    "style": 8,
    "bugs": 5,
    "performance": 4,
    "best_practice": 6
  }
}
```

---

### Method 3: Testing with cURL

#### 3.1 Start Analysis
```bash
curl -X POST http://127.0.0.1:8080/start_task/ \
  -H "Content-Type: application/json" \
  -d '{
    "repo_url": "https://github.com/boxabhi/MyCurrency",
    "pr_number": 1,
    "github_token": null
  }'
```

#### 3.2 Check Status
```bash
curl http://127.0.0.1:8080/task_status_view/{task_id}/
```

#### 3.3 Get Results
```bash
curl http://127.0.0.1:8080/api/get_pr_analysis/{task_id}/
```

---

## ✅ Test Cases

### Test Case 1: Basic PR Analysis
**Input:**
- Repository: `https://github.com/boxabhi/MyCurrency`
- PR Number: `1`

**Expected:**
- ✅ Task starts successfully
- ✅ Status changes to SUCCESS
- ✅ Results saved to database
- ✅ Analysis shows issues for each file

### Test Case 2: Invalid PR Number
**Input:**
- Repository: `https://github.com/boxabhi/MyCurrency`
- PR Number: `99999` (doesn't exist)

**Expected:**
- ✅ Error message: "PR #99999 not found"
- ✅ Error saved to database
- ✅ Frontend shows error message

### Test Case 3: Invalid Repository URL
**Input:**
- Repository: `https://github.com/invalid/repo`
- PR Number: `1`

**Expected:**
- ✅ Error message about repository not found
- ✅ Error saved to database

### Test Case 4: Empty PR (No Files Changed)
**Input:**
- Repository with PR that has no file changes

**Expected:**
- ✅ Task completes successfully
- ✅ Shows message: "No files changed"
- ✅ Results saved with info message

### Test Case 5: Multiple Analyses
**Input:**
- Run analysis for multiple different PRs

**Expected:**
- ✅ All analyses saved separately
- ✅ Dashboard shows all analyses
- ✅ Statistics aggregate all results

---

## 🔍 What to Check

### 1. Celery Worker Logs
Watch Terminal 2 for:
```
[INFO] Task received
[INFO] Starting analysis for PR #1
[INFO] Found 4 files in PR
[INFO] Analyzing file 1/4: fx_rates/models.py
[INFO] ✓ Completed analysis for fx_rates/models.py
[INFO] Analysis complete: 4 files analyzed
[INFO] Task saved to database successfully
```

### 2. Django Server Logs
Watch Terminal 3 for:
```
POST /start_task/ HTTP/1.1" 200
GET /task_status_view/.../ HTTP/1.1" 200
GET /api/get_pr_analysis/.../ HTTP/1.1" 200
```

### 3. Database
Check if results are saved:
```bash
source env/bin/activate
cd django_app
python manage.py shell
```

In Python shell:
```python
from Home.models import PRAnalysisResult
results = PRAnalysisResult.objects.all()
for r in results:
    print(f"Task: {r.task_id}, PR: {r.pr_number}, Files: {len(r.analysis_result)}")
```

### 4. Frontend Console
Open browser DevTools (F12) → Console tab:
- Check for API errors
- Look for debug logs
- Verify API calls are successful

---

## 🐛 Troubleshooting

### Issue: "Task ID not found"
**Solution:**
- Wait a few seconds after task starts
- Check Celery worker is running
- Verify task completed successfully

### Issue: "No analysis results"
**Solution:**
- Check Celery logs for errors
- Verify Groq API key is valid
- Check GitHub API is accessible
- Verify PR has files changed

### Issue: "GitHub API 404"
**Solution:**
- Verify repository URL is correct (no trailing slash)
- Check PR number exists
- For private repos, add GitHub token

### Issue: "Groq API Error"
**Solution:**
- Check API key in `django_app/Home/utils/ai_agent.py`
- Verify API quota/limits
- Check model name is correct

### Issue: Frontend not loading
**Solution:**
- Check all 5 services are running
- Verify ports: 3000 (frontend), 8080 (Django), 8000 (FastAPI)
- Check browser console for errors
- Clear browser cache

---

## 📊 Expected Results

### Successful Analysis Should Show:

1. **File-by-file breakdown:**
   - File name
   - Issues found (if any)
   - Suggestions for each issue

2. **Issue Categories:**
   - **Style**: Code formatting issues
   - **Bugs**: Potential errors
   - **Performance**: Optimization opportunities
   - **Best Practice**: Coding standards

3. **Statistics:**
   - Total analyses
   - Total issues found
   - Breakdown by type

---

## 🎯 Quick Test Checklist

- [ ] All 5 services running
- [ ] Frontend accessible at http://localhost:3000
- [ ] Can submit PR analysis
- [ ] Status updates correctly
- [ ] Results displayed properly
- [ ] Dashboard shows all analyses
- [ ] Statistics page works
- [ ] No errors in console/logs

---

## 📝 Sample Test Data

### Public Repository Test:
```json
{
  "repo_url": "https://github.com/boxabhi/MyCurrency",
  "pr_number": 1,
  "github_token": null
}
```

### Private Repository Test (requires token):
```json
{
  "repo_url": "https://github.com/your-username/private-repo",
  "pr_number": 1,
  "github_token": "ghp_your_token_here"
}
```

---

**Happy Testing! 🚀**

If you encounter any issues, check the logs in each terminal and refer to the troubleshooting section above.

