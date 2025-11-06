'use client';

import { useState } from 'react';
import { mlApi } from '@/lib/ml-api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, TrendingUp, Sprout, AlertCircle } from 'lucide-react';

export default function MLInsightsPage() {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [yieldResult, setYieldResult] = useState<any>(null);
  const [cropResult, setCropResult] = useState<any>(null);

  // Yield Prediction Form State
  const [yieldForm, setYieldForm] = useState({
    Area: 'India',
    Item: 'Rice',
    Year: new Date().getFullYear(),
    average_rain_fall_mm_per_year: 1200,
    pesticides_tonnes: 50,
    avg_temp: 25
  });

  // Crop Recommendation Form State
  const [cropForm, setCropForm] = useState({
    N: 90,
    P: 42,
    K: 43,
    temperature: 20.8,
    humidity: 82,
    ph: 6.5,
    rainfall: 202
  });

  const handleYieldPrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    setLoading(true);
    try {
      const result = await mlApi.predictYield(yieldForm, accessToken);
      setYieldResult(result.data);
    } catch (error: any) {
      console.error('Yield prediction error:', error);
      alert(error.response?.data?.error || 'Failed to predict yield');
    } finally {
      setLoading(false);
    }
  };

  const handleCropRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    setLoading(true);
    try {
      const result = await mlApi.recommendCrop(cropForm, accessToken);
      setCropResult(result.data);
    } catch (error: any) {
      console.error('Crop recommendation error:', error);
      alert(error.response?.data?.error || 'Failed to recommend crop');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI-Powered Farming Insights</h1>
        <p className="text-muted-foreground">
          Get data-driven predictions and recommendations for your farm
        </p>
      </div>

      <Tabs defaultValue="yield" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="yield">
            <TrendingUp className="w-4 h-4 mr-2" />
            Yield Prediction
          </TabsTrigger>
          <TabsTrigger value="crop">
            <Sprout className="w-4 h-4 mr-2" />
            Crop Recommendation
          </TabsTrigger>
        </TabsList>

        {/* Yield Prediction Tab */}
        <TabsContent value="yield" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Predict Crop Yield</CardTitle>
                <CardDescription>
                  Enter your farming parameters to predict expected yield
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleYieldPrediction} className="space-y-4">
                  <div>
                    <Label htmlFor="area">Area/Region</Label>
                    <Input
                      id="area"
                      value={yieldForm.Area}
                      onChange={(e) => setYieldForm({ ...yieldForm, Area: e.target.value })}
                      placeholder="e.g., India, USA"
                    />
                  </div>

                  <div>
                    <Label htmlFor="item">Crop Type</Label>
                    <Input
                      id="item"
                      value={yieldForm.Item}
                      onChange={(e) => setYieldForm({ ...yieldForm, Item: e.target.value })}
                      placeholder="e.g., Rice, Wheat"
                    />
                  </div>

                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={yieldForm.Year}
                      onChange={(e) => setYieldForm({ ...yieldForm, Year: parseInt(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="rainfall">Average Rainfall (mm/year)</Label>
                    <Input
                      id="rainfall"
                      type="number"
                      value={yieldForm.average_rain_fall_mm_per_year}
                      onChange={(e) => setYieldForm({ ...yieldForm, average_rain_fall_mm_per_year: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="pesticides">Pesticides (tonnes)</Label>
                    <Input
                      id="pesticides"
                      type="number"
                      value={yieldForm.pesticides_tonnes}
                      onChange={(e) => setYieldForm({ ...yieldForm, pesticides_tonnes: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="temp">Average Temperature (°C)</Label>
                    <Input
                      id="temp"
                      type="number"
                      value={yieldForm.avg_temp}
                      onChange={(e) => setYieldForm({ ...yieldForm, avg_temp: parseFloat(e.target.value) })}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Predict Yield
                  </Button>
                </form>
              </CardContent>
            </Card>

            {yieldResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Prediction Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Expected Yield</div>
                    <div className="text-3xl font-bold text-green-600">
                      {yieldResult.prediction.yield.toFixed(2)} {yieldResult.prediction.unit}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Confidence</span>
                      <span className="font-medium">{(yieldResult.prediction.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Interpretation</span>
                      <span className="font-medium">{yieldResult.prediction.interpretation}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2">Input Parameters</h4>
                    <div className="text-sm space-y-1 text-muted-foreground">
                      <div>Crop: {yieldResult.input.Item}</div>
                      <div>Area: {yieldResult.input.Area}</div>
                      <div>Year: {yieldResult.input.Year}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Crop Recommendation Tab */}
        <TabsContent value="crop" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Get Crop Recommendation</CardTitle>
                <CardDescription>
                  Enter soil and climate data to find the best crop
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCropRecommendation} className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="N">Nitrogen (N)</Label>
                      <Input
                        id="N"
                        type="number"
                        value={cropForm.N}
                        onChange={(e) => setCropForm({ ...cropForm, N: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="P">Phosphorus (P)</Label>
                      <Input
                        id="P"
                        type="number"
                        value={cropForm.P}
                        onChange={(e) => setCropForm({ ...cropForm, P: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="K">Potassium (K)</Label>
                      <Input
                        id="K"
                        type="number"
                        value={cropForm.K}
                        onChange={(e) => setCropForm({ ...cropForm, K: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="temperature">Temperature (°C)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      value={cropForm.temperature}
                      onChange={(e) => setCropForm({ ...cropForm, temperature: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="humidity">Humidity (%)</Label>
                    <Input
                      id="humidity"
                      type="number"
                      step="0.1"
                      value={cropForm.humidity}
                      onChange={(e) => setCropForm({ ...cropForm, humidity: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="ph">Soil pH</Label>
                    <Input
                      id="ph"
                      type="number"
                      step="0.1"
                      value={cropForm.ph}
                      onChange={(e) => setCropForm({ ...cropForm, ph: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="rainfall_crop">Rainfall (mm)</Label>
                    <Input
                      id="rainfall_crop"
                      type="number"
                      step="0.1"
                      value={cropForm.rainfall}
                      onChange={(e) => setCropForm({ ...cropForm, rainfall: parseFloat(e.target.value) })}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Get Recommendation
                  </Button>
                </form>
              </CardContent>
            </Card>

            {cropResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Crops</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Best Crop</div>
                    <div className="text-2xl font-bold text-blue-600 capitalize">
                      {cropResult.recommended_crop}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Top Recommendations</h4>
                    {cropResult.recommendations.map((rec: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium capitalize">{rec.crop}</div>
                          <div className="text-sm text-muted-foreground">{rec.suitability}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{(rec.confidence * 100).toFixed(0)}%</div>
                          <div className="text-xs text-muted-foreground">Confidence</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2">Soil Analysis</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(cropResult.soil_analysis).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground capitalize">{key}:</span>
                          <span className={value === 'Optimal' ? 'text-green-600' : 'text-orange-600'}>
                            {value as string}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
