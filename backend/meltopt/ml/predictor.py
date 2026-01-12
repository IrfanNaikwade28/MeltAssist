"""ML Prediction Engine for kg/ton Models"""

import numpy as np
import logging
from typing import Dict, List, Tuple

from .loader import model_loader
from .config import MODELS, CHEMISTRY_ELEMENTS, SAFETY_THRESHOLDS, STEP_STRATEGY

logger = logging.getLogger(__name__)


class MeltPredictor:
    """Main prediction class for melt chemistry optimization
    
    IMPORTANT: Models predict kg/ton (kilograms per ton of melt).
    This class converts to total kg using melt weight.
    """
    
    def __init__(self):
        self.models = model_loader.get_all_models()
        self.model_configs = MODELS
        
        # Log model expectations
        if self.models:
            first_model = next(iter(self.models.values()))
            if hasattr(first_model, 'n_features_in_'):
                expected_features = first_model.n_features_in_
                actual_features = len(CHEMISTRY_ELEMENTS)
                
                if expected_features != actual_features:
                    logger.error(
                        f"FEATURE MISMATCH: Models expect {expected_features} features, "
                        f"but config has {actual_features}. Update CHEMISTRY_ELEMENTS in config.py!"
                    )
                else:
                    logger.info(f"✓ Models configured correctly ({expected_features} features)")
    
    def compute_chemistry_delta(self, initial: Dict[str, float], target: Dict[str, float]) -> Dict[str, float]:
        """Compute the difference between target and initial chemistry"""
        delta = {}
        for element in CHEMISTRY_ELEMENTS:
            initial_val = initial.get(element, 0.0)
            target_val = target.get(element, 0.0)
            delta[element] = target_val - initial_val
        return delta
    
    def prepare_features(self, chemistry_delta: Dict[str, float]) -> np.ndarray:
        """Convert chemistry delta dict to feature array for ML models"""
        features = [chemistry_delta.get(elem, 0.0) for elem in CHEMISTRY_ELEMENTS]
        return np.array(features).reshape(1, -1)
    
    def check_large_correction(self, delta: Dict[str, float], target: Dict[str, float]) -> bool:
        """Check if chemistry correction is large (requires multiple steps)"""
        for elem in CHEMISTRY_ELEMENTS:
            target_val = target.get(elem, 0.0)
            if target_val > 0:
                relative_change = abs(delta[elem]) / target_val
                if relative_change > STEP_STRATEGY['large_correction_threshold']:
                    return True
        return False
    
    def predict_alloy_additions(self, initial_chemistry: Dict[str, float], 
                                target_chemistry: Dict[str, float],
                                melt_weight_kg: float) -> Dict:
        """Main prediction method
        
        Args:
            initial_chemistry: Current melt chemistry (% for each element)
            target_chemistry: Desired melt chemistry (% for each element)
            melt_weight_kg: Melt size in kilograms
            
        Returns:
            Structured response with step-wise recommendations
        """
        try:
            # ============================================================
            # STEP 1: VALIDATE MELT WEIGHT
            # ============================================================
            if melt_weight_kg < SAFETY_THRESHOLDS['min_melt_weight_kg']:
                return {
                    'status': 'error',
                    'message': f'Melt weight too small: {melt_weight_kg} kg (min: {SAFETY_THRESHOLDS["min_melt_weight_kg"]} kg)',
                }
            
            if melt_weight_kg > SAFETY_THRESHOLDS['max_melt_weight_kg']:
                return {
                    'status': 'error',
                    'message': f'Melt weight too large: {melt_weight_kg} kg (max: {SAFETY_THRESHOLDS["max_melt_weight_kg"]} kg)',
                }
            
            # Convert to tons for calculations
            melt_weight_tons = melt_weight_kg / 1000.0
            
            # ============================================================
            # STEP 2: COMPUTE CHEMISTRY DELTAS
            # ============================================================
            delta = self.compute_chemistry_delta(initial_chemistry, target_chemistry)
            logger.info(f"Chemistry delta: {delta}")
            
            # Check if correction is large
            large_correction = self.check_large_correction(delta, target_chemistry)
            
            # ============================================================
            # STEP 3: PREPARE ML FEATURES
            # ============================================================
            features = self.prepare_features(delta)
            
            # ============================================================
            # STEP 4: RUN PREDICTIONS & CONVERT kg/ton → total kg
            # ============================================================
            predictions = {}
            all_warnings = []
            
            for model_name, model in self.models.items():
                config = self.model_configs[model_name]
                
                # Get prediction from model (kg/ton)
                kg_per_ton = model.predict(features)[0]
                
                # Ensure non-negative
                kg_per_ton = max(0.0, kg_per_ton)
                
                # Check if prediction exceeds reasonable bounds
                if kg_per_ton > config['max_per_ton']:
                    all_warnings.append(
                        f"{model_name}: Model predicted {kg_per_ton:.2f} kg/ton, clamped to {config['max_per_ton']} kg/ton"
                    )
                    kg_per_ton = config['max_per_ton']
                
                # Convert to total kg needed
                total_kg_raw = kg_per_ton * melt_weight_tons
                
                # Apply safety factor (conservative approach)
                total_kg_needed = total_kg_raw * STEP_STRATEGY['safety_factor']
                
                # Determine step recommendation (safe incremental addition)
                max_step = config['max_per_step_kg']
                
                if total_kg_needed <= STEP_STRATEGY['min_step_kg']:
                    # Too small, skip
                    step_recommendation = 0.0
                    estimated_steps = 0
                elif total_kg_needed <= max_step:
                    # Can do in one step
                    step_recommendation = total_kg_needed
                    estimated_steps = 1
                else:
                    # Multiple steps required
                    step_recommendation = max_step
                    estimated_steps = int(np.ceil(total_kg_needed / max_step))
                
                # Warn if approaching step limit
                if step_recommendation > config['max_per_step_kg'] * SAFETY_THRESHOLDS['warn_threshold_multiplier']:
                    all_warnings.append(
                        f"{model_name}: Large step size ({step_recommendation:.0f} kg) - proceed carefully"
                    )
                
                predictions[model_name] = {
                    'step_recommendation_kg': round(step_recommendation, 1),
                    'total_estimated_kg': round(total_kg_needed, 1),
                    'estimated_steps': estimated_steps,
                    'kg_per_ton': round(kg_per_ton, 2),  # For operator reference
                    'max_per_step_kg': config['max_per_step_kg'],
                }
            
            # ============================================================
            # STEP 5: BUILD OPERATOR-FRIENDLY RESPONSE
            # ============================================================
            
            # Add global warnings
            if large_correction:
                all_warnings.insert(0, "⚠️ Large chemistry correction - multiple steps recommended")
            
            # Filter out zero recommendations for cleaner output
            active_recommendations = {
                k: v for k, v in predictions.items() 
                if v['step_recommendation_kg'] > 0
            }
            
            if not active_recommendations:
                return {
                    'status': 'success',
                    'operator_instructions': {
                        'message': 'No alloy additions needed',
                        'next_action': 'Chemistry is within target range',
                    },
                    'chemistry_delta': delta,
                    'melt_weight_kg': float(melt_weight_kg),
                    'melt_weight_tons': round(melt_weight_tons, 2),
                    'recommendations': predictions,
                    'warnings': None,
                    'metadata': {
                        'models_used': list(self.models.keys()),
                        'large_correction': large_correction,
                        'safety_factor_applied': STEP_STRATEGY['safety_factor'],
                    },
                }
            
            response = {
                'status': 'success',
                'operator_instructions': {
                    'message': 'Recommended alloy additions for STEP 1:',
                    'next_action': 'Add alloys → Mix (5-10 min) → Sample → Re-run system',
                },
                'chemistry_delta': delta,
                'melt_weight_kg': float(melt_weight_kg),
                'melt_weight_tons': round(melt_weight_tons, 2),
                'recommendations': predictions,
                'warnings': all_warnings if all_warnings else None,
                'metadata': {
                    'models_used': list(self.models.keys()),
                    'large_correction': large_correction,
                    'safety_factor_applied': STEP_STRATEGY['safety_factor'],
                },
            }
            
            logger.info(f"Predictions generated for {melt_weight_kg} kg ({melt_weight_tons} ton) melt")
            return response
            
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}", exc_info=True)
            return {
                'status': 'error',
                'message': f'Prediction error: {str(e)}',
            }
