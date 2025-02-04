from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .task import analyze_repo_task
from celery.result import AsyncResult
from rest_framework.response import Response
from Home.models import PRAnalysisResult
import json

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
    
def get_pr_analysis(request, task_id):
    print(f"Received task_id: {task_id}")  # Debugging print
    data = {
        'task_id': task_id,
        'analysis': 'Some analysis result'
    }
    return JsonResponse(data)


    

