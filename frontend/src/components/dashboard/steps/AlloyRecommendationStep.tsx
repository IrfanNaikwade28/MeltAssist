import { useState } from 'react';
import { ArrowRight, ChevronDown, ChevronUp, Info, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ApiResponse } from '@/types/foundry';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface AlloyRecommendationStepProps {
  apiResponse: ApiResponse;
  onNext: () => void;
}

export function AlloyRecommendationStep({ apiResponse, onNext }: AlloyRecommendationStepProps) {
  const [expandedAlloys, setExpandedAlloys] = useState<Record<string, boolean>>({});

  const toggleAlloy = (name: string) => {
    setExpandedAlloys(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const chartData = apiResponse.alloyRecommendations.map(alloy => ({
    name: alloy.name,
    'STEP-1 (kg)': alloy.step1Kg,
  }));

  return (
    <div className="h-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Alloy Recommendation</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Review STEP-1 additions and proceed carefully
          </p>
        </div>

        {/* Melt Information Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="shadow-md bg-primary/5 border-primary/20">
            <CardContent className="pt-4 sm:pt-6">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Melt Weight</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground font-mono">
                {apiResponse.meltWeight.toLocaleString()}
                <span className="text-sm sm:text-lg font-normal text-muted-foreground ml-2">kg</span>
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md bg-primary/5 border-primary/20">
            <CardContent className="pt-4 sm:pt-6\">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Melt Weight</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground font-mono">
                {apiResponse.meltWeightTons.toFixed(2)}
                <span className="text-sm sm:text-lg font-normal text-muted-foreground ml-2">tons</span>
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md bg-primary/5 border-primary/20 sm:col-span-2 lg:col-span-1">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Safety Factor</p>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs sm:text-sm">Applied to limit maximum addition per step for safety</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground font-mono">
                {(apiResponse.safetyFactor * 100).toFixed(0)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alloy Recommendation Cards */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Alloy Additions</h3>
          {apiResponse.alloyRecommendations.map(alloy => {
            const progress = alloy.totalEstimatedKg > 0 
              ? (alloy.step1Kg / alloy.totalEstimatedKg) * 100 
              : 0;

            return (
              <Collapsible
                key={alloy.name}
                open={expandedAlloys[alloy.name]}
                onOpenChange={() => toggleAlloy(alloy.name)}
              >
                <Card className="shadow-md overflow-hidden">
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="pb-3 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-xl">{alloy.name}</CardTitle>
                          {alloy.isCostSensitive && (
                            <Badge variant="outline" className="border-warning text-warning-foreground bg-warning/10">
                              <DollarSign className="w-3 h-3 mr-1" />
                              Cost Sensitive
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">STEP-1</p>
                            <p className="text-2xl font-bold font-mono text-primary">
                              {alloy.step1Kg} kg
                            </p>
                          </div>
                          {expandedAlloys[alloy.name] ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0 border-t border-border">
                      <div className="grid md:grid-cols-4 gap-6 py-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Total Estimated</p>
                          <p className="text-xl font-semibold font-mono">{alloy.totalEstimatedKg} kg</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <p className="text-sm text-muted-foreground">Estimated Steps</p>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="w-3 h-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Expected number of correction cycles</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <p className="text-xl font-semibold">{alloy.estimatedSteps}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <p className="text-sm text-muted-foreground">Alloy Rate</p>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="w-3 h-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Alloy added per ton of melt</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <p className="text-xl font-semibold font-mono">{alloy.alloyRate} kg/ton</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <p className="text-sm text-muted-foreground">Max per Step</p>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="w-3 h-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Maximum safe addition per correction step</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <p className="text-xl font-semibold font-mono">{alloy.maxPerStep} kg</p>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-border">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">STEP-1 Progress</span>
                          <span className="font-mono">{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-3" />
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>

        {/* Bar Chart */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>STEP-1 Alloy Additions</CardTitle>
            <CardDescription>Recommended additions for this correction step</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    type="number"
                    tick={{ fill: 'hsl(var(--foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    tick={{ fill: 'hsl(var(--foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    width={60}
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value} kg`]}
                  />
                  <Bar dataKey="STEP-1 (kg)" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-center pt-4">
          <Button onClick={onNext} size="lg" className="h-14 px-12 text-lg font-semibold">
            View Operator Instructions
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
