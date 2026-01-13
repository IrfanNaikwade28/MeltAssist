import { useState } from 'react';
import { FlaskConical, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MeltInput, Chemistry } from '@/types/foundry';

interface MeltInputStepProps {
  onSubmit: (input: MeltInput) => void;
  isLoading: boolean;
}

const CHEMISTRY_FIELDS: (keyof Chemistry)[] = ['C', 'Si', 'Mn', 'Cr', 'Ni'];

const placeholderInitial: Chemistry = { C: 0.35, Si: 0.25, Mn: 0.45, Cr: 0.15, Ni: 0.10 };
const placeholderTarget: Chemistry = { C: 0.40, Si: 0.35, Mn: 0.60, Cr: 0.25, Ni: 0.15 };

export function MeltInputStep({ onSubmit, isLoading }: MeltInputStepProps) {
  const [initialChemistry, setInitialChemistry] = useState<Partial<Chemistry>>({});
  const [targetChemistry, setTargetChemistry] = useState<Partial<Chemistry>>({});
  const [meltWeight, setMeltWeight] = useState<number | ''>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Fill in any missing fields with 0
    const completeInitial: Chemistry = {
      C: initialChemistry.C ?? 0,
      Si: initialChemistry.Si ?? 0,
      Mn: initialChemistry.Mn ?? 0,
      Cr: initialChemistry.Cr ?? 0,
      Ni: initialChemistry.Ni ?? 0,
    };
    const completeTarget: Chemistry = {
      C: targetChemistry.C ?? 0,
      Si: targetChemistry.Si ?? 0,
      Mn: targetChemistry.Mn ?? 0,
      Cr: targetChemistry.Cr ?? 0,
      Ni: targetChemistry.Ni ?? 0,
    };
    onSubmit({ 
      initialChemistry: completeInitial, 
      targetChemistry: completeTarget, 
      meltWeight: typeof meltWeight === 'number' ? meltWeight : 0 
    });
  };

  const updateInitial = (field: keyof Chemistry, value: string) => {
    if (value === '') {
      setInitialChemistry(prev => {
        const newState = { ...prev };
        delete newState[field];
        return newState;
      });
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setInitialChemistry(prev => ({ ...prev, [field]: numValue }));
      }
    }
  };

  const updateTarget = (field: keyof Chemistry, value: string) => {
    if (value === '') {
      setTargetChemistry(prev => {
        const newState = { ...prev };
        delete newState[field];
        return newState;
      });
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setTargetChemistry(prev => ({ ...prev, [field]: numValue }));
      }
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-center min-h-full py-4">
        <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader className="text-center pb-4 sm:pb-6">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
            <FlaskConical className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <CardTitle className="text-xl sm:text-2xl">Melt Chemistry Input</CardTitle>
          <CardDescription className="text-sm sm:text-base mt-2">
            Enter spectrometer readings and target composition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Initial Chemistry */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <div className="w-3 h-3 rounded-full bg-chart-2 flex-shrink-0" />
                  <h3 className="font-semibold text-base sm:text-lg">Initial Chemistry</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {CHEMISTRY_FIELDS.map(field => (
                    <div key={`initial-${field}`} className="space-y-2">
                      <Label htmlFor={`initial-${field}`} className="text-xs sm:text-sm font-medium">
                        {field} (%)
                      </Label>
                      <Input
                        id={`initial-${field}`}
                        type="number"
                        step="0.001"
                        min="0"
                        max="100"
                        value={initialChemistry[field] !== undefined ? initialChemistry[field] : ''}
                        onChange={(e) => updateInitial(field, e.target.value)}
                        placeholder={placeholderInitial[field].toString()}
                        className="text-base sm:text-lg font-mono h-10 sm:h-12"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Chemistry */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <div className="w-3 h-3 rounded-full bg-chart-1 flex-shrink-0" />
                  <h3 className="font-semibold text-base sm:text-lg">Target Chemistry</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {CHEMISTRY_FIELDS.map(field => (
                    <div key={`target-${field}`} className="space-y-2">
                      <Label htmlFor={`target-${field}`} className="text-xs sm:text-sm font-medium">
                        {field} (%)
                      </Label>
                      <Input
                        id={`target-${field}`}
                        type="number"
                        step="0.001"
                        min="0"
                        max="100"
                        value={targetChemistry[field] !== undefined ? targetChemistry[field] : ''}
                        onChange={(e) => updateTarget(field, e.target.value)}
                        placeholder={placeholderTarget[field].toString()}
                        className="text-base sm:text-lg font-mono h-10 sm:h-12"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Melt Weight */}
            <div className="pt-4 border-t border-border">
              <div className="max-w-xs mx-auto space-y-2">
                <Label htmlFor="melt-weight" className="text-xs sm:text-sm font-medium">
                  Melt Weight (kg)
                </Label>
                <Input
                  id="melt-weight"
                  type="number"
                  min="100"
                  max="50000"
                  value={meltWeight}
                  onChange={(e) => setMeltWeight(e.target.value ? parseFloat(e.target.value) : '')}
                  placeholder="3500"
                  className="text-lg sm:text-xl font-mono h-12 sm:h-14 text-center"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Analyzing Chemistry...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Analyze Chemistry
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
