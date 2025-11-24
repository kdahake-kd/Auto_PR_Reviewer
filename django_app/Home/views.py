from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .task import analyze_repo_task
from celery.result import AsyncResult
from rest_framework.response import Response
from Home.models import PRAnalysisResult
import json
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from .models import PRAnalysisResult


@api_view(['POST'])
def start_task(request):
    data=request.data
    repo_url=data.get('repo_url')
    pr_number=data.get('pr_number')
    github_token=data.get('github_token')
    task=analyze_repo_task.delay(repo_url,pr_number,github_token)

    return Response({
        "task_id":task.id,
        "status":"Task Started"
    })


@api_view(['GET'])
def task_status_view(request,task_id):
    result=AsyncResult(task_id)    
    if result.state=="SUCCESS":
        return Response({
        "task_id":task_id,
        "status":result.state,
        "result":result.result
    })

    return Response({"task_id": task_id, "status": result.state})


import json
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import PRAnalysisResult
from .serializers import PRAnalysisResultSerializer

# @api_view(['POST'])
def store_pr_analysis(request):
    try:
        data = request.data  # Get JSON data from request
        task_id = data.get("task_id")
        repo_url = data.get("repo_url")
        pr_number = data.get("pr_number")
        analysis_result = data.get("analysis_result")

        if not task_id or not repo_url or not pr_number or not analysis_result:
            return Response({"error": "Missing required fields"}, status=400)

        # Store result in database
        obj, created = PRAnalysisResult.objects.update_or_create(
            task_id=task_id,
            defaults={"repo_url": repo_url, "pr_number": pr_number, "analysis_result": analysis_result}
        )

        return Response({"message": "Task result stored", "created": created})
    except Exception as e:
        return Response({"error": "Failed to save data", "details": str(e)}, status=400)

# @api_view(['GET'])
# def get_pr_analysis(request, task_id):
#     try:
#         result = PRAnalysisResult.objects.get(task_id=task_id)
#         serializer = PRAnalysisResultSerializer(result)
#         return Response(serializer.data)
#     except PRAnalysisResult.DoesNotExist:
#         return Response({"error": "Task ID not found"}, status=404)
    
@api_view(['GET'])
def get_pr_analysis(request, task_id):
    try:
        pr_result = PRAnalysisResult.objects.get(task_id=task_id)
        
        # Debug logging
        print(f"Retrieving analysis for task_id: {task_id}")
        print(f"Analysis result type: {type(pr_result.analysis_result)}")
        print(f"Analysis result: {pr_result.analysis_result}")
        
        # Ensure analysis_result is a list
        analysis_result = pr_result.analysis_result
        if not isinstance(analysis_result, list):
            print(f"WARNING: analysis_result is not a list, it's {type(analysis_result)}")
            analysis_result = []
        
        data = {
            "task_id": pr_result.task_id,
            "repo_url": pr_result.repo_url,
            "pr_number": pr_result.pr_number,
            "analysis_result": analysis_result,
            "created_at": pr_result.created_at.isoformat(),
            "debug": {
                "result_type": str(type(analysis_result)),
                "result_length": len(analysis_result) if isinstance(analysis_result, list) else 0,
            }
        }
        return Response(data)
    except PRAnalysisResult.DoesNotExist:
        return Response({"error": "Task ID not found"}, status=404)
    except Exception as e:
        print(f"ERROR in get_pr_analysis: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({"error": f"Failed to retrieve analysis: {str(e)}"}, status=500)


@api_view(['GET'])
def get_all_analyses(request):
    """Get all PR analyses with pagination"""
    analyses = PRAnalysisResult.objects.all().order_by('-created_at')
    results = []
    for analysis in analyses:
        results.append({
            "task_id": analysis.task_id,
            "repo_url": analysis.repo_url,
            "pr_number": analysis.pr_number,
            "created_at": analysis.created_at.isoformat(),
            "file_count": len(analysis.analysis_result) if isinstance(analysis.analysis_result, list) else 0,
        })
    return Response({"count": len(results), "results": results})


@api_view(['GET'])
def get_statistics(request):
    """Get statistics about all analyses"""
    total_analyses = PRAnalysisResult.objects.count()
    analyses = PRAnalysisResult.objects.all()
    
    total_issues = 0
    issue_types = {"style": 0, "bugs": 0, "performance": 0, "best_practice": 0}
    
    for analysis in analyses:
        if isinstance(analysis.analysis_result, list):
            for file_result in analysis.analysis_result:
                if isinstance(file_result.get("analysis"), str):
                    try:
                        import json
                        analysis_data = json.loads(file_result["analysis"])
                        if "issues" in analysis_data:
                            for issue in analysis_data["issues"]:
                                total_issues += 1
                                issue_type = issue.get("type", "").lower()
                                if issue_type in issue_types:
                                    issue_types[issue_type] += 1
                    except:
                        pass
    
    return Response({
        "total_analyses": total_analyses,
        "total_issues_found": total_issues,
        "issues_by_type": issue_types,
    })

    

