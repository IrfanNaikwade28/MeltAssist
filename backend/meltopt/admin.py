from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
import json
from .models import MeltOptimizationRequest


@admin.register(MeltOptimizationRequest)
class MeltOptimizationRequestAdmin(admin.ModelAdmin):
    """Admin interface for viewing melt optimization requests"""
    
    list_display = ['timestamp', 'melt_weight_kg', 'response_status_badge', 'processing_time_ms', 
                   'ip_address', 'http_status_code', 'view_details_link']
    list_filter = ['response_status', 'timestamp', 'http_status_code']
    search_fields = ['ip_address', 'error_message']
    readonly_fields = ['timestamp', 'ip_address', 'initial_chemistry_display', 'target_chemistry_display', 
                      'melt_weight_kg', 'response_status', 'response_data_display', 
                      'processing_time_ms', 'http_status_code', 'error_message']
    
    date_hierarchy = 'timestamp'
    
    def has_add_permission(self, request):
        # Don't allow manual creation of records
        return False
    
    def has_delete_permission(self, request, obj=None):
        # Allow deletion for cleanup
        return True
    
    def response_status_badge(self, obj):
        """Display status with color badge"""
        if obj.response_status == 'success':
            color = 'green'
        else:
            color = 'red'
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.response_status
        )
    response_status_badge.short_description = 'Status'
    
    def view_details_link(self, obj):
        """Add a clickable link to view full details"""
        return format_html(
            '<a href="{}" style="font-weight: bold;">View Full Details →</a>',
            f'/admin/meltopt/meltoptimizationrequest/{obj.pk}/change/'
        )
    view_details_link.short_description = 'Details'
    
    def initial_chemistry_display(self, obj):
        """Display initial chemistry as formatted JSON"""
        return format_html('<pre style="background: #f5f5f5; padding: 10px; border-radius: 5px;">{}</pre>', 
                          json.dumps(obj.initial_chemistry, indent=2))
    initial_chemistry_display.short_description = 'Initial Chemistry'
    
    def target_chemistry_display(self, obj):
        """Display target chemistry as formatted JSON"""
        return format_html('<pre style="background: #f5f5f5; padding: 10px; border-radius: 5px;">{}</pre>', 
                          json.dumps(obj.target_chemistry, indent=2))
    target_chemistry_display.short_description = 'Target Chemistry'
    
    def response_data_display(self, obj):
        """Display response data as formatted JSON"""
        return format_html('<pre style="background: #f5f5f5; padding: 10px; border-radius: 5px; max-height: 500px; overflow: auto;">{}</pre>', 
                          json.dumps(obj.response_data, indent=2))
    response_data_display.short_description = 'Response Data'
    
    fieldsets = (
        ('Request Information', {
            'fields': ('timestamp', 'ip_address', 'processing_time_ms')
        }),
        ('Input Data', {
            'fields': ('melt_weight_kg', 'initial_chemistry_display', 'target_chemistry_display'),
            'description': 'Click to expand and view the full chemistry data'
        }),
        ('Response', {
            'fields': ('response_status', 'http_status_code', 'response_data_display', 'error_message'),
            'description': 'Full response data with predictions and recommendations'
        }),
    )
