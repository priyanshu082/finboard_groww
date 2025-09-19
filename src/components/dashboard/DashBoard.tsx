'use client';

import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, TrendingUp, BarChart3, Activity, Eye, Grid3X3, Github } from 'lucide-react';
import { useWidgetStore, Widget } from '@/store/widgetStore';
import { CardWidget } from '@/components/widgets/CardWidget';
import { TableWidget } from '@/components/widgets/TableWidget';
import { ChartWidget } from '@/components/widgets/ChartWidget';
import { AddWidgetModal } from './AddWidgetModel';
import { ModeToggle } from '../ui/ModeToggle';
import { OnboardingGuide } from '../onboarding/OnboardingGuide';
import Image from 'next/image';

export function Dashboard() {
  const { widgets, isAddModalOpen, setAddModalOpen, reorderWidgets, refreshWidget } = useWidgetStore();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if user is new (no widgets and first visit)
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('finboard-onboarding-seen');
    const hasWidgets = widgets.length > 0;
    
    if (!hasSeenOnboarding && !hasWidgets) {
      setShowOnboarding(true);
    }
  }, [widgets.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      widgets.forEach(widget => {
        if (!widget.isLoading && widget.apiUrl) {
          refreshWidget(widget.id);
        }
      });
    }, 30 * 1000);

    return () => clearInterval(interval);
  }, [widgets, refreshWidget]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderWidgets(result.source.index, result.destination.index);
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('finboard-onboarding-seen', 'true');
    setShowOnboarding(false);
  };

  const handleStartCreating = () => {
    setAddModalOpen(true);
  };

  const renderWidget = (widget: Widget) => {
    const props = { widget };
    
    switch (widget.type) {
      case 'card':
        return <CardWidget key={widget.id} {...props} />;
      case 'table':
        return <TableWidget key={widget.id} {...props} />;
      case 'chart':
        return <ChartWidget key={widget.id} {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Onboarding Guide */}
      <OnboardingGuide 
        isVisible={showOnboarding}
        onComplete={handleOnboardingComplete}
        onStartCreating={handleStartCreating}
      />

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          {/* Mobile-first responsive header */}
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Image
                  src="/groww_img.png"
                  alt="Groww Logo"
                  width={32}
                  height={32}
                  className="object-contain w-8 h-8 sm:w-10 sm:h-10"
                  priority
                  style={{ display: 'block' }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-white truncate">
                  FinBoard
                </h1>
                <div className="flex items-center space-x-2 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Live updates</span>
                </div>
              </div>
            </div>
            
            {/* Right: Actions */}
            <div className="flex items-center justify-between sm:justify-end space-x-2">
              {/* GitHub Link */}
              <a
                href="https://github.com/priyanshu082/finboard_groww"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                title="View on GitHub"
              >
                <Github className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
              </a>
              
              {/* Mode Toggle */}
              <ModeToggle/>
              
              {/* Add Widget Button */}
              <Button
                onClick={() => setAddModalOpen(true)}
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 sm:px-4 text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Add Widget</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Quick Stats - Responsive grid */}
        {widgets.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card className="p-3 sm:p-4 bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">
                    Total Widgets
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{widgets.length}</p>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Active</span>
                  </div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4 bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">
                    Cards
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {widgets.filter(w => w.type === 'card').length}
                  </p>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Live data</span>
                  </div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4 bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">
                    Tables
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {widgets.filter(w => w.type === 'table').length}
                  </p>
                  <div className="flex items-center space-x-1">
                    <Activity className="w-3 h-3 text-purple-500" />
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Data views</span>
                  </div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4 bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">
                    Charts
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {widgets.filter(w => w.type === 'chart').length}
                  </p>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">Real-time</span>
                  </div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Widgets Section */}
        <div className="space-y-4">
          {widgets.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Widgets</h2>
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                <Eye className="w-3 h-3" />
                <span>Drag to reorder</span>
              </div>
            </div>
          )}

          {widgets.length > 0 ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="widgets" direction="horizontal">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {widgets
                      .sort((a, b) => a.position - b.position)
                      .map((widget, index) => (
                        <Draggable key={widget.id} draggableId={widget.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`transition-all duration-200 ${
                                widget.type === 'table' ? 'sm:col-span-2 lg:col-span-3' : ''
                              } ${
                                snapshot.isDragging 
                                  ? 'scale-[1.02] shadow-xl z-50 rotate-1' 
                                  : 'hover:shadow-md'
                              }`}
                            >
                              {renderWidget(widget)}
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            /* Empty State - Responsive */
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <div className="text-center py-12 sm:py-16 px-4 sm:px-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Start building your dashboard
                </h3>
                
                <p className="text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base">
                  Connect to any API and create beautiful widgets to visualize your data in real-time.
                </p>
                
                <div className="space-y-3">
                  <Button 
                    onClick={() => setAddModalOpen(true)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Widget
                  </Button>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs text-gray-400 dark:text-gray-500">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>Real-time data</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BarChart3 className="w-3 h-3" />
                      <span>Multiple chart types</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Activity className="w-3 h-3" />
                      <span>Auto-refresh</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        <AddWidgetModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} />
      </div>
    </div>
  );
}