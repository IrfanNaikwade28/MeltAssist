import { ArrowRight, AlertTriangle, AlertCircle, Shield, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ApiResponse } from '@/types/foundry';

interface ReSamplingStepProps {
  apiResponse: ApiResponse;
  onNext: () => void;
}

export function ReSamplingStep({ apiResponse, onNext }: ReSamplingStepProps) {
  const { warnings, metadata } = apiResponse;
  const hasWarnings = warnings.length > 0;
  const hasCautions = warnings.some(w => w.type === 'caution');
  const hasDangers = warnings.some(w => w.type === 'danger');

  return (
    <div className="h-full p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Safety & Warnings Review</h2>
          <p className="text-muted-foreground">
            Review all alerts before proceeding with alloy additions
          </p>
        </div>

        {/* Status Card */}
        <Card className={`shadow-lg border-2 ${
          hasDangers ? 'border-destructive/50 bg-destructive/5' : 
          hasCautions ? 'border-warning/50 bg-warning/5' : 
          'border-success/50 bg-success/5'
        }`}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                hasDangers ? 'bg-destructive/10' : 
                hasCautions ? 'bg-warning/10' : 
                'bg-success/10'
              }`}>
                {hasDangers ? (
                  <AlertCircle className="w-6 h-6 text-destructive" />
                ) : hasCautions ? (
                  <AlertTriangle className="w-6 h-6 text-warning" />
                ) : (
                  <Shield className="w-6 h-6 text-success" />
                )}
              </div>
              <div>
                <CardTitle className="text-xl">
                  {hasDangers ? 'High Risk Alerts Present' : 
                   hasCautions ? 'Caution Alerts Present' : 
                   'All Checks Passed'}
                </CardTitle>
                <CardDescription>
                  {hasWarnings 
                    ? `${warnings.length} alert${warnings.length > 1 ? 's' : ''} require${warnings.length === 1 ? 's' : ''} attention`
                    : 'No warnings or alerts detected'
                  }
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Warning Alerts */}
        {hasWarnings && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Active Alerts</h3>
            {warnings.map((warning, index) => (
              <Alert
                key={index}
                variant={warning.type === 'danger' ? 'destructive' : 'default'}
                className={warning.type === 'caution' ? 'border-warning bg-warning/10' : ''}
              >
                {warning.type === 'danger' ? (
                  <AlertCircle className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-warning" />
                )}
                <AlertTitle className={warning.type === 'caution' ? 'text-warning-foreground' : ''}>
                  {warning.type === 'danger' ? 'High Risk' : 'Caution'}
                </AlertTitle>
                <AlertDescription className="text-base mt-2">
                  {warning.message}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Metadata Status */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Correction Analysis</CardTitle>
            <CardDescription>System analysis of the correction operation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className={`p-4 rounded-lg border-2 ${
                metadata.largeCorrection 
                  ? 'border-warning/50 bg-warning/5' 
                  : 'border-success/50 bg-success/5'
              }`}>
                <div className="flex items-start gap-3">
                  {metadata.largeCorrection ? (
                    <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                  ) : (
                    <Shield className="w-5 h-5 text-success mt-0.5" />
                  )}
                  <div>
                    <p className="font-semibold">Correction Size</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {metadata.largeCorrection 
                        ? 'Large correction detected — multi-step correction recommended'
                        : 'Normal correction size — within safe limits'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg border-2 ${
                metadata.clampedPredictions 
                  ? 'border-warning/50 bg-warning/5' 
                  : 'border-success/50 bg-success/5'
              }`}>
                <div className="flex items-start gap-3">
                  {metadata.clampedPredictions ? (
                    <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                  ) : (
                    <Shield className="w-5 h-5 text-success mt-0.5" />
                  )}
                  <div>
                    <p className="font-semibold">Prediction Status</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {metadata.clampedPredictions 
                        ? 'Some predictions clamped to safe limits'
                        : 'All predictions within normal bounds'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="shadow-md bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Info className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold mb-2">Before Proceeding</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Ensure all safety equipment is in place</li>
                  <li>• Verify alloy bins contain correct materials</li>
                  <li>• Confirm melt temperature is within operating range</li>
                  <li>• Review all warnings above carefully</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-center pt-4">
          <Button 
            onClick={onNext} 
            size="lg" 
            className="h-14 px-12 text-lg font-semibold"
          >
            Proceed to Final Approval
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
