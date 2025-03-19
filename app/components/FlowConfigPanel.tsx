import { useState } from 'react';
import { Button, Card } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import FlowConfig from './FlowConfig';
import ElevatorFlowConfig from './ElevatorFlowConfig';
import { SpecialWindowType } from '../types/config';

interface TimeRange {
  timeSlot: string;
  meanArrivals: number;
  stdDeviation: number;
}

interface FloorFlow {
  floor: string;
  morningOut: number;
  morningIn: number;
  afternoonOut: number;
  afternoonIn: number;
}

interface FlowTemplate {
  id: string;
  name: string;
  data: FloorFlow[];
  isPreset?: boolean;
}

// 生成从7:00到21:00的半小时间隔
const generateTimeRanges = (): TimeRange[] => {
  const ranges: TimeRange[] = [];
  for (let hour = 7; hour < 21; hour++) {
    const hour1 = hour.toString().padStart(2, '0');
    const hour2 = (hour + 1).toString().padStart(2, '0');
    
    ranges.push({
      timeSlot: `${hour1}:00-${hour1}:30`,
      meanArrivals: 20,
      stdDeviation: 5
    });
    
    if (hour < 20) {
      ranges.push({
        timeSlot: `${hour1}:30-${hour2}:00`,
        meanArrivals: 20,
        stdDeviation: 5
      });
    }
  }
  return ranges;
};

const DEFAULT_ELEVATOR_FLOW_DATA: FloorFlow[] = Array.from({ length: 22 }, (_, i) => ({
  floor: `${i + 1}楼`,
  morningOut: 210,
  morningIn: 24,
  afternoonOut: 231,
  afternoonIn: 244,
}));

const DEFAULT_ELEVATOR_TEMPLATES: FlowTemplate[] = [
  {
    id: '1',
    name: '工作日模板',
    data: DEFAULT_ELEVATOR_FLOW_DATA,
    isPreset: true
  },
  {
    id: '2',
    name: '周末模板',
    data: DEFAULT_ELEVATOR_FLOW_DATA.map(item => ({
      ...item,
      morningOut: Math.round(item.morningOut * 0.7),
      morningIn: Math.round(item.morningIn * 0.7),
      afternoonOut: Math.round(item.afternoonOut * 0.7),
      afternoonIn: Math.round(item.afternoonIn * 0.7),
    })),
    isPreset: true
  }
];

// 从localStorage获取保存的模板
function getSavedTemplates(): FlowTemplate[] {
  try {
    const saved = localStorage.getItem('elevatorFlowTemplates');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// 保存模板到localStorage
function saveTemplates(templates: FlowTemplate[]) {
  localStorage.setItem('elevatorFlowTemplates', JSON.stringify(templates));
}

interface FlowConfigPanelProps {
  specialWindowTypes?: SpecialWindowType[];
  className?: string;
  type?: 'lab' | 'elevator';
}

export default function FlowConfigPanel({ specialWindowTypes = [], className, type = 'lab' }: FlowConfigPanelProps) {
  const [configVisible, setConfigVisible] = useState(false);
  const [flowData, setFlowData] = useState<TimeRange[] | FloorFlow[]>(
    type === 'lab' ? generateTimeRanges() : DEFAULT_ELEVATOR_FLOW_DATA
  );
  const [templates, setTemplates] = useState<FlowTemplate[]>(() => {
    if (type === 'elevator') {
      return [...DEFAULT_ELEVATOR_TEMPLATES, ...getSavedTemplates()];
    }
    return [];
  });

  const handleFlowConfigSave = (data: TimeRange[] | FloorFlow[]) => {
    setFlowData(data);
  };

  const handleDeleteTemplate = (templateId: string) => {
    const newTemplates = templates.filter(t => !t.isPreset && t.id !== templateId);
    saveTemplates(newTemplates);
    setTemplates([...DEFAULT_ELEVATOR_TEMPLATES, ...newTemplates]);
  };

  const handleSaveTemplate = (template: FlowTemplate) => {
    const savedTemplates = getSavedTemplates();
    const newTemplates = [...savedTemplates, template];
    saveTemplates(newTemplates);
    setTemplates([...DEFAULT_ELEVATOR_TEMPLATES, ...newTemplates]);
  };

  return (
    <div className={className}>
      <Card size="small" className="mb-4">
        <div className="flex flex-col gap-2">
          <Button
            type="text"
            icon={<SettingOutlined />}
            onClick={() => setConfigVisible(true)}
            className="text-left"
          >
            客流配置
          </Button>
        </div>
      </Card>

      {type === 'lab' ? (
        <FlowConfig
          visible={configVisible}
          onClose={() => setConfigVisible(false)}
          onSave={handleFlowConfigSave as (data: TimeRange[]) => void}
          initialData={flowData as TimeRange[]}
          specialWindowTypes={specialWindowTypes}
        />
      ) : (
        <ElevatorFlowConfig
          visible={configVisible}
          onClose={() => setConfigVisible(false)}
          onSave={handleFlowConfigSave as (data: FloorFlow[]) => void}
          initialData={flowData as FloorFlow[]}
          templates={templates}
          onDeleteTemplate={handleDeleteTemplate}
          onSaveTemplate={handleSaveTemplate}
        />
      )}
    </div>
  );
} 