"use client";
import { useWidgets, useWidgetOrder, useDashboardActions } from "@/lib/store";
import { StockCard } from "@/components/widgets/StockCard";
import { DataTable } from "@/components/widgets/DataTable";
import { PriceChart } from "@/components/widgets/PriceCharts";
import { SortableGrid } from "./SortableGrid";
import { Card } from "@/components/ui/card";

export function WidgetGrid() {
  const widgets = useWidgets();
  const order = useWidgetOrder();
  const { removeWidget, reorderWidgets } = useDashboardActions();

  // derive list ids; if order empty (first run), seed from widgets
  const ids = order.length ? order : widgets.map((w) => w.id);

  if (widgets.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        Add a widget to get started
      </Card>
    );
  }

  const mapById = new Map(widgets.map((w) => [w.id, w]));

  return (
    <SortableGrid
      ids={ids}
      onReorder={reorderWidgets}
      renderItem={(id: string) => {
        const widget = mapById.get(id);
        if (!widget) return null;
        const common = {
          widgetId: widget.id,
          title: widget.title,
          apiEndpoint: widget.apiEndpoint,
          onRemove: removeWidget,
        };
        if (widget.type === "card") return <StockCard {...common} />;
        if (widget.type === "table") return <div className="col-span-full lg:col-span-2"><DataTable {...common} /></div>;
        if (widget.type === "chart") return <div className="col-span-full lg:col-span-2"><PriceChart {...common} /></div>;
        return null;
      }}
    />
  );
}
