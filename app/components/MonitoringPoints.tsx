import { useState } from 'react';
import { Tooltip, Button, Tag } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import RoomConfig from './RoomConfig';

interface SpecialWindowType {
  id: string;
  type: string;
  label: string;
}

interface MonitoringPoint {
  id: string;
  name: string;
  x: number;
  y: number;
  active?: boolean;
  config?: {
    processTime: number;
    timeRanges: Array<{ start: string; end: string }>;
    specialTypeId?: string;
  };
}

const monitoringPoints: MonitoringPoint[] = [
  { id: 'reg1', name: '挂号机2-1', x: 15, y: 15, active: true },
  { id: 'reg2', name: '挂号机2-2', x: 15, y: 25, active: true },
  { id: 'reg3', name: '挂号机2-3', x: 25, y: 15, active: true },
  { id: 'reg4', name: '挂号机2-4', x: 60, y: 15, active: true },
  { id: 'check1', name: '检验窗1', x: 30, y: 50, active: true },
  { id: 'check2', name: '检验窗2', x: 35, y: 50 },
  { id: 'check3', name: '检验窗3', x: 40, y: 50, active: true },
  { id: 'check4', name: '检验窗4', x: 45, y: 50 },
  { id: 'check5', name: '检验窗5', x: 50, y: 50, active: true },
  { id: 'check6', name: '检验窗6', x: 45, y: 60, active: true },
  { id: 'check7', name: '检验窗7', x: 60, y: 50, active: true },
  { id: 'check8', name: '检验窗8', x: 65, y: 60, active: true },
  { id: 'check9', name: '检验窗9', x: 70, y: 50, active: true },
  { id: 'check10', name: '检验窗10', x: 75, y: 60, active: true },
];

// 模拟特殊窗口类型数据
const specialWindowTypes: SpecialWindowType[] = [
  { id: '1', type: 'elderly', label: '老年人专窗' },
  { id: '2', type: 'project', label: '项目专窗' },
  { id: '3', type: 'emergency', label: '急诊专窗' },
  { id: '4', type: 'vip', label: 'VIP专窗' },
  { id: '5', type: 'chronic', label: '慢病专窗' },
];

export default function MonitoringPoints() {
  const [configVisible, setConfigVisible] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<MonitoringPoint | null>(null);
  const [points, setPoints] = useState<MonitoringPoint[]>(monitoringPoints);

  const handleConfigClick = (point: MonitoringPoint, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPoint(point);
    setConfigVisible(true);
  };

  const handleConfigSave = (config: MonitoringPoint['config']) => {
    if (!selectedPoint) return;
    const newPoints = points.map(p => 
      p.id === selectedPoint.id ? { ...p, config } : p
    );
    setPoints(newPoints);
  };

  const getSpecialTypeLabel = (typeId?: string) => {
    if (!typeId) return null;
    const type = specialWindowTypes.find(t => t.id === typeId);
    return type?.label;
  };

  return (
    <>
      {points.map((point) => (
        <Tooltip 
          key={point.id} 
          title={
            <div>
              <div>{point.name}</div>
              {point.config?.specialTypeId && (
                <div className="text-xs mt-1">
                  类型：{getSpecialTypeLabel(point.config.specialTypeId)}
                </div>
              )}
            </div>
          }
        >
          <div
            className={`absolute cursor-pointer flex items-center rounded-full bg-white/90 shadow-lg px-2 py-1 ${
              point.active ? 'border-l-4 border-blue-500' : ''
            }`}
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className={`text-sm ${point.active ? 'text-blue-500' : 'text-gray-500'}`}>
              {point.name}
            </div>
            {point.config?.specialTypeId && (
              <Tag color="blue" className="mx-1 !mb-0">
                {getSpecialTypeLabel(point.config.specialTypeId)}
              </Tag>
            )}
            <Button
              type="text"
              size="small"
              className="flex items-center ml-1 !px-0"
              icon={<MoreOutlined />}
              onClick={(e) => handleConfigClick(point, e)}
            />
          </div>
        </Tooltip>
      ))}

      {selectedPoint && (
        <RoomConfig
          visible={configVisible}
          onClose={() => {
            setConfigVisible(false);
            setSelectedPoint(null);
          }}
          onSave={handleConfigSave}
          roomName={selectedPoint.name}
          specialWindowTypes={specialWindowTypes}
          initialConfig={selectedPoint.config}
        />
      )}
    </>
  );
} 