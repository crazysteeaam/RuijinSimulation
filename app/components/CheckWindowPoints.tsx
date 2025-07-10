import { useState } from 'react';
import { Tooltip, Button, Tag } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import RoomConfig from './RoomConfig';
import { SpecialWindowType } from '../types/config';

interface CheckWindowPoint {
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

interface CheckWindowPointsProps {
  points: CheckWindowPoint[];
  specialWindowTypes: SpecialWindowType[];
  onWindowConfigChange?: (windowId: string, config: CheckWindowPoint['config']) => void;
}

export default function CheckWindowPoints({ points, specialWindowTypes, onWindowConfigChange }: CheckWindowPointsProps) {
  const [configVisible, setConfigVisible] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<CheckWindowPoint | null>(null);

  const handleConfigClick = (point: CheckWindowPoint, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPoint(point);
    setConfigVisible(true);
  };

  const handleConfigSave = (config: CheckWindowPoint['config']) => {
    if (selectedPoint && onWindowConfigChange) {
      onWindowConfigChange(selectedPoint.id, config);
    }
    setConfigVisible(false);
    setSelectedPoint(null);
  };

  const getSpecialTypeLabel = (typeId?: string) => {
    if (!typeId) return null;
    const type = specialWindowTypes.find(t => t.id === typeId);
    return type?.name;
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