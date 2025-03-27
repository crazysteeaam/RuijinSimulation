export interface SpecialWindowType {
  id: string;
  name: string;
  color: string;
}

export interface SpecialWindowFormData {
  type: string;
  name: string;
  count: number;
}

export interface WindowConfig {
  id: string;
  name: string;
  specialTypeId?: string;
  processTime: number;
  timeRanges: Array<{ start: string; end: string }>;
}

export interface TemporaryWindow {
  id: string;
  name: string;
  x: number | null;
  y: number | null;
  active: boolean;
  config?: Omit<WindowConfig, 'id' | 'name'>;
} 