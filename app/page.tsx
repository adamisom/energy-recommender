import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-20">
        <div className="max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Find Your Perfect Energy Plan
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-8">
            Compare 20+ plans and save hundreds on your electricity bill with AI-powered recommendations
          </p>
          <Link href="/usage">
            <Button size="lg" className="text-lg px-8 py-6">
              Get Started - It&apos;s Free
            </Button>
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <CardTitle>Share Your Usage</CardTitle>
                <CardDescription>
                  Upload your electricity bill or manually enter 12 months of usage data
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <CardTitle>Set Your Priorities</CardTitle>
                <CardDescription>
                  Tell us what matters most: cost savings, renewable energy, or contract flexibility
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <CardTitle>Get Smart Recommendations</CardTitle>
                <CardDescription>
                  Receive personalized plan recommendations with AI-generated explanations
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">
            Why Choose Our Platform?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>🤖 AI-Powered Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Get personalized explanations for each recommendation powered by advanced AI
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>💰 Maximize Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Our algorithm analyzes your usage patterns to find plans that save you the most money
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🌱 Support Renewable Energy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Filter plans by renewable energy percentage to reduce your carbon footprint
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>⚡ Fast & Free</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Get recommendations in under 2 seconds. No signup required, completely free to use
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Save on Your Energy Bill?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of users who have already found better energy plans
          </p>
          <Link href="/usage">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Start Saving Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2025 Energy Plan Recommender. All rights reserved.</p>
          <p className="mt-2 text-sm">Serving TX, PA, OH, and IL</p>
        </div>
      </footer>
    </div>
  );
}
