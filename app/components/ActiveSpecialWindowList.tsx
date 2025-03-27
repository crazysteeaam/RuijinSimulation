import { Card, Tag, Tooltip } from 'antd';
import { useState } from 'react';
import { SpecialWindowType } from '../types/config';

interface WindowConfig {
  id: string;
  name: string;
  specialTypeId?: string;
  processTime: number;
  timeRanges: Array<{ start: string; end: string }>;
}

interface ActiveSpecialWindowListProps {
  specialWindowTypes: SpecialWindowType[];
  windows: WindowConfig[];
}

export default function ActiveSpecialWindowList({ specialWindowTypes, windows }: ActiveSpecialWindowListProps) {
  const [expandedTypes, setExpandedTypes] = useState<string[]>([]);

  const toggleExpand = (typeId: string) => {
    setExpandedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const getWindowsByType = (typeId: string) => {
    return windows.filter(window => window.specialTypeId === typeId);
  };

  if (specialWindowTypes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {specialWindowTypes.map(type => {
        const typeWindows = getWindowsByType(type.id);
        const isExpanded = expandedTypes.includes(type.id);

        return (
          <Card
            key={type.id}
            size="small"
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleExpand(type.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag color="blue">{type.label}</Tag>
                <span className="text-gray-500 text-sm">
                  {typeWindows.length}个窗口
                </span>
              </div>
              <div className="text-gray-400">
                {isExpanded ? '收起' : '展开'}
              </div>
            </div>
            
            {isExpanded && typeWindows.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {typeWindows.map(window => (
                  <Tooltip 
                    key={window.id} 
                    title={
                      <div>
                        <div>处理时间：{window.processTime}秒</div>
                        {window.timeRanges.map((range, index) => (
                          <div key={index} className="text-xs mt-1">
                            开设时间：{range.start} - {range.end}
                          </div>
                        ))}
                      </div>
                    }
                  >
                    <Tag color="green">{window.name}</Tag>
                  </Tooltip>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
} 