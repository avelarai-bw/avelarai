export interface User {
  id: string;
  username: string;
  email: string;
  tier: 'free' | 'paid';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ColumnStat {
  name: string;
  type: 'numeric' | 'categorical' | 'date';
  mean: number | null;
  median: number | null;
  mode: string | number | null;
  stdDev: number | null;
  variance: number | null;
  min: number | null;
  max: number | null;
  nullCount: number;
}

export interface Statistics {
  rowCount: number;
  columnCount: number;
  columns: ColumnStat[];
}

export interface ChartSuggestion {
  type: 'bar' | 'line' | 'pie';
  title: string;
  xKey: string;
  yKey: string;
}

export interface Analysis {
  _id: string;
  fileName: string;
  fileType: string;
  status: 'processing' | 'complete' | 'failed';
  statistics: Statistics | null;
  interpretation: string;
  chartData: {
    summary: string;
    keyInsights: string[];
    chartSuggestions: ChartSuggestion[];
  };
  rawData: string;
  createdAt: string;
}

export interface AnalysisSummary {
  _id: string;
  fileName: string;
  fileType: string;
  status: 'processing' | 'complete' | 'failed';
  createdAt: string;
}