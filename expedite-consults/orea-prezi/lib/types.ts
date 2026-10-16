export type WidgetType =
  | "metrics-grid"
  | "timeline-flow"
  | "architecture-diagram"
  | "roi-calculator"
  | "comparison-matrix"
  | "compliance-radar"
  | "case-study";

export interface MetricItem {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  description?: string;
}

export interface BulletPoint {
  title: string;
  text: string;
  iconName?: string;
}

export interface TimelineStep {
  phase: string;
  period: string;
  title: string;
  status: "completed" | "in-progress" | "planned";
  items: string[];
}

export interface ComparisonItem {
  feature: string;
  legacy: string;
  oreaNext: string;
  status: "superior" | "compliant" | "standard";
}

export interface SlideData {
  id: string;
  clusterId: string;
  title: string;
  kicker: string;
  subtitle: string;
  x: number;
  y: number;
  scale?: number;
  presenterNotes: string;
  metrics?: MetricItem[];
  bullets?: BulletPoint[];
  widgetType?: WidgetType;
  widgetData?: {
    timeline?: TimelineStep[];
    comparisons?: ComparisonItem[];
    calculatorDefaults?: {
      agents: number;
      avgTransactions: number;
      complianceSavings: number;
    };
    techPillars?: {
      layer: string;
      title: string;
      tags: string[];
      details: string;
    }[];
  };
  callout?: {
    text: string;
    author?: string;
    badge?: string;
  };
}

export interface ClusterData {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  accentColor: string;
  badge: string;
  x: number;
  y: number;
  radius: number;
  slides: SlideData[];
}

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

export type ViewMode = "overview" | "cluster" | "slide";
