import * as XLSX from 'xlsx';

export interface TimeRange {
  timeSlot: string;
  meanArrivals: number;
  stdDeviation: number;
}

export interface FloorFlow {
  floor: string;
  morningOut: number;
  morningIn: number;
  afternoonOut: number;
  afternoonIn: number;
}

// Convert time ranges data to Excel format
export function timeRangesToExcel(data: TimeRange[]): XLSX.WorkBook {
  const worksheet = XLSX.utils.json_to_sheet(data.map(item => ({
    '时间段': item.timeSlot,
    '到达人数平均数': item.meanArrivals,
    '到达人数标准差': item.stdDeviation
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '时间段配置');
  return workbook;
}

// Parse Excel file for time ranges
export function excelToTimeRanges(file: File): Promise<TimeRange[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as Array<Record<string, unknown>>;

        const timeRanges: TimeRange[] = jsonData.map(row => ({
          timeSlot: String(row['时间段'] || ''),
          meanArrivals: Number(row['到达人数平均数'] || 0),
          stdDeviation: Number(row['到达人数标准差'] || 0)
        }));

        resolve(timeRanges);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Excel文件格式不正确';
        reject(new Error(errorMessage));
      }
    };
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsArrayBuffer(file);
  });
}

// Convert floor flow data to Excel format
export function floorFlowToExcel(data: FloorFlow[]): XLSX.WorkBook {
  const worksheet = XLSX.utils.json_to_sheet(data.map(item => ({
    '楼层': item.floor,
    '上午出发': item.morningOut,
    '上午到达': item.morningIn,
    '下午出发': item.afternoonOut,
    '下午到达': item.afternoonIn
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '楼层客流配置');
  return workbook;
}

// Parse Excel file for floor flow
export function excelToFloorFlow(file: File): Promise<FloorFlow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as Array<Record<string, unknown>>;

        const floorFlows: FloorFlow[] = jsonData.map(row => ({
          floor: String(row['楼层'] || ''),
          morningOut: Number(row['上午出发'] || 0),
          morningIn: Number(row['上午到达'] || 0),
          afternoonOut: Number(row['下午出发'] || 0),
          afternoonIn: Number(row['下午到达'] || 0)
        }));

        resolve(floorFlows);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Excel文件格式不正确';
        reject(new Error(errorMessage));
      }
    };
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsArrayBuffer(file);
  });
}

// Download Excel file
export function downloadExcel(workbook: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(workbook, filename);
} 