from django.db import models
from django.utils import timezone


class MeltOptimizationRequest(models.Model):
    """Store melt optimization API requests and responses for auditing and analytics"""
    
    # Request information
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    # Input data
    initial_chemistry = models.JSONField()
    target_chemistry = models.JSONField()
    melt_weight_kg = models.FloatField()
    
    # Response data
    response_status = models.CharField(max_length=20, db_index=True)  # 'success' or 'error'
    response_data = models.JSONField()
    
    # Metadata
    processing_time_ms = models.FloatField(null=True, blank=True)
    http_status_code = models.IntegerField(default=200)
    error_message = models.TextField(null=True, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Melt Optimization Request"
        verbose_name_plural = "Melt Optimization Requests"
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['response_status']),
        ]
    
    def __str__(self):
        return f"Request at {self.timestamp} - {self.response_status} ({self.melt_weight_kg} kg)"
    
    @property
    def was_successful(self):
        return self.response_status == 'success'
