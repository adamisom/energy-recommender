'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { safeSetItem, STORAGE_KEYS } from '@/lib/utils/storage';
import { MONTH_NAMES, VALIDATION_LIMITS } from '@/lib/constants';
import { useAuth } from '@/lib/auth/context';
import { DataQualityIndicator } from '@/components/usage/data-quality-indicator';

export default function UsagePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [usageData, setUsageData] = useState<(number | string)[]>(Array(12).fill(''));
  const [errors, setErrors] = useState<string[]>([]);
  const [savedUsageData, setSavedUsageData] = useState<number[] | null>(null);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Fetch saved usage data if user is logged in
  useEffect(() => {
    async function fetchSavedUsage() {
      if (!user) return;
      
      setLoadingSaved(true);
      try {
        const response = await fetch('/api/user/usage');
        if (response.ok) {
          const { data } = await response.json();
          if (data && data.monthlyKwh) {
            setSavedUsageData(data.monthlyKwh as number[]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch saved usage:', error);
      } finally {
        setLoadingSaved(false);
      }
    }

    fetchSavedUsage();
  }, [user]);

  const handleManualChange = (index: number, value: string) => {
    const newData = [...usageData];
    newData[index] = value === '' ? '' : parseFloat(value);
    setUsageData(newData);
    setErrors([]);
    // Clear uploaded filename when manually editing
    if (uploadedFileName) {
      setUploadedFileName(null);
    }
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        
        // Use papaparse for robust CSV parsing
        const Papa = (await import('papaparse')).default;
        
        // Auto-detect delimiter (comma, tab, etc.)
        const parseResult = Papa.parse<number | null>(text, {
          header: false,
          skipEmptyLines: true,
          delimiter: '', // Auto-detect delimiter
          transform: (value: string) => {
            const trimmed = value.trim();
            const parsed = parseFloat(trimmed);
            return isNaN(parsed) ? null : parsed;
          },
        });

        // Flatten the parsed data and filter out nulls
        const values = (parseResult.data.flat() as (number | null)[])
          .filter((v): v is number => v !== null && typeof v === 'number');

        if (values.length < 12) {
          setErrors([
            `CSV file must contain at least 12 numeric values. Found ${values.length}.`,
            'Please ensure your CSV file has 12 comma-separated numbers (one per month).',
          ]);
          setUploadedFileName(null);
          return;
        }

        if (parseResult.errors.length > 0) {
          console.warn('CSV parsing warnings:', parseResult.errors);
        }

        setUsageData(values.slice(0, 12));
        setErrors([]);
      } catch (error) {
        console.error('CSV parsing error:', error);
        setErrors([
          'Failed to parse CSV file.',
          'Please ensure it contains 12 comma-separated numbers (one per month).',
          'Supported formats: plain numbers, or CSV with headers.',
        ]);
        setUploadedFileName(null);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadSavedUsage = () => {
    if (!savedUsageData) return;

    // Create CSV content
    const csvContent = [
      'Month,kWh',
      ...savedUsageData.map((kwh, idx) => `${MONTH_NAMES[idx]},${kwh}`)
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-usage-data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handlePrefillFromSaved = () => {
    if (!savedUsageData) return;
    setUsageData(savedUsageData);
    setErrors([]);
    setUploadedFileName(null);
  };

  const validateAndContinue = async () => {
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

    // Save to database if user is logged in
    if (user) {
      try {
        await fetch('/api/user/usage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            monthlyKwh: usageData.map(v => Number(v))
          }),
        });
      } catch (error) {
        console.error('Failed to save usage to database:', error);
        // Don't block navigation if DB save fails
      }
    }

    router.push('/preferences');
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-4 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            Enter Your Usage Data
          </h1>
          <p className="text-slate-600">
            We need 12 months of electricity usage to find you the best plans
          </p>
        </div>

        {/* Saved Usage Data Card - Show if user has saved data */}
        {savedUsageData && !loadingSaved && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Previously Saved Usage Data Found</CardTitle>
              <CardDescription className="text-blue-700">
                We found your usage data from a previous session. You can download it or use it to pre-fill the form.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={handleDownloadSavedUsage}
                  variant="outline"
                  className="border-blue-300 hover:bg-blue-100"
                >
                  📥 Download My Usage CSV
                </Button>
                <Button 
                  onClick={handlePrefillFromSaved}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  ✨ Pre-fill Form with Saved Data
                </Button>
              </div>
              <div className="mt-3 text-sm text-blue-700">
                <strong>Preview:</strong> {savedUsageData.slice(0, 3).join(', ')}... kWh (12 months)
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Monthly Usage (kWh)</CardTitle>
            <CardDescription>
              Enter your electricity usage for each month, or upload a CSV file
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Data Quality Indicator */}
            <DataQualityIndicator monthlyUsage={usageData} />
            
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
                        inputMode="numeric"
                        placeholder="e.g., 850"
                        min="0"
                        step="1"
                        value={usageData[index] === '' ? '' : usageData[index]}
                        onChange={(e) => handleManualChange(index, e.target.value)}
                        className="mt-1 text-base"
                        aria-label={`${month} usage in kilowatt-hours`}
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="csv">
                <div className="space-y-4">
                  <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    uploadedFileName 
                      ? 'border-green-400 bg-green-50' 
                      : 'border-slate-300'
                  }`}>
                    <Input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleCSVUpload}
                      className="max-w-sm mx-auto"
                    />
                    {uploadedFileName && usageData.some(v => v !== '') ? (
                      <div className="mt-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-300 rounded-lg">
                          <span className="text-green-700">✅</span>
                          <span className="text-sm font-semibold text-green-800">
                            Data loaded successfully!
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-slate-500 mt-4">
                          Upload a CSV file with 12 monthly usage values
                        </p>
                        {(typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) && (
                          <p className="text-sm mt-2">
                            <a 
                              href="/example-usage.csv" 
                              download 
                              className="text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              Download example CSV
                            </a>
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {usageData.some(v => v !== '') && (
                    <div className="bg-slate-100 rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Loaded Data:</h3>
                      <div className="grid grid-cols-4 gap-x-8 gap-y-2 text-sm">
                        {MONTH_NAMES.map((month, index) => (
                          <div key={month} className="flex items-center gap-1">
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
                className="flex-1 min-h-[44px] text-base"
              >
                Continue to Preferences
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-slate-500">
          <p>Your data is stored securely and never sent to third parties</p>
        </div>
      </div>
    </div>
  );
}

