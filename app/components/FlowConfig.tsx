import { useState, useEffect } from 'react';
import { Modal, Table, InputNumber, Tabs, Button, Input, Select, message, TimePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SaveOutlined, DeleteOutlined, UploadOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import { SpecialWindowType } from '../types/config';
import { timeRangesToExcel, excelToTimeRanges, downloadExcel } from '../utils/excelUtils';
import dayjs from 'dayjs';

export interface TimeRange {
  timeSlot: string;
  meanArrivals: number;
  stdDeviation: number;
}

interface TimeDistribution {
  startTime: string;
  endTime: string;
  percentage: number;
}

interface PatientType {
  specialTypeId: string;
  timeDistributions: TimeDistribution[];
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

interface QuickInputModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (value: number) => void;
  title: string;
  max: number;
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

const QuickInputModal: React.FC<QuickInputModalProps> = ({
  visible,
  onClose,
  onApply,
  title,
  max
}) => {
  const [value, setValue] = useState<number | null>(null);

  return (
    <Modal
      title={`快捷设置${title}`}
      open={visible}
      onCancel={onClose}
      onOk={() => {
        if (value !== null) {
          onApply(value);
          onClose();
          setValue(null);
        }
      }}
      okText="应用"
      cancelText="取消"
    >
      <InputNumber
        min={0}
        max={max}
        value={value}
        onChange={setValue}
        className="w-full"
        placeholder={`请输入${title}（0-${max}）`}
      />
    </Modal>
  );
};

export default function FlowConfig({ visible, onClose, onSave, initialData, specialWindowTypes }: FlowConfigProps) {
  const [data, setData] = useState<TimeRange[]>(initialData);
  const [patientTypes, setPatientTypes] = useState<PatientType[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [savedTemplates, setSavedTemplates] = useState<FlowTemplate[]>([]);
  const [quickInputVisible, setQuickInputVisible] = useState(false);
  const [quickInputType, setQuickInputType] = useState<'mean' | 'std' | null>(null);

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

  const handleAddTimeDistribution = (specialTypeId: string) => {
    const newTypes = [...patientTypes];
    const typeIndex = newTypes.findIndex(t => t.specialTypeId === specialTypeId);
    
    if (typeIndex === -1) {
      newTypes.push({
        specialTypeId,
        timeDistributions: [{
          startTime: '07:00',
          endTime: '21:00',
          percentage: 100
        }]
      });
    } else {
      const currentDistributions = newTypes[typeIndex].timeDistributions;
      newTypes[typeIndex].timeDistributions = [...currentDistributions, {
        startTime: '07:00',
        endTime: '21:00',
        percentage: 0
      }];
    }
    
    setPatientTypes(newTypes);
  };

  const handleTimeDistributionChange = (
    specialTypeId: string,
    index: number,
    field: keyof TimeDistribution,
    value: string | number | null
  ) => {
    const newTypes = [...patientTypes];
    const typeIndex = newTypes.findIndex(t => t.specialTypeId === specialTypeId);
    
    if (typeIndex === -1) return;
    
    const distributions = [...newTypes[typeIndex].timeDistributions];
    
    if (field === 'percentage') {
      if (value === null) return;
      
      // Calculate total percentage excluding current distribution
      const otherSum = distributions.reduce((sum, dist, i) => 
        i !== index ? sum + dist.percentage : sum, 
        0
      );
      
      if (otherSum + (value as number) > 100) {
        message.error('时间段分布总和不能超过100%');
        return;
      }
    }
    
    distributions[index] = {
      ...distributions[index],
      [field]: value
    };
    
    newTypes[typeIndex].timeDistributions = distributions;
    setPatientTypes(newTypes);
  };

  const handleRemoveTimeDistribution = (specialTypeId: string, index: number) => {
    const newTypes = [...patientTypes];
    const typeIndex = newTypes.findIndex(t => t.specialTypeId === specialTypeId);
    
    if (typeIndex === -1) return;
    
    const distributions = [...newTypes[typeIndex].timeDistributions];
    distributions.splice(index, 1);
    
    newTypes[typeIndex].timeDistributions = distributions;
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

  const handleExportExcel = () => {
    const workbook = timeRangesToExcel(data);
    const filename = `时间段客流配置_${new Date().toLocaleDateString()}.xlsx`;
    try {
      downloadExcel(workbook, filename);
      message.success('导出成功');
    } catch (error: unknown) {
      message.error('导出失败');
      console.error('Export failed:', error);
    }
  };

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const timeRanges = await excelToTimeRanges(file);
      setData(timeRanges);
      message.success('导入成功');
    } catch (err) {
      message.error(err instanceof Error ? err.message : '导入失败');
    }

    // Clear the input value so the same file can be selected again
    event.target.value = '';
  };

  const handleQuickInput = (type: 'mean' | 'std') => {
    setQuickInputType(type);
    setQuickInputVisible(true);
  };

  const handleQuickInputApply = (value: number) => {
    if (quickInputType === null) return;
    
    const newData = data.map(item => ({
      ...item,
      [quickInputType === 'mean' ? 'meanArrivals' : 'stdDeviation']: value
    }));
    setData(newData);
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
      title: (
        <div className="flex items-center justify-between">
          <span>到达人数平均数</span>
          <Button
            type="text"
            icon={<PlusOutlined />}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleQuickInput('mean');
            }}
          />
        </div>
      ),
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
      title: (
        <div className="flex items-center justify-between">
          <span>到达人数标准差</span>
          <Button
            type="text"
            icon={<PlusOutlined />}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleQuickInput('std');
            }}
          />
        </div>
      ),
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
              <Button
                icon={<UploadOutlined />}
                onClick={() => document.getElementById('importExcel')?.click()}
              >
                导入Excel
              </Button>
              <input
                type="file"
                id="importExcel"
                accept=".xlsx,.xls"
                onChange={handleImportExcel}
                style={{ display: 'none' }}
              />
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExportExcel}
              >
                导出Excel
              </Button>
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
        <div className="space-y-4">
          <div className="text-sm text-gray-500 mb-4">
            设置各特殊类型患者在不同时间段的分布比例，每个类型的时间段分布总和不能超过100%，剩余为普通患者。
          </div>
          <div className="space-y-6">
            {specialWindowTypes.map(type => {
              const typeConfig = patientTypes.find(t => t.specialTypeId === type.id) || {
                specialTypeId: type.id,
                timeDistributions: []
              };
              return (
                <div key={type.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: type.color }}
                    />
                    <span className="text-lg font-medium">{type.name}</span>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-end mb-4">
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={() => handleAddTimeDistribution(type.id)}
                      >
                        添加时间段
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {typeConfig.timeDistributions.map((dist, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <TimePicker
                            format="HH:mm"
                            value={dayjs(dist.startTime, 'HH:mm')}
                            onChange={(time) => handleTimeDistributionChange(
                              type.id,
                              index,
                              'startTime',
                              time?.format('HH:mm') || '07:00'
                            )}
                          />
                          <span>至</span>
                          <TimePicker
                            format="HH:mm"
                            value={dayjs(dist.endTime, 'HH:mm')}
                            onChange={(time) => handleTimeDistributionChange(
                              type.id,
                              index,
                              'endTime',
                              time?.format('HH:mm') || '21:00'
                            )}
                          />
              <InputNumber
                min={0}
                max={100}
                            value={dist.percentage}
                            onChange={(value) => handleTimeDistributionChange(
                              type.id,
                              index,
                              'percentage',
                              value
                            )}
                addonAfter="%"
              />
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveTimeDistribution(type.id, index)}
                          />
            </div>
          ))}
                    </div>
                  </div>
                </div>
              );
            })}
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
              {allTemplates.map(template => (
                <div key={template.id} className={`px-4 py-2 ${template.isPreset ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                  <div className="grid grid-cols-12 items-center">
                    <div className="col-span-4 font-medium">{template.name}</div>
                    <div className="col-span-6 text-sm text-gray-500">
                      {template.isPreset ? '预设模板' : '自定义模板'}
                    </div>
                    <div className="col-span-2">
                      {template.isPreset ? (
                      <Button type="text" size="small" disabled>
                        不可删除
                      </Button>
                      ) : (
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        删除
                      </Button>
                      )}
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
    <>
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

      <QuickInputModal
        visible={quickInputVisible}
        onClose={() => {
          setQuickInputVisible(false);
          setQuickInputType(null);
        }}
        onApply={handleQuickInputApply}
        title={quickInputType === 'mean' ? '到达人数平均数' : '到达人数标准差'}
        max={quickInputType === 'mean' ? 200 : 50}
      />
    </>
  );
} 