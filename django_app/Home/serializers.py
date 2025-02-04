from rest_framework import serializers
from .models import PRAnalysisResult

class PRAnalysisResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = PRAnalysisResult
        fields = '__all__'
