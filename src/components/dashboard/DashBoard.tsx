'use client';

import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, TrendingUp, BarChart3, Activity, Eye, RefreshCw, Grid3X3, Sun, Moon, Github } from 'lucide-react';
import { useWidgetStore } from '@/store/widgetStore';
import { CardWidget } from '@/components/widgets/CardWidget';
import { TableWidget } from '@/components/widgets/TableWidget';
import { ChartWidget } from '@/components/widgets/ChartWidget';
import { AddWidgetModal } from './AddWidgetModel';
import { ModeToggle } from '../ui/ModeToggle';

export function Dashboard() {
  const { widgets, isAddModalOpen, setAddModalOpen, reorderWidgets, refreshWidget } = useWidgetStore();

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

  const renderWidget = (widget: any) => {
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
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Live updates</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Github Link */}
              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                title="View on GitHub"
              >
                <Github className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </a>
              {/* Mode Toggle */}
              <ModeToggle/>
              {widgets.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
              <Button
                onClick={() => setAddModalOpen(true)}
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Widget
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats - Groww style */}
        {widgets.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Total Widgets
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{widgets.length}</p>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Active</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                  <Grid3X3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Cards
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {widgets.filter(w => w.type === 'card').length}
                  </p>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Live data</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Tables
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {widgets.filter(w => w.type === 'table').length}
                  </p>
                  <div className="flex items-center space-x-1">
                    <Activity className="w-3 h-3 text-purple-500" />
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Data views</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Charts
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {widgets.filter(w => w.type === 'chart').length}
                  </p>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">Real-time</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Widgets Section */}
        <div className="space-y-4">
          {widgets.length > 0 && (
            <div className="flex items-center justify-between">
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
                    className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
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
                                widget.type === 'table' ? 'col-span-full' : ''
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
            /* Empty State - Groww inspired */
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <div className="text-center py-16 px-6">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Plus className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Start building your dashboard
                </h3>
                
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Connect to any API and create beautiful widgets to visualize your data in real-time.
                </p>
                
                <div className="space-y-3">
                  <Button 
                    onClick={() => setAddModalOpen(true)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Widget
                  </Button>
                  
                  <div className="flex items-center justify-center space-x-6 text-xs text-gray-400 dark:text-gray-500">
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

        <AddWidgetModal open={isAddModalOpen} onOpenChange={setAddModalOpen} />
      </div>
    </div>
  );
}