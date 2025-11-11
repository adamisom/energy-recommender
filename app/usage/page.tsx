'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { safeSetItem, STORAGE_KEYS } from '@/lib/utils/storage';
import { MONTH_NAMES, VALIDATION_LIMITS } from '@/lib/constants';

export default function UsagePage() {
  const router = useRouter();
  const [usageData, setUsageData] = useState<(number | string)[]>(Array(12).fill(''));
  const [errors, setErrors] = useState<string[]>([]);

  const handleManualChange = (index: number, value: string) => {
    const newData = [...usageData];
    newData[index] = value === '' ? '' : parseFloat(value);
    setUsageData(newData);
    setErrors([]);
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        // Simple CSV parsing: expect comma-separated values
        const values = text.split(/[,\n\r\t]/)
          .map(v => v.trim())
          .filter(v => v !== '')
          .map(v => parseFloat(v))
          .filter(v => !isNaN(v));

        if (values.length < 12) {
          setErrors(['CSV file must contain at least 12 numeric values']);
          return;
        }

        setUsageData(values.slice(0, 12));
        setErrors([]);
      } catch {
        setErrors(['Failed to parse CSV file. Please ensure it contains 12 comma-separated numbers.']);
      }
    };
    reader.readAsText(file);
  };

  const validateAndContinue = () => {
    const newErrors: string[] = [];

    // Check all fields are filled
    if (usageData.some(val => val === '' || val === null)) {
      newErrors.push('Please enter usage for all 12 months');
    }

    // Check all values are positive
    if (usageData.some(val => typeof val === 'number' && val <= 0)) {
      newErrors.push('All usage values must be positive');
    }

    // Check reasonable range
    if (usageData.some(val => typeof val === 'number' && val > VALIDATION_LIMITS.MAX_USAGE_KWH)) {
      newErrors.push('Usage values seem unusually high. Please verify your data.');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // Save to sessionStorage
    const saved = safeSetItem(STORAGE_KEYS.USAGE_DATA, usageData);
    if (!saved) {
      setErrors(['Failed to save data. Please ensure your browser allows sessionStorage.']);
      return;
    }
    router.push('/preferences');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Enter Your Usage Data
          </h1>
          <p className="text-slate-600">
            We need 12 months of electricity usage to find you the best plans
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Usage (kWh)</CardTitle>
            <CardDescription>
              Enter your electricity usage for each month, or upload a CSV file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                <TabsTrigger value="csv">Upload CSV</TabsTrigger>
              </TabsList>

              <TabsContent value="manual">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {MONTH_NAMES.map((month, index) => (
                    <div key={month}>
                      <Label htmlFor={`month-${index}`}>{month}</Label>
                      <Input
                        id={`month-${index}`}
                        type="number"
                        placeholder="e.g., 850"
                        min="0"
                        step="1"
                        value={usageData[index] === '' ? '' : usageData[index]}
                        onChange={(e) => handleManualChange(index, e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="csv">
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                    <Input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleCSVUpload}
                      className="max-w-sm mx-auto"
                    />
                    <p className="text-sm text-slate-500 mt-4">
                      Upload a CSV file with 12 monthly usage values
                    </p>
                  </div>

                  {usageData.some(v => v !== '') && (
                    <div className="bg-slate-100 rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Loaded Data:</h3>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        {MONTH_NAMES.map((month, index) => (
                          <div key={month} className="flex justify-between">
                            <span className="text-slate-600">{month.slice(0, 3)}:</span>
                            <span className="font-mono">{usageData[index] || '--'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {errors.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                {errors.map((error, index) => (
                  <p key={index} className="text-red-700 text-sm">{error}</p>
                ))}
              </div>
            )}

            <div className="mt-6 flex gap-4">
              <Button
                onClick={validateAndContinue}
                size="lg"
                className="flex-1"
              >
                Continue to Preferences
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-slate-500">
          <p>Your data is stored locally and never sent to third parties</p>
        </div>
      </div>
    </div>
  );
}

