from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import logging
import time

from .ml.predictor import MeltPredictor
from .models import MeltOptimizationRequest

logger = logging.getLogger(__name__)


class MeltOptimizationView(APIView):
    """API endpoint for melt chemistry optimization predictions"""
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.predictor = MeltPredictor()
    
    def post(self, request):
        start_time = time.time()
        ip_address = self.get_client_ip(request)
        
        # Initialize variables for database logging
        initial_chemistry = None
        target_chemistry = None
        melt_weight = None
        result = None
        http_status = status.HTTP_200_OK
        
        try:
            # Validate input
            data = request.data
            
            required_fields = ['initial_chemistry', 'target_chemistry', 'melt_weight_kg']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                result = {
                    'status': 'error',
                    'message': f'Missing required fields: {", ".join(missing_fields)}',
                    'hint': 'melt_weight_kg is required (e.g., 20000 for 20 tons)'
                }
                http_status = status.HTTP_400_BAD_REQUEST
                return Response(result, status=http_status)
            
            initial_chemistry = data['initial_chemistry']
            target_chemistry = data['target_chemistry']
            melt_weight = data['melt_weight_kg']
            
            # Validate that inputs are correct types
            if not isinstance(initial_chemistry, dict) or not isinstance(target_chemistry, dict):
                result = {
                    'status': 'error',
                    'message': 'Chemistry data must be dictionaries'
                }
                http_status = status.HTTP_400_BAD_REQUEST
                return Response(result, status=http_status)
            
            try:
                melt_weight = float(melt_weight)
            except (ValueError, TypeError):
                result = {
                    'status': 'error',
                    'message': 'melt_weight_kg must be a number'
                }
                http_status = status.HTTP_400_BAD_REQUEST
                return Response(result, status=http_status)
            
            # Run prediction
            logger.info(f"Received optimization request for {melt_weight} kg melt")
            result = self.predictor.predict_alloy_additions(
                initial_chemistry, 
                target_chemistry,
                melt_weight
            )
            
            # Return response
            if result['status'] == 'success':
                http_status = status.HTTP_200_OK
            else:
                http_status = status.HTTP_500_INTERNAL_SERVER_ERROR
            
            return Response(result, status=http_status)
                
        except Exception as e:
            logger.error(f"API error: {str(e)}", exc_info=True)
            result = {
                'status': 'error',
                'message': f'Internal server error: {str(e)}'
            }
            http_status = status.HTTP_500_INTERNAL_SERVER_ERROR
            return Response(result, status=http_status)
        
        finally:
            # Always save to database, even if there was an error
            try:
                processing_time = (time.time() - start_time) * 1000  # Convert to milliseconds
                
                MeltOptimizationRequest.objects.create(
                    ip_address=ip_address,
                    initial_chemistry=initial_chemistry or {},
                    target_chemistry=target_chemistry or {},
                    melt_weight_kg=melt_weight or 0,
                    response_status=result.get('status', 'error') if result else 'error',
                    response_data=result or {},
                    processing_time_ms=processing_time,
                    http_status_code=http_status,
                    error_message=result.get('message') if result and result.get('status') == 'error' else None
                )
                logger.info(f"Request logged to database (processing time: {processing_time:.2f}ms)")
            except Exception as db_error:
                logger.error(f"Failed to save request to database: {str(db_error)}", exc_info=True)
    
    def get_client_ip(self, request):
        """Extract client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def get(self, request):
        """Health check endpoint"""
        return Response(
            {
                'status': 'healthy',
                'service': 'Melt Chemistry Optimization API',
                'models_loaded': self.predictor.models is not None,
            },
            status=status.HTTP_200_OK
        )
