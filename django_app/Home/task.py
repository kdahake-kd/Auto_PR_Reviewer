from celery import Celery
from Home.models import PRAnalysisResult
from celery import shared_task
app=Celery('django_app')
app.config_from_object('django.cong.settings',namespace="CELERY")
from Home.utils.github import analyze_pr



@shared_task
def analyze_repo_task(repo_url,pr_number,github_token=None):
    # Use the Celery task ID instead of generating a new UUID
    task_id = analyze_repo_task.request.id
    try:
        result = analyze_pr(repo_url, pr_number, github_token, task_id)
        print(f"Analysis result for task {task_id}: {len(result.get('result', []))} files analyzed")
        
        # Check if result is empty
        if not result.get("result") or len(result.get("result", [])) == 0:
            print(f"WARNING: No analysis results for task {task_id}. This might mean:")
            print(f"  - PR has no files changed")
            print(f"  - GitHub API returned no files")
            print(f"  - Error occurred during analysis")
            # Save empty result with error message
            error_result = [{
                "file_name": "No files analyzed",
                "analysis": '{"issues": [{"type": "warning", "description": "No files were found or analyzed in this PR", "suggestion": "Please verify the PR number and repository URL"}]}'
            }]
            PRAnalysisResult.objects.update_or_create(
                task_id=task_id,
                defaults={
                    "repo_url": repo_url,
                    "pr_number": pr_number,
                    "analysis_result": error_result
                }
            )
            return {"task_id": task_id, "status": "SAVED", "files_analyzed": 0, "warning": "No files analyzed"}
        
        PRAnalysisResult.objects.update_or_create(
            task_id=task_id,
            defaults={
                "repo_url": repo_url,
                "pr_number": pr_number,
                "analysis_result": result["result"]
            }
        )
        print(f"Task {task_id} saved to database successfully")
        return {"task_id": task_id, "status": "SAVED", "files_analyzed": len(result.get("result", []))}
    except Exception as e:
        print(f"ERROR in analyze_repo_task for task {task_id}: {str(e)}")
        import traceback
        traceback.print_exc()
        # Save error state to database with proper structure
        error_result = [{
            "file_name": "Analysis Error",
            "analysis": f'{{"issues": [{{"type": "error", "line": 0, "description": "{str(e)}", "suggestion": "Please check repository URL, PR number, and API credentials"}}]}}'
        }]
        PRAnalysisResult.objects.update_or_create(
            task_id=task_id,
            defaults={
                "repo_url": repo_url,
                "pr_number": pr_number,
                "analysis_result": error_result
            }
        )
        return {"task_id": task_id, "status": "ERROR", "error": str(e)}




