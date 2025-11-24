from django.db import models

class PRAnalysisResult(models.Model):
    task_id = models.CharField(max_length=100, unique=True)
    repo_url = models.URLField()
    pr_number = models.IntegerField()
    analysis_result = models.JSONField()  # Store the AI output as JSON
    created_at = models.DateTimeField(auto_now_add=True)  # Store timestamp


