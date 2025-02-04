from celery import Celery
from Home.models import PRAnalysisResult
from celery import shared_task
app=Celery('django_app')
app.config_from_object('django.cong.settings',namespace="CELERY")
from Home.utils.github import analyze_pr



@shared_task
def analyze_repo_task(repo_url,pr_number,github_token=None):
    result= analyze_pr(repo_url,pr_number,github_token)
    return result


