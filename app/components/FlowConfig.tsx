import { useState, useEffect } from 'react';
import { Modal, Table, InputNumber, Tabs, Button, Input, Select, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import { SpecialWindowType } from '../types/config';

interface TimeRange {
  timeSlot: string;
  meanArrivals: number;
  stdDeviation: number;
}

interface PatientType {
  specialTypeId: string;
  ratio: number;
}

interface FlowTemplate {
  id: string;
  name: string;
  timeRanges: TimeRange[];
  isPreset?: boolean;
}

interface FlowConfigProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: TimeRange[], patientTypes: PatientType[]) => void;
  initialData: TimeRange[];
  specialWindowTypes: SpecialWindowType[];
}

// 预设模板数据
const PRESET_TEMPLATES: FlowTemplate[] = [
  {
    id: 'preset-1',
    name: '工作日模板',
    timeRanges: generateTimeRanges(),
    isPreset: true
  },
  {
    id: 'preset-2',
    name: '周末模板',
    timeRanges: generateTimeRanges(),
    isPreset: true
  }
];

// 生成从7:00到21:00的半小时间隔
function generateTimeRanges(): TimeRange[] {
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
}

// 从localStorage获取保存的模板
function getSavedTemplates(): FlowTemplate[] {
  try {
    const saved = localStorage.getItem('flowTemplates');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// 保存模板到localStorage
function saveTemplates(templates: FlowTemplate[]) {
  localStorage.setItem('flowTemplates', JSON.stringify(templates));
}

export default function FlowConfig({ visible, onClose, onSave, initialData, specialWindowTypes }: FlowConfigProps) {
  const [data, setData] = useState<TimeRange[]>(initialData);
  const [patientTypes, setPatientTypes] = useState<PatientType[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [savedTemplates, setSavedTemplates] = useState<FlowTemplate[]>([]);

  useEffect(() => {
    if (visible) {
      setData(initialData);
      setSavedTemplates(getSavedTemplates());
    }
  }, [visible, initialData]);

  const handleMeanChange = (value: number | null, index: number) => {
    if (value === null) return;
    const newData = [...data];
    newData[index] = {
      ...newData[index],
      meanArrivals: value
    };
    setData(newData);
  };

  const handleStdDevChange = (value: number | null, index: number) => {
    if (value === null) return;
    const newData = [...data];
    newData[index] = {
      ...newData[index],
      stdDeviation: value
    };
    setData(newData);
  };

  const handlePatientTypeRatioChange = (specialTypeId: string, ratio: number | null) => {
    if (ratio === null) return;

    const newTypes = [...patientTypes];
    const index = newTypes.findIndex(t => t.specialTypeId === specialTypeId);
    
    // 计算其他特殊类型的总和
    const otherTypesSum = newTypes.reduce((sum, type) => 
      type.specialTypeId !== specialTypeId ? (sum + (type.ratio || 0)) : sum, 
      0
    );

    // 检查总和是否超过100%
    if (otherTypesSum + ratio > 100) {
      message.error('特殊类型比例总和不能超过100%');
      return;
    }

    if (index >= 0) {
      newTypes[index] = { ...newTypes[index], ratio };
    } else {
      newTypes.push({ specialTypeId, ratio });
    }
    setPatientTypes(newTypes);
  };

  const handleSaveAsTemplate = () => {
    if (!templateName.trim()) {
      message.error('请输入模板名称');
      return;
    }

    const newTemplate: FlowTemplate = {
      id: `custom-${Date.now()}`,
      name: templateName.trim(),
      timeRanges: data
    };

    const templates = [...savedTemplates, newTemplate];
    saveTemplates(templates);
    setSavedTemplates(templates);
    setTemplateName('');
    message.success('模板保存成功');
  };

  const handleDeleteTemplate = (templateId: string) => {
    const templates = savedTemplates.filter(t => t.id !== templateId);
    saveTemplates(templates);
    setSavedTemplates(templates);
    message.success('模板删除成功');
  };

  const timeRangeColumns: ColumnsType<TimeRange> = [
    {
      title: '时间段',
      dataIndex: 'timeSlot',
      key: 'timeSlot',
      width: '33%',
      className: 'text-gray-600',
      render: (text) => <div className="font-mono">{text}</div>
    },
    {
      title: '到达人数平均数',
      dataIndex: 'meanArrivals',
      key: 'meanArrivals',
      width: '33%',
      render: (value: number, record: TimeRange, index: number) => (
        <InputNumber
          min={0}
          max={200}
          value={value}
          onChange={(value) => handleMeanChange(value, index)}
          className="w-24"
          size="small"
        />
      ),
    },
    {
      title: '到达人数标准差',
      dataIndex: 'stdDeviation',
      key: 'stdDeviation',
      width: '33%',
      render: (value: number, record: TimeRange, index: number) => (
        <InputNumber
          min={0}
          max={50}
          value={value}
          onChange={(value) => handleStdDevChange(value, index)}
          className="w-24"
          size="small"
        />
      ),
    },
  ];

  const allTemplates = [...PRESET_TEMPLATES, ...savedTemplates];

  const items = [
    {
      key: 'timeRanges',
      label: '时间段配置',
      children: (
        <div className="space-y-4">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Select
                placeholder="选择模板"
                style={{ width: 160 }}
                options={allTemplates.map(t => ({
                  label: t.name + (t.isPreset ? ' (预设)' : ''),
                  value: t.id
                }))}
                onChange={(templateId) => {
                  const template = allTemplates.find(t => t.id === templateId);
                  if (template) {
                    setData(template.timeRanges);
                    message.success('模板加载成功');
                  }
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="保存为新模板"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                style={{ width: 160 }}
                size="small"
              />
              <Button
                size="small"
                icon={<SaveOutlined />}
                onClick={handleSaveAsTemplate}
              >
                保存
              </Button>
            </div>
          </div>
          <Table
            columns={timeRangeColumns}
            dataSource={data}
            pagination={false}
            rowKey="timeSlot"
            size="small"
            scroll={{ y: 400 }}
          />
        </div>
      )
    },
    {
      key: 'patientTypes',
      label: '患者类型比例',
      children: (
        <div className="space-y-4 py-2">
          {specialWindowTypes.map(type => (
            <div key={type.id} className="flex items-center gap-4">
              <div className="w-24 text-sm">{type.label}</div>
              <InputNumber
                min={0}
                max={100}
                value={patientTypes.find(t => t.specialTypeId === type.id)?.ratio ?? 0}
                onChange={(value) => handlePatientTypeRatioChange(type.id, value)}
                className="w-24"
                size="small"
                addonAfter="%"
              />
            </div>
          ))}
          <div className="text-xs text-gray-500 mt-2 space-y-1">
            <div>注：</div>
            <div>1. 比例表示该类型患者在总患者中的占比</div>
            <div>2. 特殊类型之和必须小于等于100%，普通类型的百分比为1-特殊类型之和</div>
          </div>
        </div>
      )
    },
    {
      key: 'templates',
      label: '模板管理',
      children: (
        <div className="space-y-4">
          <div className="text-sm text-gray-500 mb-4">
            在这里可以管理已保存的模板，预设模板不可删除。
          </div>
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <div className="grid grid-cols-12 text-sm text-gray-500">
                <div className="col-span-4">模板名称</div>
                <div className="col-span-6">说明</div>
                <div className="col-span-2">操作</div>
              </div>
            </div>
            <div className="divide-y">
              {PRESET_TEMPLATES.map(template => (
                <div key={template.id} className="px-4 py-2 bg-gray-50">
                  <div className="grid grid-cols-12 items-center">
                    <div className="col-span-4 font-medium">{template.name}</div>
                    <div className="col-span-6 text-sm text-gray-500">预设模板</div>
                    <div className="col-span-2">
                      <Button type="text" size="small" disabled>
                        不可删除
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {savedTemplates.map(template => (
                <div key={template.id} className="px-4 py-2 hover:bg-gray-50">
                  <div className="grid grid-cols-12 items-center">
                    <div className="col-span-4 font-medium">{template.name}</div>
                    <div className="col-span-6 text-sm text-gray-500">自定义模板</div>
                    <div className="col-span-2">
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {savedTemplates.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-500">
                  暂无自定义模板
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <Modal
      title="客流人数配置"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button 
          key="save" 
          type="primary" 
          icon={<SaveOutlined />}
          onClick={() => {
            onSave(data, patientTypes);
            onClose();
          }}
        >
          保存
        </Button>
      ]}
    >
      <Tabs items={items} />
    </Modal>
  );
} 