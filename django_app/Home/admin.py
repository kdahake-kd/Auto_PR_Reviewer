from django.contrib import admin
from .models import PRAnalysisResult

@admin.register(PRAnalysisResult)
class PRAnalysisResultAdmin(admin.ModelAdmin):
    list_display = ('task_id', 'repo_url', 'pr_number', 'created_at')
    search_fields = ('task_id', 'repo_url', 'pr_number')
