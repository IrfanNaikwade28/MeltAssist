import { useState } from 'react';
import { CheckCircle2, RefreshCw, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ApiResponse } from '@/types/foundry';

interface CompletionStepProps {
  apiResponse: ApiResponse;
  onRecalculate: () => void;
  onReset: () => void;
  isLoading: boolean;
}

export function CompletionStep({ apiResponse, onRecalculate, onReset, isLoading }: CompletionStepProps) {
  const [approved, setApproved] = useState(false);

  const handleApprove = () => {
    setApproved(true);
  };

  if (approved) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <Card className="max-w-xl w-full shadow-lg border-2 border-success/50 bg-success/5">
          <CardContent className="pt-12 pb-8 text-center">
            <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-14 h-14 text-success" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              STEP-1 Approved
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Alloy additions have been approved. Proceed with physical additions according to the operator instructions.
            </p>
            <div className="bg-card rounded-lg p-6 text-left mb-8">
              <h3 className="font-semibold mb-4">Approved Additions:</h3>
              <div className="grid grid-cols-2 gap-4">
                {apiResponse.alloyRecommendations.filter(a => a.step1Kg > 0).map(alloy => (
                  <div key={alloy.name} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">{alloy.name}</span>
                    <span className="font-mono font-bold text-primary">{alloy.step1Kg} kg</span>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={onReset} size="lg" variant="outline" className="h-12 px-8">
              Start New Correction
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Final Approval</h2>
          <p className="text-muted-foreground">
            Review and confirm STEP-1 alloy additions
          </p>
        </div>

        {/* Summary Card */}
        <Card className="shadow-lg border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl">STEP-1 Addition Summary</CardTitle>
            <CardDescription>Total alloys to be added in this correction step</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {apiResponse.alloyRecommendations.map(alloy => (
                <div 
                  key={alloy.name} 
                  className={`p-4 rounded-lg border-2 text-center ${
                    alloy.step1Kg > 0 
                      ? 'border-primary/30 bg-primary/5' 
                      : 'border-border bg-muted/30'
                  }`}
                >
                  <p className="text-sm text-muted-foreground mb-1">{alloy.name}</p>
                  <p className={`text-3xl font-bold font-mono ${
                    alloy.step1Kg > 0 ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {alloy.step1Kg}
                    <span className="text-base font-normal ml-1">kg</span>
                  </p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Melt Weight</p>
                <p className="text-xl font-semibold font-mono">{apiResponse.meltWeight.toLocaleString()} kg</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Safety Factor</p>
                <p className="text-xl font-semibold">{(apiResponse.safetyFactor * 100).toFixed(0)}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total STEP-1</p>
                <p className="text-xl font-semibold font-mono text-primary">
                  {apiResponse.alloyRecommendations.reduce((sum, a) => sum + a.step1Kg, 0)} kg
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warning Banner */}
        {apiResponse.warnings.length > 0 && (
          <Card className="shadow-md border-warning/50 bg-warning/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0" />
                <div>
                  <p className="font-semibold text-warning-foreground mb-2">
                    {apiResponse.warnings.length} Active Alert{apiResponse.warnings.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please ensure you have reviewed all warnings before approving.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-4 pt-4">
          {/* Approve Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="lg" className="h-16 text-lg font-semibold col-span-1 md:col-span-1">
                <CheckCircle2 className="w-6 h-6 mr-2" />
                Approve & Execute STEP-1
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm STEP-1 Approval</AlertDialogTitle>
                <AlertDialogDescription className="text-base">
                  You are about to approve the following alloy additions:
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    {apiResponse.alloyRecommendations.filter(a => a.step1Kg > 0).map(alloy => (
                      <div key={alloy.name} className="flex justify-between py-1">
                        <span>{alloy.name}</span>
                        <span className="font-mono font-semibold">{alloy.step1Kg} kg</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4">
                    This action cannot be undone. Proceed only if you are ready to add alloys.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleApprove}>
                  Confirm Approval
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Recalculate Button */}
          <Button 
            size="lg" 
            variant="secondary" 
            className="h-16 text-lg font-semibold"
            onClick={onRecalculate}
            disabled={isLoading}
          >
            <RefreshCw className={`w-6 h-6 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Recalculate
          </Button>

          {/* Abort Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                size="lg" 
                variant="destructive" 
                className="h-16 text-lg font-semibold"
              >
                <XCircle className="w-6 h-6 mr-2" />
                Abort / Cancel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Abort Correction?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will cancel the current correction operation and return to the melt input screen.
                  All entered data will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Continue Working</AlertDialogCancel>
                <AlertDialogAction onClick={onReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Abort Correction
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
