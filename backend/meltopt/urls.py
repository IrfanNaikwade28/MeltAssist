"""URL Configuration for meltopt app"""

from django.urls import path
from .views import MeltOptimizationView

app_name = 'meltopt'

urlpatterns = [
    path('optimize/', MeltOptimizationView.as_view(), name='optimize'),
]
