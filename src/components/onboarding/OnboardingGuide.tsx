'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Globe, 
  Palette, 
  Settings, 
  BarChart3, 
  Table2, 
  TrendingUp,
  ArrowRight,
  CheckCircle,
  X,
  Play,
  Zap
} from 'lucide-react';

interface OnboardingGuideProps {
  isVisible: boolean;
  onComplete: () => void;
  onStartCreating: () => void;
}

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to FinBoard!',
    description: 'Create beautiful, real-time dashboards by connecting to any API',
    icon: Zap,
    color: 'emerald'
  },
  {
    id: 'widgets',
    title: 'Three Widget Types',
    description: 'Choose from cards, tables, or charts to display your data',
    icon: BarChart3,
    color: 'blue'
  },
  {
    id: 'apis',
    title: 'Connect Any API',
    description: 'Use real APIs or try our built-in sample data',
    icon: Globe,
    color: 'purple'
  },
  {
    id: 'themes',
    title: 'Customize Themes',
    description: 'Pick from 3 beautiful themes to match your style',
    icon: Palette,
    color: 'pink'
  },
  {
    id: 'ready',
    title: 'You\'re Ready!',
    description: 'Start building your dashboard now',
    icon: CheckCircle,
    color: 'emerald'
  }
];

const widgetTypes = [
  {
    type: 'card',
    name: 'Card Widget',
    description: 'Perfect for KPIs, metrics, and key values',
    icon: TrendingUp,
    example: 'Bitcoin Price: $67,345'
  },
  {
    type: 'table',
    name: 'Table Widget', 
    description: 'Great for lists, rankings, and detailed data',
    icon: Table2,
    example: 'Top 10 Cryptocurrencies'
  },
  {
    type: 'chart',
    name: 'Chart Widget',
    description: 'Visualize trends and patterns over time',
    icon: BarChart3,
    example: 'Price Movement Chart'
  }
];

const sampleApis = [
  {
    name: 'Crypto Prices',
    url: 'CoinGecko API',
    description: 'Real-time cryptocurrency data'
  },
  {
    name: 'Stock Quotes',
    url: 'Alpha Vantage',
    description: 'Stock market information'
  },
  {
    name: 'Weather Data',
    url: 'OpenWeatherMap',
    description: 'Current weather conditions'
  }
];

export function OnboardingGuide({ isVisible, onComplete, onStartCreating }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  if (!isVisible) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleStartCreating = () => {
    onStartCreating();
    onComplete();
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-0 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentStepData.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Step {currentStep + 1} of {steps.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                <X className="w-4 h-4 mr-1" />
                Skip
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                    index <= currentStep 
                      ? 'bg-emerald-500' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            {currentStep === 0 && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-3xl flex items-center justify-center mx-auto">
                  <currentStepData.icon className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {currentStepData.title}
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    {currentStepData.description}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Connect APIs</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Any JSON API works</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Create Widgets</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cards, tables, charts</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Palette className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Customize</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Beautiful themes</p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <currentStepData.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {currentStepData.title}
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {currentStepData.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {widgetTypes.map((widget) => (
                    <Card key={widget.type} className="p-6 border-2 border-gray-100 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors">
                      <div className="text-center space-y-4">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mx-auto">
                          <widget.icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {widget.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {widget.description}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {widget.example}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <currentStepData.icon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {currentStepData.title}
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {currentStepData.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6 border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
                          Real APIs
                        </h4>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-3">
                          Connect to any JSON API endpoint
                        </p>
                        <div className="space-y-2">
                          {sampleApis.map((api, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                              <span className="text-emerald-700 dark:text-emerald-300">{api.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Play className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                          Sample Data
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                          Try built-in examples to get started quickly
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            <span className="text-blue-700 dark:text-blue-300">Crypto prices</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            <span className="text-blue-700 dark:text-blue-300">Stock data</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            <span className="text-blue-700 dark:text-blue-300">User lists</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <currentStepData.icon className="w-8 h-8 text-pink-600 dark:text-pink-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {currentStepData.title}
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {currentStepData.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'Classic', desc: 'Clean and professional', color: 'emerald' },
                    { name: 'Minimal', desc: 'Modern and sleek', color: 'purple' },
                    { name: 'Glass', desc: 'Elegant and translucent', color: 'blue' }
                  ].map((theme, index) => (
                    <Card key={index} className="p-6 border-2 border-gray-100 dark:border-gray-700">
                      <div className="text-center space-y-3">
                        <div className={`w-12 h-12 bg-${theme.color}-100 dark:bg-${theme.color}-900/30 rounded-xl flex items-center justify-center mx-auto`}>
                          <Palette className={`w-6 h-6 text-${theme.color}-600 dark:text-${theme.color}-400`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {theme.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {theme.desc}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-3xl flex items-center justify-center mx-auto">
                  <currentStepData.icon className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {currentStepData.title}
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
                    {currentStepData.description}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    onClick={handleStartCreating}
                    size="lg"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Widget
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={handleSkip}
                    className="px-8"
                  >
                    Explore Dashboard
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Settings className="w-4 h-4" />
              <span>You can always access this guide later</span>
            </div>
            
            <div className="flex items-center gap-3">
              {currentStep > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(prev => prev - 1)}
                >
                  Previous
                </Button>
              )}
              <Button 
                onClick={handleNext}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
