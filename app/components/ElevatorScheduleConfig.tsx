import { useState, useEffect } from 'react';
import { Modal, Select, Button, InputNumber, Tabs, TimePicker, Space, Checkbox } from 'antd';
import type { TabsProps } from 'antd';
import dayjs from 'dayjs';

interface ElevatorScheduleConfigProps {
  visible: boolean;
  onClose: () => void;
  elevatorId: string;
  onSave: (config: ElevatorConfig) => void;
  initialConfig?: ElevatorConfig;
}

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

const generateFloors = () => {
  const floors = [];
  for (let i = 1; i <= 22; i++) {
    floors.push({
      label: `${i}F`,
      value: `${i}F`,
    });
  }
  return floors;
};

const DEFAULT_TIME_RANGES: TimeRange[] = [
  {
    start: '06:30',
    end: '12:00',
    floors: ['1F', '2F', '3F', '5F', '8F', '10F', '12F', '14F', '15F', '16F', '18F', '20F', '22F']
  },
  {
    start: '12:00',
    end: '06:30',
    floors: ['1F', '2F', '3F']
  }
];

const ALL_FLOORS = generateFloors().map(f => f.value);
const EVEN_FLOORS = ALL_FLOORS.filter(f => parseInt(f) % 2 === 0);
const ODD_FLOORS = ALL_FLOORS.filter(f => parseInt(f) % 2 === 1);

export default function ElevatorScheduleConfig({
  visible,
  onClose,
  elevatorId,
  onSave,
  initialConfig
}: ElevatorScheduleConfigProps) {
  const [activeTab, setActiveTab] = useState('schedule');
  const [timeRanges, setTimeRanges] = useState<TimeRange[]>(DEFAULT_TIME_RANGES);
  const [initialFloor, setInitialFloor] = useState(initialConfig?.initialFloor || 1);

  useEffect(() => {
    if (initialConfig) {
      setTimeRanges(initialConfig.timeRanges);
      setInitialFloor(initialConfig.initialFloor);
    } else {
      setTimeRanges(DEFAULT_TIME_RANGES);
      setInitialFloor(1);
    }
  }, [initialConfig]);

  const handleTimeChange = (time: dayjs.Dayjs | null) => {
    if (!time) return;
    const timeStr = time.format('HH:mm');
    setTimeRanges(prev => [
      { ...prev[0], end: timeStr },
      { ...prev[1], start: timeStr }
    ]);
  };

  const handleFloorsChange = (index: number, floors: string[]) => {
    setTimeRanges(prev => prev.map((range, i) => 
      i === index ? { ...range, floors } : range
    ));
  };

  const handleQuickSelect = (index: number, type: 'all' | 'even' | 'odd' | 'none') => {
    let selectedFloors: string[] = [];
    switch (type) {
      case 'all':
        selectedFloors = ALL_FLOORS;
        break;
      case 'even':
        selectedFloors = EVEN_FLOORS;
        break;
      case 'odd':
        selectedFloors = ODD_FLOORS;
        break;
      case 'none':
        selectedFloors = [];
        break;
    }
    handleFloorsChange(index, selectedFloors);
  };

  const renderFloorSelect = (index: number) => (
    <div>
      <div className="mb-2 flex justify-between items-center">
        <Space>
          <Checkbox
            checked={timeRanges[index].floors.length === ALL_FLOORS.length}
            indeterminate={timeRanges[index].floors.length > 0 && timeRanges[index].floors.length < ALL_FLOORS.length}
            onChange={(e) => handleQuickSelect(index, e.target.checked ? 'all' : 'none')}
          >
            全选
          </Checkbox>
          <Button size="small" onClick={() => handleQuickSelect(index, 'even')}>
            双层
          </Button>
          <Button size="small" onClick={() => handleQuickSelect(index, 'odd')}>
            单层
          </Button>
          <Button size="small" onClick={() => handleQuickSelect(index, 'none')}>
            清空
          </Button>
        </Space>
      </div>
      <Select
        mode="multiple"
        style={{ width: '100%' }}
        placeholder="选择楼层"
        value={timeRanges[index].floors}
        onChange={(floors) => handleFloorsChange(index, floors)}
        options={generateFloors()}
      />
    </div>
  );

  const items: TabsProps['items'] = [
    {
      key: 'schedule',
      label: '调度配置',
      children: (
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="border p-4 rounded">
              <div className="mb-2">第一时间段</div>
              <div className="flex items-center gap-4 mb-4">
                <TimePicker
                  format="HH:mm"
                  value={dayjs(timeRanges[0].start, 'HH:mm')}
                  disabled
                />
                <span>至</span>
                <TimePicker
                  format="HH:mm"
                  value={dayjs(timeRanges[0].end, 'HH:mm')}
                  onChange={handleTimeChange}
                />
              </div>
              {renderFloorSelect(0)}
            </div>
            <div className="border p-4 rounded">
              <div className="mb-2">第二时间段（至次日）</div>
              <div className="flex items-center gap-4 mb-4">
                <TimePicker
                  format="HH:mm"
                  value={dayjs(timeRanges[1].start, 'HH:mm')}
                  disabled
                />
                <span>至</span>
                <TimePicker
                  format="HH:mm"
                  value={dayjs(timeRanges[1].end, 'HH:mm')}
                  disabled
                />
                <span className="text-gray-500">（次日）</span>
              </div>
              {renderFloorSelect(1)}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'position',
      label: '初始楼层',
      children: (
        <div className="space-y-4">
          <div>
            <div className="mb-2">电梯初始楼层</div>
            <InputNumber
              min={1}
              max={22}
              value={initialFloor}
              onChange={(value) => setInitialFloor(value || 1)}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={`${elevatorId}配置`}
      open={visible}
      onCancel={onClose}
      width={500}
      footer={[
        <Button key="reset" onClick={() => {
          setTimeRanges(DEFAULT_TIME_RANGES);
          setInitialFloor(1);
        }}>
          重设
        </Button>,
        <Button key="save" type="primary" onClick={() => {
          onSave({
            id: elevatorId,
            name: elevatorId,
            initialFloor,
            timeRanges,
          });
          onClose();
        }}>
          保存
        </Button>,
      ]}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
      />
    </Modal>
  );
} 