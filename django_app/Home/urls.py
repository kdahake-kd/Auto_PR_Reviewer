from django.urls import path
from .views import store_pr_analysis, get_pr_analysis
from . import views
urlpatterns = [
    path('store_pr_analysis/', views.store_pr_analysis, name='store_pr_analysis'),
    path('get_pr_analysis/<str:task_id>/',views.get_pr_analysis, name='get_pr_analysis'),
]
