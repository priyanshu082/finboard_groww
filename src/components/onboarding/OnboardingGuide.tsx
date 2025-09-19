'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  Settings, 
  BarChart3, 
  Table2, 
  TrendingUp,
  ArrowRight,
  X,
  Zap,
  Sparkles,
  Layers,
  Rocket,
  Eye,
  ArrowLeft,
  Palette
} from 'lucide-react';

interface OnboardingGuideProps {
  isVisible: boolean;
  onComplete: () => void;
  onStartCreating: () => void;
}

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to FinBoard',
    subtitle: 'Your Dashboard Builder',
    description: 'Create beautiful, real-time dashboards by connecting to any API',
    icon: Rocket,
    color: 'from-emerald-500 to-green-600',
    bgPattern: 'radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(34, 197, 94, 0.3) 0%, transparent 50%)'
  },
  {
    id: 'widgets',
    title: 'Three Widget Types',
    subtitle: 'Choose Your Display',
    description: 'Cards for KPIs, tables for data lists, and charts for visualizations',
    icon: Layers,
    color: 'from-blue-500 to-indigo-600',
    bgPattern: 'radial-gradient(circle at 30% 70%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)'
  },
  {
    id: 'apis',
    title: 'Connect Any API',
    subtitle: 'Real Data Sources',
    description: 'Use real APIs or try our built-in sample data to get started quickly',
    icon: Globe,
    color: 'from-purple-500 to-pink-600',
    bgPattern: 'radial-gradient(circle at 40% 40%, rgba(147, 51, 234, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)'
  },
  {
    id: 'themes',
    title: 'Choose Your Theme',
    subtitle: 'Match Your Style',
    description: 'Pick from our beautiful themes or customize your own',
    icon: Palette,
    color: 'from-orange-500 to-red-600',
    bgPattern: 'radial-gradient(circle at 60% 20%, rgba(249, 115, 22, 0.3) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(239, 68, 68, 0.3) 0%, transparent 50%)'
  },
  {
    id: 'ready',
    title: 'You\'re Ready!',
    subtitle: 'Start Building',
    description: 'Create your first widget and start building your dashboard',
    icon: Sparkles,
    color: 'from-emerald-500 to-cyan-500',
    bgPattern: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.3) 0%, transparent 50%), radial-gradient(circle at 25% 75%, rgba(6, 182, 212, 0.3) 0%, transparent 50%)'
  }
];

const widgetTypes = [
  {
    type: 'card',
    name: 'Card Widget',
    description: 'Perfect for KPIs, metrics, and key values',
    icon: TrendingUp,
    example: 'Bitcoin Price: $67,345',
    color: 'from-emerald-400 to-green-500',
    features: ['Real-time Updates', 'Trend Indicators', 'Custom Fields']
  },
  {
    type: 'table',
    name: 'Table Widget', 
    description: 'Great for lists, rankings, and detailed data',
    icon: Table2,
    example: 'Top 10 Cryptocurrencies',
    color: 'from-blue-400 to-indigo-500',
    features: ['Sortable Columns', 'Search & Filter', 'Pagination']
  },
  {
    type: 'chart',
    name: 'Chart Widget',
    description: 'Visualize trends and patterns over time',
    icon: BarChart3,
    example: 'Price Movement Chart',
    color: 'from-purple-400 to-pink-500',
    features: ['Interactive Charts', 'Multiple Chart Types', 'Real-time Data']
  }
];

const apiConnections = [
  { name: 'REST APIs', icon: '🌐', status: 'ready' },
  { name: 'JSON APIs', icon: '📊', status: 'ready' },
  { name: 'Sample Data', icon: '🎯', status: 'ready' },
  { name: 'Custom APIs', icon: '⚡', status: 'ready' }
];

// Using actual themes from your project
const themes = [
    { 
      name: 'Classic', 
      desc: 'Clean and professional', 
      color: 'from-emerald-400 via-teal-500 to-cyan-600',
      preview: (
        <div className="relative w-full h-20 rounded-lg overflow-hidden bg-white border border-gray-200">
          <div className="absolute inset-2 bg-emerald-50 rounded border border-emerald-200">
            <div className="absolute top-2 left-2 w-3 h-2 bg-emerald-500 rounded shadow-sm"></div>
            <div className="absolute top-2 right-2 text-xs font-semibold text-emerald-700">$42.3k</div>
            <div className="absolute bottom-1.5 left-2 right-2 space-y-0.5">
              <div className="w-full h-0.5 bg-emerald-300 rounded-full"></div>
              <div className="w-3/4 h-0.5 bg-emerald-400 rounded-full"></div>
              <div className="w-1/2 h-0.5 bg-emerald-500 rounded-full"></div>
            </div>
          </div>
          <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full"></div>
          <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-teal-400 rounded-full"></div>
        </div>
      )
    },
    { 
      name: 'Minimal', 
      desc: 'Modern and sleek', 
      color: 'from-gray-400 via-slate-500 to-gray-600',
      preview: (
        <div className="relative w-full h-20 rounded-lg overflow-hidden bg-white border border-gray-100">
          <div className="absolute inset-2 bg-gray-50 rounded">
            <div className="absolute top-2 left-2 w-2 h-2 bg-gray-400 rounded"></div>
            <div className="absolute top-2 right-2 flex gap-1">
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            </div>
            <div className="absolute bottom-1.5 left-2 right-2">
              <div className="flex items-end gap-0.5 h-4">
                <div className="w-1 bg-gray-300 rounded-t" style={{height: '50%'}}></div>
                <div className="w-1 bg-gray-400 rounded-t" style={{height: '75%'}}></div>
                <div className="w-1 bg-gray-500 rounded-t" style={{height: '100%'}}></div>
                <div className="w-1 bg-gray-400 rounded-t" style={{height: '60%'}}></div>
                <div className="w-1 bg-gray-300 rounded-t" style={{height: '80%'}}></div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
        </div>
      )
    },
    { 
      name: 'Glass', 
      desc: 'Elegant and translucent', 
      color: 'from-blue-400 via-indigo-500 to-purple-600',
      preview: (
        <div className="relative w-full h-20 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="absolute inset-1 bg-white/30 backdrop-blur-sm rounded border border-white/60 shadow-lg">
            <div className="absolute top-1.5 left-1.5 w-2.5 h-2 bg-gradient-to-br from-blue-400/80 to-indigo-400/80 rounded backdrop-blur-sm"></div>
            <div className="absolute top-1.5 right-1.5 text-xs font-medium text-blue-700/90">18.2k</div>
            <div className="absolute bottom-1 left-1.5 right-1.5 space-y-0.5">
              <div className="w-full h-0.5 bg-gradient-to-r from-blue-400/60 to-indigo-400/60 rounded-full backdrop-blur-sm"></div>
              <div className="w-4/5 h-0.5 bg-gradient-to-r from-indigo-400/60 to-purple-400/60 rounded-full backdrop-blur-sm"></div>
            </div>
            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-gradient-to-br from-blue-300/70 to-indigo-300/70 rounded-full backdrop-blur-sm"></div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10"></div>
        </div>
      )
    }
  ];

export default function OnboardingGuide({ isVisible, onComplete, onStartCreating }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showFloatingElements, setShowFloatingElements] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowFloatingElements(true);
    }
  }, [isVisible]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!isVisible) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 300);
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
    <div className="fixed inset-0 z-50 flex flex-col ">
      {/* Animated Background */}
      <div 
        className="absolute h-screen inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
        style={{ 
          backgroundImage: currentStepData.bgPattern,
          transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
        }}
      >
        {/* Floating Elements */}
        {showFloatingElements && (
          <>
            <div className="absolute top-[10%] left-[10%] w-2 h-2 bg-white/20 rounded-full animate-pulse" 
                 style={{ animationDelay: '0s' }} />
            <div className="absolute top-[20%] right-[15%] w-1 h-1 bg-cyan-400/40 rounded-full animate-pulse" 
                 style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-[20%] left-[8%] w-3 h-3 bg-pink-400/30 rounded-full animate-pulse" 
                 style={{ animationDelay: '2s' }} />
            <div className="absolute top-[60%] right-[10%] w-1.5 h-1.5 bg-yellow-400/40 rounded-full animate-pulse" 
                 style={{ animationDelay: '1.5s' }} />
          </>
        )}
      </div>

      {/* Main Container - Full Height */}
      <div className="relative z-10 flex flex-col h-full">
        <div className="w-full max-w-5xl mx-auto flex flex-col h-full">
          {/* Progress Dots - Compact Header */}
          <div className="flex justify-center py-2 px-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              {steps.map((_, index) => (
                <React.Fragment key={index}>
                  <button
                    onClick={() => !isAnimating && setCurrentStep(index)}
                    className={`relative w-2 h-2 rounded-full transition-all duration-500 ${
                      index === currentStep 
                        ? 'bg-white scale-125 shadow-lg shadow-white/25' 
                        : index < currentStep
                        ? 'bg-emerald-400'
                        : 'bg-white/20 hover:bg-white/40'
                    }`}
                  >
                    {index === currentStep && (
                      <div className="absolute inset-0 rounded-full bg-white animate-pulse" />
                    )}
                  </button>
                  {index < steps.length - 1 && (
                    <div className={`w-6 h-0.5 transition-all duration-500 ${
                      index < currentStep ? 'bg-emerald-400' : 'bg-white/20'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Main Content Card - Fixed Height with Scrollable Content */}
          <Card className="flex-1 flex flex-col justify-between relative overflow-hidden bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl mx-4 mb-2 min-h-0">
            {/* Header - Compact */}
            <div className="relative px-4 py-2 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`relative w-8 h-8 rounded-lg bg-gradient-to-br ${currentStepData.color} p-0.5 flex-shrink-0`}>
                    <div className="w-full h-full rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <currentStepData.icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg font-bold text-white truncate">
                      {currentStepData.title}
                    </h1>
                    <h2 className="text-sm text-white/70 truncate">
                      {currentStepData.subtitle}
                    </h2>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSkip}
                  className="text-white/70 hover:text-white hover:bg-white/10 flex-shrink-0 h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className=" overflow-y-auto min-h-0 ">
              <div className="p-4">
                <div className={`transition-all duration-300 ${
                  isAnimating ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'
                }`}>
                  
                  {/* Welcome Step */}
                  {currentStep === 0 && (
                    <div className="text-center space-y-4">
                      <div className="space-y-2">
                        <p className="text-lg text-white/80 max-w-2xl mx-auto">
                          {currentStepData.description}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                        {[
                          { icon: Zap, title: 'Quick Setup', desc: 'Get started in minutes', color: 'from-yellow-400 to-orange-500' },
                          { icon: Globe, title: 'Any API', desc: 'Connect to any data source', color: 'from-blue-400 to-indigo-500' },
                          { icon: Sparkles, title: 'Real-time', desc: 'Live data updates', color: 'from-purple-400 to-pink-500' }
                        ].map((feature, index) => (
                          <div 
                            key={index}
                            className="group relative p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
                          >
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} p-2.5 mb-3 group-hover:scale-110 transition-transform duration-300 mx-auto`}>
                              <feature.icon className="w-full h-full text-white" />
                            </div>
                            <h3 className="text-base font-semibold text-white mb-1">{feature.title}</h3>
                            <p className="text-sm text-white/60">{feature.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Widgets Step */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-lg text-white/80 max-w-2xl mx-auto mb-4">
                          {currentStepData.description}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {widgetTypes.map((widget, index) => (
                          <div 
                            key={widget.type}
                            className="group relative p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105"
                            style={{ animationDelay: `${index * 150}ms` }}
                          >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${widget.color} p-3 mb-3 group-hover:scale-110 transition-all duration-300`}>
                              <widget.icon className="w-full h-full text-white" />
                            </div>
                            
                            <h3 className="text-lg font-bold text-white mb-2">{widget.name}</h3>
                            <p className="text-sm text-white/70 mb-2">{widget.description}</p>
                            
                            <Badge className="bg-white/10 text-white/90 border-white/20 mb-3 text-xs">
                              {widget.example}
                            </Badge>
                            
                            <div className="space-y-1">
                              {widget.features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-white/60">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                                  {feature}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* APIs Step */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-lg text-white/80 max-w-2xl mx-auto mb-4">
                          {currentStepData.description}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {apiConnections.map((api, index) => (
                          <div 
                            key={index}
                            className="group relative p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:border-emerald-400/50 transition-all duration-300 hover:scale-105"
                          >
                            <div className="text-center">
                              <div className="text-2xl mb-2">{api.icon}</div>
                              <h3 className="text-sm font-semibold text-white mb-1">{api.name}</h3>
                              <div className="flex items-center justify-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                <span className="text-xs text-emerald-400">Ready</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-400/20">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
                            <Zap className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-white mb-1">Smart Field Detection</h3>
                            <p className="text-sm text-white/70">We automatically detect and suggest the best fields for your widgets.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Themes Step */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-lg text-white/80 max-w-2xl mx-auto mb-4">
                          {currentStepData.description}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {themes.map((theme, index) => (
                          <div 
                            key={index}
                            className="group relative overflow-hidden p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
                          >
                            <div className={`absolute inset-0 bg-gradient-to-br ${theme.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
                            <div className="relative">
                              <div className="text-4xl mb-3 text-center">{theme.preview}</div>
                              <h3 className="text-lg font-bold text-white mb-1 text-center">{theme.name}</h3>
                              <p className="text-sm text-white/70 text-center">{theme.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                          <Palette className="w-4 h-4 text-white/70" />
                          <span className="text-sm text-white/70">+ Custom themes and brand colors</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Final Step */}
                  {currentStep === 4 && (
                    <div className="text-center space-y-4">
                      <div className="space-y-2">
                        <p className="text-lg text-white/80 max-w-2xl mx-auto">
                          {currentStepData.description}
                        </p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                        <Button 
                          onClick={handleStartCreating}
                          size="lg"
                          className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-6 py-3 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                        >
                          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                          <div className="relative flex items-center justify-center gap-2">
                            <Rocket className="w-5 h-5" />
                            Create Your First Widget
                          </div>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="lg"
                          onClick={handleSkip}
                          className="px-6 py-3 text-lg border-white/20 text-white hover:bg-white/10 rounded-xl w-full sm:w-auto"
                        >
                          Explore Dashboard
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mt-4">
                        {['🎯', '⚡', '🚀'].map((emoji, index) => (
                          <div key={index} className="text-center p-2">
                            <div className="text-2xl mb-1">{emoji}</div>
                            <div className="text-xs text-white/60">
                              {['Precise', 'Fast', 'Powerful'][index]}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer - Compact */}
            <div className="relative px-4 py-2 border-t border-white/10 flex-shrink-0">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-white/60 order-2 sm:order-1">
                  <Settings className="w-3 h-3" />
                  <span>Access this guide anytime from settings</span>
                </div>
                
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  {currentStep > 0 && (
                    <Button 
                      variant="outline" 
                      onClick={handlePrevious}
                      disabled={isAnimating}
                      className="border-white/20 text-white hover:bg-white/10 text-sm px-3 py-1.5 h-8"
                    >
                      <ArrowLeft className="w-3 h-3 mr-1" />
                      Previous
                    </Button>
                  )}
                  
                  <Button 
                    onClick={handleNext}
                    disabled={isAnimating}
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-4 py-1.5 text-sm h-8"
                  >
                    {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>

          </Card>
        </div>
      </div>
    </div>
  );
}