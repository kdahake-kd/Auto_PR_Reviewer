from django.urls import path
from .views import store_pr_analysis, get_pr_analysis, get_all_analyses, get_statistics
from . import views
urlpatterns = [
    path('store_pr_analysis/', views.store_pr_analysis, name='store_pr_analysis'),
    path('get_pr_analysis/<str:task_id>/', views.get_pr_analysis, name='get_pr_analysis'),
    path('get_all_analyses/', views.get_all_analyses, name='get_all_analyses'),
    path('statistics/', views.get_statistics, name='get_statistics'),
]
