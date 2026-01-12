import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MeltInput, Chemistry } from '@/types/foundry';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChemistryAnalysisStepProps {
  meltInput: MeltInput;
  onNext: () => void;
}

const CHEMISTRY_FIELDS: (keyof Chemistry)[] = ['C', 'Si', 'Mn', 'Cr', 'Ni'];

export function ChemistryAnalysisStep({ meltInput, onNext }: ChemistryAnalysisStepProps) {
  const { initialChemistry, targetChemistry } = meltInput;

  const deltaChemistry: Chemistry = {
    C: targetChemistry.C - initialChemistry.C,
    Si: targetChemistry.Si - initialChemistry.Si,
    Mn: targetChemistry.Mn - initialChemistry.Mn,
    Cr: targetChemistry.Cr - initialChemistry.Cr,
    Ni: targetChemistry.Ni - initialChemistry.Ni,
  };

  const chartData = CHEMISTRY_FIELDS.map(field => ({
    element: field,
    Initial: initialChemistry[field],
    Target: targetChemistry[field],
  }));

  return (
    <div className="h-full p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Chemistry Analysis</h2>
          <p className="text-muted-foreground">
            Chemistry gap calculated from spectrometer input
          </p>
        </div>

        {/* Three Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Initial Chemistry Card */}
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-2" />
                <CardTitle className="text-lg">Initial Chemistry</CardTitle>
              </div>
              <CardDescription>Spectrometer readings</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <tbody>
                  {CHEMISTRY_FIELDS.map(field => (
                    <tr key={field} className="border-b border-border last:border-0">
                      <td className="py-3 font-medium">{field}</td>
                      <td className="py-3 text-right font-mono text-lg">
                        {initialChemistry[field].toFixed(3)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Target Chemistry Card */}
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-1" />
                <CardTitle className="text-lg">Target Chemistry</CardTitle>
              </div>
              <CardDescription>Required composition</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <tbody>
                  {CHEMISTRY_FIELDS.map(field => (
                    <tr key={field} className="border-b border-border last:border-0">
                      <td className="py-3 font-medium">{field}</td>
                      <td className="py-3 text-right font-mono text-lg">
                        {targetChemistry[field].toFixed(3)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Delta Chemistry Card */}
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-3" />
                <CardTitle className="text-lg">Chemistry Delta</CardTitle>
              </div>
              <CardDescription>Gap to close</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <tbody>
                  {CHEMISTRY_FIELDS.map(field => {
                    const delta = deltaChemistry[field];
                    const isPositive = delta > 0;
                    return (
                      <tr key={field} className="border-b border-border last:border-0">
                        <td className="py-3 font-medium">{field}</td>
                        <td className={`py-3 text-right font-mono text-lg ${
                          isPositive ? 'text-success' : 'text-muted-foreground'
                        }`}>
                          {isPositive ? '+' : ''}{delta.toFixed(3)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Bar Chart */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Chemistry Comparison</CardTitle>
            <CardDescription>Current vs Target composition</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="element" 
                    tick={{ fill: 'hsl(var(--foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value.toFixed(3)}%`]}
                  />
                  <Legend />
                  <Bar dataKey="Initial" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Target" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-center pt-4">
          <Button onClick={onNext} size="lg" className="h-14 px-12 text-lg font-semibold">
            Get Alloy Recommendation
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
