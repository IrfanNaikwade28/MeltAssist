from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import logging

from .ml.predictor import MeltPredictor

logger = logging.getLogger(__name__)


class MeltOptimizationView(APIView):
    """API endpoint for melt chemistry optimization predictions"""
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.predictor = MeltPredictor()
    
    def post(self, request):
        """
        POST /api/optimize/
        
        Request body:
        {
            "initial_chemistry": {"C": 0.15, "Si": 0.25, "Mn": 0.80, ...},
            "target_chemistry": {"C": 0.18, "Si": 0.30, "Mn": 1.00, ...},
            "melt_weight_kg": 20000  // REQUIRED: Melt size in kg
        }
        """
        try:
            # Validate input
            data = request.data
            
            required_fields = ['initial_chemistry', 'target_chemistry', 'melt_weight_kg']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                return Response(
                    {
                        'status': 'error',
                        'message': f'Missing required fields: {", ".join(missing_fields)}',
                        'hint': 'melt_weight_kg is required (e.g., 20000 for 20 tons)'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            initial_chemistry = data['initial_chemistry']
            target_chemistry = data['target_chemistry']
            melt_weight = data['melt_weight_kg']
            
            # Validate that inputs are correct types
            if not isinstance(initial_chemistry, dict) or not isinstance(target_chemistry, dict):
                return Response(
                    {
                        'status': 'error',
                        'message': 'Chemistry data must be dictionaries'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                melt_weight = float(melt_weight)
            except (ValueError, TypeError):
                return Response(
                    {
                        'status': 'error',
                        'message': 'melt_weight_kg must be a number'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Run prediction
            logger.info(f"Received optimization request for {melt_weight} kg melt")
            result = self.predictor.predict_alloy_additions(
                initial_chemistry, 
                target_chemistry,
                melt_weight
            )
            
            # Return response
            if result['status'] == 'success':
                return Response(result, status=status.HTTP_200_OK)
            else:
                return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            logger.error(f"API error: {str(e)}", exc_info=True)
            return Response(
                {
                    'status': 'error',
                    'message': f'Internal server error: {str(e)}'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
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
