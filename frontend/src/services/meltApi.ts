/**
 * MeltAssist API Service
 * 
 * Handles all communication with the Django REST backend
 * for melt chemistry optimization.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

/**
 * API Request payload structure
 */
export interface OptimizeMeltPayload {
  initial_chemistry: {
    C: number;
    Si: number;
    Mn: number;
    Cr: number;
    Ni: number;
  };
  target_chemistry: {
    C: number;
    Si: number;
    Mn: number;
    Cr: number;
    Ni: number;
  };
  melt_weight_kg: number;
}

/**
 * API Response structure from Django backend
 */
export interface OptimizeMeltResponse {
  status: string;
  operator_instructions: {
    message: string;
    next_action: string;
  };
  chemistry_delta: {
    C: number;
    Si: number;
    Mn: number;
    Cr: number;
    Ni: number;
  };
  recommendations: {
    [alloyName: string]: {
      step_recommendation_kg: number;
      total_estimated_kg: number;
      estimated_steps: number;
      kg_per_ton: number;
      max_per_step_kg: number;
    };
  };
  warnings: string[] | null;
  melt_weight_kg: number;
  melt_weight_tons: number;
  metadata: {
    models_used: string[];
    large_correction: boolean;
    safety_factor_applied: number;
  };
}

/**
 * API Error structure
 */
export class MeltApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'MeltApiError';
  }
}

/**
 * Validates input payload before sending to API
 */
function validatePayload(payload: OptimizeMeltPayload): void {
  const { initial_chemistry, target_chemistry, melt_weight_kg } = payload;

  // Validate melt weight
  if (!melt_weight_kg || melt_weight_kg <= 0) {
    throw new MeltApiError('Melt weight must be greater than 0 kg');
  }

  if (melt_weight_kg < 100 || melt_weight_kg > 50000) {
    throw new MeltApiError('Melt weight must be between 100 and 50,000 kg');
  }

  // Validate chemistry values
  const elements = ['C', 'Si', 'Mn', 'Cr', 'Ni'] as const;
  
  for (const element of elements) {
    const initialValue = initial_chemistry[element];
    const targetValue = target_chemistry[element];

    if (typeof initialValue !== 'number' || isNaN(initialValue)) {
      throw new MeltApiError(`Initial ${element} value is invalid`);
    }

    if (typeof targetValue !== 'number' || isNaN(targetValue)) {
      throw new MeltApiError(`Target ${element} value is invalid`);
    }

    if (initialValue < 0 || initialValue > 100) {
      throw new MeltApiError(`Initial ${element} must be between 0 and 100%`);
    }

    if (targetValue < 0 || targetValue > 100) {
      throw new MeltApiError(`Target ${element} must be between 0 and 100%`);
    }
  }
}

/**
 * Main API function: Optimize melt chemistry
 * 
 * Sends chemistry data to Django backend and returns
 * alloy addition recommendations.
 * 
 * @param payload - Melt chemistry input data
 * @returns Optimization response with recommendations
 * @throws MeltApiError on validation or network errors
 */
export async function optimizeMelt(
  payload: OptimizeMeltPayload
): Promise<OptimizeMeltResponse> {
  // Validate payload before sending
  validatePayload(payload);

  try {
    const response = await fetch(`${API_BASE_URL}/api/optimize/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Handle non-200 responses
    if (!response.ok) {
      let errorMessage = 'Optimization request failed';
      let errorDetails: unknown = null;

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        errorDetails = errorData;
      } catch {
        // If response isn't JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }

      throw new MeltApiError(errorMessage, response.status, errorDetails);
    }

    // Parse successful response
    const data: OptimizeMeltResponse = await response.json();
    
    // Log the response for debugging
    console.log('API Response:', data);

    // Validate response structure
    if (!data || data.status !== 'success') {
      console.error('Invalid API response structure:', data);
      throw new MeltApiError('Invalid response from optimization service');
    }

    return data;

  } catch (error) {
    // Handle network errors
    if (error instanceof MeltApiError) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new MeltApiError(
        'Cannot connect to optimization service. Please ensure the backend is running.',
        0
      );
    }

    // Handle unknown errors
    throw new MeltApiError(
      'An unexpected error occurred during optimization',
      undefined,
      error
    );
  }
}

/**
 * Converts API response to internal application format
 * 
 * Maps Django backend response structure to the frontend's
 * expected data structure for rendering.
 */
export function mapApiResponseToInternal(
  apiResponse: OptimizeMeltResponse
) {
  // Defensive checks for missing data
  if (!apiResponse) {
    throw new Error('API response is undefined');
  }
  
  if (!apiResponse.recommendations) {
    console.error('Invalid API response structure:', apiResponse);
    throw new Error('API response is missing recommendations');
  }

  // Convert recommendations object to array
  const alloyRecommendations = Object.entries(apiResponse.recommendations).map(([name, data]) => ({
    name,
    step1Kg: data.step_recommendation_kg,
    totalEstimatedKg: data.total_estimated_kg,
    estimatedSteps: data.estimated_steps,
    alloyRate: data.kg_per_ton,
    maxPerStep: data.max_per_step_kg,
    isCostSensitive: false, // Backend doesn't provide this yet
  }));

  // Create checklist from operator instructions
  const checklist = [
    apiResponse.operator_instructions.message,
    apiResponse.operator_instructions.next_action,
    'Monitor melt temperature during additions',
    'Take spectrometer sample after mixing',
  ];

  return {
    meltWeight: apiResponse.melt_weight_kg,
    meltWeightTons: apiResponse.melt_weight_tons,
    safetyFactor: apiResponse.metadata?.safety_factor_applied || 0.85,
    alloyRecommendations,
    operatorInstructions: {
      message: apiResponse.operator_instructions.message,
      checklist,
    },
    warnings: (apiResponse.warnings || []).map((warning) => ({
      type: 'caution' as const,
      message: warning,
    })),
    metadata: {
      largeCorrection: apiResponse.metadata?.large_correction || false,
      clampedPredictions: false, // Backend doesn't provide this
    },
  };
}

/**
 * Health check for backend API
 * 
 * @returns true if backend is reachable, false otherwise
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health/`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    return response.ok;
  } catch {
    return false;
  }
}
