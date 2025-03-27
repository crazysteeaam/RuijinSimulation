import { useState, useEffect } from 'react';
import { SpecialWindowType } from '../types/config';
import RegistrationPoints from './RegistrationPoints';
import CheckWindowPoints from './CheckWindowPoints';
import { message } from 'antd';
import { TemporaryWindow } from './TemporaryWindowConfig';

interface WindowConfig {
  id: string;
  name: string;
  specialTypeId?: string;
  processTime: number;
  timeRanges: Array<{ start: string; end: string }>;
}

interface MonitoringPointsProps {
  specialWindowTypes: SpecialWindowType[];
  onWindowConfigChange?: (windowId: string, config: WindowConfig | undefined) => void;
  temporaryWindows?: TemporaryWindow[];
  onTemporaryWindowPositionChange?: (windowId: string, x: number, y: number) => void;
  positioningMode?: boolean;
  selectedWindow?: string | null;
}

const initialRegistrationPoints = [
  { id: 'reg1', name: '挂号机2-1', x: 15, y: 15, active: true },
  { id: 'reg2', name: '挂号机2-2', x: 15, y: 25, active: true },
  { id: 'reg3', name: '挂号机2-3', x: 25, y: 15, active: true },
  { id: 'reg4', name: '挂号机2-4', x: 60, y: 15, active: true },
];

const initialCheckWindowPoints = [
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

export default function MonitoringPoints({ 
  specialWindowTypes, 
  onWindowConfigChange,
  temporaryWindows = [],
  onTemporaryWindowPositionChange,
  positioningMode = false,
  selectedWindow = null
}: MonitoringPointsProps) {
  const [registrationPoints, setRegistrationPoints] = useState(initialRegistrationPoints);
  const [checkWindowPoints, setCheckWindowPoints] = useState(initialCheckWindowPoints);

  // 监听临时窗口变化
  useEffect(() => {
    // 将临时窗口转换为checkWindowPoints格式
    const temporaryPoints = temporaryWindows
      .filter(w => w.x !== null && w.y !== null)
      .map(w => ({
        id: w.id,
        name: w.name,
        x: w.x!,
        y: w.y!,
        active: w.active,
        config: w.config
      }));

    // 更新checkWindowPoints，保留原有窗口
    setCheckWindowPoints([
      ...initialCheckWindowPoints,
      ...temporaryPoints
    ]);
  }, [temporaryWindows]);

  const handleRegistrationConfigChange = (pointId: string, config: { processTime: number } | undefined) => {
    if (!config) return;
    setRegistrationPoints(prev => 
      prev.map(point => 
        point.id === pointId 
          ? { ...point, config }
          : point
      )
    );
  };

  const handleCheckWindowConfigChange = (windowId: string, config: Omit<WindowConfig, 'id' | 'name'> | undefined) => {
    if (!config) return;
    
    // 找到当前窗口
    const currentWindow = checkWindowPoints.find(point => point.id === windowId);
    if (!currentWindow) return;

    // 更新本地状态
    setCheckWindowPoints(prev => 
      prev.map(point => 
        point.id === windowId 
          ? { ...point, config }
          : point
      )
    );

    // 将配置和窗口名称传递给父组件
    if (onWindowConfigChange) {
      onWindowConfigChange(windowId, {
        id: windowId,
        name: currentWindow.name,
        ...config
      });
    }
  };

  // 处理场景点击事件
  const handleSceneClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!positioningMode || !selectedWindow || !onTemporaryWindowPositionChange) return;
    
    // 获取相对坐标
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    
    // 更新窗口位置
    onTemporaryWindowPositionChange(selectedWindow, x, y);
    message.success('窗口位置已设置');
  };

  return (
    <div 
      className="relative w-full h-full bg-transparent"
      onClick={handleSceneClick}
      style={{ cursor: positioningMode ? 'crosshair' : 'default' }}
    >
      <RegistrationPoints 
        points={registrationPoints} 
        onConfigChange={handleRegistrationConfigChange}
      />
      <CheckWindowPoints 
        points={checkWindowPoints}
        specialWindowTypes={specialWindowTypes}
        onWindowConfigChange={handleCheckWindowConfigChange}
      />
      {positioningMode && (
        <div className="absolute inset-0 bg-transparent flex items-center justify-center pointer-events-none">
          <div className="text-gray-800 text-lg font-medium px-4 py-2 rounded-lg bg-white bg-opacity-60 pointer-events-none">
            点击场景设置窗口位置
          </div>
        </div>
      )}
    </div>
  );
} 