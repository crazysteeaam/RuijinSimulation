import { useState, useEffect } from 'react';
import { Button, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import ElevatorScheduleConfig from './ElevatorScheduleConfig';

interface TimeRange {
  start: string;
  end: string;
  floors: string[];
}

interface ElevatorConfig {
  id: string;
  name: string;
  initialFloor: number;
  timeRanges: TimeRange[];
}

interface ElevatorPoint {
  id: string;
  name: string;
  position: {
    top: number;
    left: number;
  };
  currentFloor: number;
  status: 'idle' | 'moving' | 'loading';
  direction?: 'up' | 'down';
  config?: ElevatorConfig;
}

const DEFAULT_ELEVATORS: ElevatorPoint[] = [
  {
    id: '10',
    name: '10号电梯',
    position: { top: 15, left: 15 },
    currentFloor: 1,
    status: 'idle'
  },
  {
    id: '11',
    name: '11号电梯',
    position: { top: 15, left: 35 },
    currentFloor: 5,
    status: 'moving',
    direction: 'up'
  },
  {
    id: '12',
    name: '12号电梯',
    position: { top: 15, left: 55 },
    currentFloor: 3,
    status: 'loading'
  },
  {
    id: '13',
    name: '13号电梯',
    position: { top: 15, left: 75 },
    currentFloor: 2,
    status: 'idle'
  }
];

const STORAGE_KEY = 'elevator-configs';

export default function ElevatorPoints() {
  const [elevators, setElevators] = useState<ElevatorPoint[]>([]);
  const [configVisible, setConfigVisible] = useState(false);
  const [selectedElevator, setSelectedElevator] = useState<string>('');

  useEffect(() => {
    // 从localStorage加载配置
    const savedConfigs = localStorage.getItem(STORAGE_KEY);
    if (savedConfigs) {
      const configs = JSON.parse(savedConfigs) as ElevatorConfig[];
      setElevators(DEFAULT_ELEVATORS.map(elevator => {
        const savedConfig = configs.find(config => config.id === elevator.id);
        if (savedConfig) {
          return {
            ...elevator,
            currentFloor: savedConfig.initialFloor,
            config: savedConfig
          };
        }
        return elevator;
      }));
    } else {
      setElevators(DEFAULT_ELEVATORS);
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle':
        return 'bg-blue-500';
      case 'moving':
        return 'bg-green-500';
      case 'loading':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (elevator: ElevatorPoint) => {
    switch (elevator.status) {
      case 'idle':
        return `${elevator.currentFloor}F - 空闲`;
      case 'moving':
        return `${elevator.currentFloor}F - ${elevator.direction === 'up' ? '↑' : '↓'}`;
      case 'loading':
        return `${elevator.currentFloor}F - 乘客上下`;
      default:
        return `${elevator.currentFloor}F`;
    }
  };

  const handleSaveConfig = (config: ElevatorConfig) => {
    // 更新电梯状态
    setElevators(prev => prev.map(elevator => 
      elevator.id === config.id ? {
        ...elevator,
        currentFloor: config.initialFloor,
        config
      } : elevator
    ));

    // 保存到localStorage
    const savedConfigs = localStorage.getItem(STORAGE_KEY);
    const configs = savedConfigs ? JSON.parse(savedConfigs) as ElevatorConfig[] : [];
    const newConfigs = configs.filter(c => c.id !== config.id).concat(config);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfigs));
  };

  return (
    <div className="relative w-full h-full">
      {elevators.map((elevator) => (
        <Tooltip
          key={elevator.id}
          title={`${elevator.name} - ${getStatusText(elevator)}`}
          placement="right"
        >
          <Button
            type="primary"
            shape="round"
            icon={<InfoCircleOutlined />}
            className={`absolute ${getStatusColor(elevator.status)} border-none hover:opacity-80`}
            style={{
              top: `${elevator.position.top}%`,
              left: `${elevator.position.left}%`,
            }}
            onClick={() => {
              setSelectedElevator(elevator.id);
              setConfigVisible(true);
            }}
          >
            {elevator.name}
          </Button>
        </Tooltip>
      ))}

      <ElevatorScheduleConfig
        visible={configVisible}
        onClose={() => setConfigVisible(false)}
        elevatorId={selectedElevator}
        onSave={handleSaveConfig}
        initialConfig={elevators.find(e => e.id === selectedElevator)?.config}
      />
    </div>
  );
} 