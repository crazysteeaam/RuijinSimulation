import { useState, useEffect } from 'react';
import { Modal, Select, Button, InputNumber, Tabs, Space, Checkbox, TimePicker } from 'antd';
import type { TabsProps } from 'antd';
import dayjs from 'dayjs';

interface ElevatorScheduleConfigProps {
  visible: boolean;
  onClose: () => void;
  elevatorId: string;
  onSave: (config: ElevatorConfig) => void;
  initialConfig?: ElevatorConfig;
}

interface TimeInterval {
  time: string;
  floors: string[];
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

const DEFAULT_INTERVALS: TimeInterval[] = [
  {
    time: '12:00',
    floors: ['1F', '2F', '3F', '5F', '8F', '10F', '12F', '14F', '15F', '16F', '18F', '20F', '22F']
  }
];

const DEFAULT_LAST_INTERVAL: TimeInterval = {
  time: '06:30',
  floors: ['1F', '2F', '3F', '5F', '8F', '10F', '12F', '14F', '15F', '16F', '18F', '20F', '22F']
};

const ALL_FLOORS = generateFloors().map(f => f.value);
const EVEN_FLOORS = ALL_FLOORS.filter(f => parseInt(f) % 2 === 0);
const ODD_FLOORS = ALL_FLOORS.filter(f => parseInt(f) % 2 === 1);

const calculateTimeRanges = (intervals: TimeInterval[], lastInterval: TimeInterval): TimeRange[] => {
  const ranges: TimeRange[] = [];
  let currentTime = dayjs('06:30', 'HH:mm');
  const sortedIntervals = [...intervals].sort((a, b) => dayjs(a.time, 'HH:mm').diff(dayjs(b.time, 'HH:mm')));
  sortedIntervals.forEach((interval) => {
    const endTime = dayjs(interval.time, 'HH:mm');
    ranges.push({
      start: currentTime.format('HH:mm'),
      end: endTime.format('HH:mm'),
      floors: interval.floors
    });
    currentTime = endTime;
  });
  ranges.push({
    start: currentTime.format('HH:mm'),
    end: '06:30',
    floors: lastInterval.floors
  });
  return ranges;
};

export default function ElevatorScheduleConfig({
  visible,
  onClose,
  elevatorId,
  onSave,
  initialConfig
}: ElevatorScheduleConfigProps) {
  const [activeTab, setActiveTab] = useState('schedule');
  const [intervals, setIntervals] = useState<TimeInterval[]>(DEFAULT_INTERVALS);
  const [lastInterval, setLastInterval] = useState<TimeInterval>(DEFAULT_LAST_INTERVAL);
  const [initialFloor, setInitialFloor] = useState(initialConfig?.initialFloor || 1);

  useEffect(() => {
    if (initialConfig) {
      const newIntervals: TimeInterval[] = [];
      initialConfig.timeRanges.forEach((range, index) => {
        if (index < initialConfig.timeRanges.length - 1) {
          newIntervals.push({
            time: range.end,
            floors: range.floors
          });
        }
      });
      setIntervals(newIntervals);
      setLastInterval({
        time: '06:30',
        floors: initialConfig.timeRanges[initialConfig.timeRanges.length - 1].floors
      });
      setInitialFloor(initialConfig.initialFloor);
    } else {
      setIntervals(DEFAULT_INTERVALS);
      setLastInterval(DEFAULT_LAST_INTERVAL);
      setInitialFloor(1);
    }
  }, [initialConfig]);

  const handleTimeChange = (index: number, time: dayjs.Dayjs | null) => {
    if (!time) return;
    setIntervals(prev => prev.map((interval, i) =>
      i === index ? { ...interval, time: time.format('HH:mm') } : interval
    ));
  };

  const handleFloorsChange = (index: number, floors: string[]) => {
    setIntervals(prev => prev.map((interval, i) =>
      i === index ? { ...interval, floors } : interval
    ));
  };

  const handleLastIntervalFloorsChange = (floors: string[]) => {
    setLastInterval(prev => ({ ...prev, floors }));
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

  const handleLastIntervalQuickSelect = (type: 'all' | 'even' | 'odd' | 'none') => {
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
    handleLastIntervalFloorsChange(selectedFloors);
  };

  const handleAddInterval = () => {
    if (intervals.length >= 5) {
      return;
    }
    setIntervals(prev => [...prev, { time: '12:00', floors: [] }]);
  };

  const handleRemoveInterval = (index: number) => {
    if (intervals.length === 1) return;
    setIntervals(prev => prev.filter((_, i) => i !== index));
  };

  const renderFloorSelect = (index: number) => (
    <div style={{ marginTop: 8 }}>
      <Space size={8} style={{ marginBottom: 4 }}>
        <Checkbox
          checked={intervals[index].floors.length === ALL_FLOORS.length}
          indeterminate={intervals[index].floors.length > 0 && intervals[index].floors.length < ALL_FLOORS.length}
          onChange={(e) => handleQuickSelect(index, e.target.checked ? 'all' : 'none')}
        >全选</Checkbox>
        <Button size="small" onClick={() => handleQuickSelect(index, 'even')}>双层</Button>
        <Button size="small" onClick={() => handleQuickSelect(index, 'odd')}>单层</Button>
        <Button size="small" onClick={() => handleQuickSelect(index, 'none')}>清空</Button>
      </Space>
      <Select
        mode="multiple"
        style={{ width: '100%' }}
        placeholder="选择楼层"
        value={intervals[index].floors}
        onChange={(floors) => handleFloorsChange(index, floors)}
        options={generateFloors()}
        size="small"
      />
    </div>
  );

  const renderLastIntervalFloorSelect = () => (
    <div style={{ marginTop: 8 }}>
      <Space size={8} style={{ marginBottom: 4 }}>
        <Checkbox
          checked={lastInterval.floors.length === ALL_FLOORS.length}
          indeterminate={lastInterval.floors.length > 0 && lastInterval.floors.length < ALL_FLOORS.length}
          onChange={(e) => handleLastIntervalQuickSelect(e.target.checked ? 'all' : 'none')}
        >全选</Checkbox>
        <Button size="small" onClick={() => handleLastIntervalQuickSelect('even')}>双层</Button>
        <Button size="small" onClick={() => handleLastIntervalQuickSelect('odd')}>单层</Button>
        <Button size="small" onClick={() => handleLastIntervalQuickSelect('none')}>清空</Button>
      </Space>
      <Select
        mode="multiple"
        style={{ width: '100%' }}
        placeholder="选择楼层"
        value={lastInterval.floors}
        onChange={handleLastIntervalFloorsChange}
        options={generateFloors()}
        size="small"
      />
    </div>
  );

  const getTimeRange = (index: number) => {
    if (index === 0) {
      return {
        start: '06:30',
        end: intervals[0].time
      };
    }
    return {
      start: intervals[index - 1].time,
      end: intervals[index].time
    };
  };

  // 判断时间是否在次日区间（0:00-6:30，包含06:30）
  const isNextDayTime = (time: string) => {
    const t = dayjs(`2000-01-01 ${time}`);
    const start = dayjs('2000-01-01 00:00');
    const end = dayjs('2000-01-01 06:30');
    return (t.isAfter(start) || t.isSame(start)) && (t.isBefore(end) || t.isSame(end));
  };

  // 获取时间显示文本，0:00-6:30区间加“次日”，第一个时间段的开始时间除外
  const getTimeDisplayText = (startTime: string, endTime: string, isFirst: boolean = false) => {
    const showStartNextDay = !isFirst && isNextDayTime(startTime);
    const showEndNextDay = isNextDayTime(endTime);
    const startLabel = showStartNextDay ? `次日 ${startTime}` : startTime;
    const endLabel = showEndNextDay ? `次日 ${endTime}` : endTime;
    return `${startLabel} 至 ${endLabel}`;
  };

  const items: TabsProps['items'] = [
    {
      key: 'schedule',
      label: '调度配置',
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {intervals.map((interval, index) => {
            const timeRange = getTimeRange(index);
            const timeDisplayText = getTimeDisplayText(timeRange.start, timeRange.end, index === 0);
            return (
              <div key={index} style={{ border: '1px solid #eee', borderRadius: 6, padding: 12, background: '#fafbfc', marginBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 500, fontSize: 15, marginRight: 12 }}>第{index + 1}时间段</span>
                  <span style={{ marginRight: 8, fontSize: 14, color: '#666' }}>
                    {timeDisplayText}
                  </span>
                  <TimePicker
                    format="HH:mm"
                    value={dayjs(interval.time, 'HH:mm')}
                    onChange={(time) => handleTimeChange(index, time)}
                    style={{ width: 90, marginRight: 8 }}
                    minuteStep={5}
                    allowClear={false}
                  />
                  {intervals.length > 1 && (
                    <Button
                      type="text"
                      danger
                      size="small"
                      style={{ marginLeft: 'auto' }}
                      onClick={() => handleRemoveInterval(index)}
                    >删除</Button>
                  )}
                </div>
                {renderFloorSelect(index)}
              </div>
            );
          })}
          {intervals.length < 5 && (
            <Button
              type="dashed"
              onClick={handleAddInterval}
              style={{ width: '100%', marginTop: 8 }}
              size="small"
            >添加时间段</Button>
          )}
          <div style={{ border: '1px solid #eee', borderRadius: 6, padding: 12, background: '#fafbfc', marginTop: 8 }}>
            <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 8 }}>
              最后一个时间段
              <span style={{ marginLeft: 8, fontSize: 14, color: '#666' }}>
                {getTimeDisplayText(intervals[intervals.length - 1].time, '06:30', false)}
              </span>
            </div>
            {renderLastIntervalFloorSelect()}
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
          setIntervals(DEFAULT_INTERVALS);
          setLastInterval(DEFAULT_LAST_INTERVAL);
          setInitialFloor(1);
        }}>
          重设
        </Button>,
        <Button key="save" type="primary" onClick={() => {
          onSave({
            id: elevatorId,
            name: elevatorId,
            initialFloor,
            timeRanges: calculateTimeRanges(intervals, lastInterval),
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