import { useState } from 'react';
import { ArrowRight, CheckCircle2, Circle, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ApiResponse } from '@/types/foundry';

interface StepExecutionStepProps {
  apiResponse: ApiResponse;
  onNext: () => void;
}

export function StepExecutionStep({ apiResponse, onNext }: StepExecutionStepProps) {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const toggleItem = (index: number) => {
    setCheckedItems(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const allChecked = apiResponse.operatorInstructions.checklist.every(
    (_, index) => checkedItems[index]
  );

  return (
    <div className="h-full p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Operator Instructions</h2>
          <p className="text-muted-foreground">
            Follow these steps precisely for safe alloy addition
          </p>
        </div>

        {/* Main Instruction Card */}
        <Card className="shadow-lg border-2 border-primary/20 bg-primary/5">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Standard Operating Procedure</CardTitle>
                <CardDescription>Melt correction workflow</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-card rounded-lg p-6 mb-6">
              <p className="text-lg leading-relaxed text-foreground">
                {apiResponse.operatorInstructions.message}
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <span>Checklist</span>
                <span className="text-sm font-normal text-muted-foreground">
                  ({Object.values(checkedItems).filter(Boolean).length} / {apiResponse.operatorInstructions.checklist.length} complete)
                </span>
              </h4>
              
              <div className="space-y-3">
                {apiResponse.operatorInstructions.checklist.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => toggleItem(index)}
                    className={`
                      flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${checkedItems[index] 
                        ? 'bg-success/10 border-success/30' 
                        : 'bg-card border-border hover:border-primary/30'
                      }
                    `}
                  >
                    <Checkbox
                      checked={checkedItems[index] || false}
                      onCheckedChange={() => toggleItem(index)}
                      className="w-6 h-6"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <span className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                        ${checkedItems[index] 
                          ? 'bg-success text-success-foreground' 
                          : 'bg-muted text-muted-foreground'
                        }
                      `}>
                        {index + 1}
                      </span>
                      <span className={`text-lg ${checkedItems[index] ? 'line-through text-muted-foreground' : ''}`}>
                        {item}
                      </span>
                    </div>
                    {checkedItems[index] ? (
                      <CheckCircle2 className="w-6 h-6 text-success" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-6 text-center">
              {apiResponse.alloyRecommendations.filter(a => a.step1Kg > 0).map(alloy => (
                <div key={alloy.name} className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">{alloy.name}</p>
                  <p className="text-2xl font-bold font-mono text-primary">{alloy.step1Kg} kg</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-center pt-4">
          <Button 
            onClick={onNext} 
            size="lg" 
            className="h-14 px-12 text-lg font-semibold"
            disabled={!allChecked}
          >
            {allChecked ? (
              <>
                Proceed to Safety Review
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              'Complete all checklist items'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
