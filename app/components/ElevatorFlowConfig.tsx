import { useState } from 'react';
import { Modal, Input, Button, Table, Tabs, message, Select, InputNumber } from 'antd';
import { DeleteOutlined, UploadOutlined, DownloadOutlined, PlusOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import type { TabsProps } from 'antd';
import { floorFlowToExcel, excelToFloorFlow, downloadExcel } from '../utils/excelUtils';

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

interface QuickInputModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (value: number) => void;
  title: string;
  max: number;
}

const DEFAULT_FLOW_DATA: FloorFlow[] = Array.from({ length: 22 }, (_, i) => ({
  floor: `${i + 1}楼`,
  morningOut: 210,
  morningIn: 24,
  afternoonOut: 231,
  afternoonIn: 244,
}));

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

interface ElevatorFlowConfigProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: FloorFlow[]) => void;
  initialData?: FloorFlow[];
  templates: FlowTemplate[];
  onSaveTemplate: (template: FlowTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

export default function ElevatorFlowConfig({
  visible,
  onClose,
  onSave,
  initialData = DEFAULT_FLOW_DATA,
  templates,
  onSaveTemplate,
  onDeleteTemplate,
}: ElevatorFlowConfigProps) {
  const [activeTab, setActiveTab] = useState('config');
  const [flowData, setFlowData] = useState<FloorFlow[]>(initialData);
  const [templateName, setTemplateName] = useState('');
  const [quickInputVisible, setQuickInputVisible] = useState(false);
  const [quickInputType, setQuickInputType] = useState<'morningOut' | 'morningIn' | 'afternoonOut' | 'afternoonIn' | null>(null);
  const [isImported, setIsImported] = useState(false);

  const handleQuickInput = (type: 'morningOut' | 'morningIn' | 'afternoonOut' | 'afternoonIn') => {
    setQuickInputType(type);
    setQuickInputVisible(true);
  };

  const handleQuickInputApply = (value: number) => {
    if (quickInputType === null) return;
    
    const newData = flowData.map(item => ({
      ...item,
      [quickInputType]: value
    }));
    setFlowData(newData);
  };

  const handleFlowDataChange = (floor: string, field: keyof FloorFlow, value: number) => {
    setFlowData(prev => prev.map(item => 
      item.floor === floor ? { ...item, [field]: value } : item
    ));
  };

  const handleApplyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFlowData(template.data);
      message.success('模板应用成功');
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template?.isPreset) {
      message.error('预设模板不能删除');
      return;
    }
    onDeleteTemplate(templateId);
    message.success('模板删除成功');
  };

  const handleExportExcel = () => {
    const workbook = floorFlowToExcel(flowData);
    const filename = `楼层客流配置_${new Date().toLocaleDateString()}.xlsx`;
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
      const floorFlows = await excelToFloorFlow(file);
      setFlowData(floorFlows);
      setIsImported(true);
      message.success('导入成功');
    } catch (err) {
      message.error(err instanceof Error ? err.message : '导入失败');
    }

    // Clear the input value so the same file can be selected again
    event.target.value = '';
  };

  const handleReset = () => {
    setIsImported(false);
    setFlowData(initialData);
    message.success('已重置');
  };

  const handlePreviewExcel = () => {
    const workbook = floorFlowToExcel(flowData);
    const filename = `楼层客流配置_${new Date().toLocaleDateString()}.xlsx`;
    try {
      downloadExcel(workbook, filename);
      message.success('预览Excel已下载');
    } catch (error: unknown) {
      message.error('预览失败');
      console.error('Preview failed:', error);
    }
  };

  // columns定义移到render前，确保每次渲染都能感知isImported
  const columns = [
    {
      title: '楼层',
      dataIndex: 'floor',
      key: 'floor',
      width: 80,
      fixed: 'left' as const,
    },
    {
      title: (
        <div className="flex items-center justify-between">
          <span>上午出发</span>
          {!isImported && (
            <Button
              type="text"
              icon={<PlusOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickInput('morningOut');
              }}
            />
          )}
        </div>
      ),
      dataIndex: 'morningOut',
      key: 'morningOut',
      width: 100,
      render: (text: number, record: FloorFlow) => (
        isImported ? (
          <div className="text-gray-500">{text}</div>
        ) : (
          <InputNumber
            min={0}
            max={500}
            value={text}
            onChange={(value) => handleFlowDataChange(record.floor, 'morningOut', value || 0)}
            className="w-24"
            size="small"
          />
        )
      ),
    },
    {
      title: (
        <div className="flex items-center justify-between">
          <span>上午到达</span>
          {!isImported && (
            <Button
              type="text"
              icon={<PlusOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickInput('morningIn');
              }}
            />
          )}
        </div>
      ),
      dataIndex: 'morningIn',
      key: 'morningIn',
      width: 100,
      render: (text: number, record: FloorFlow) => (
        isImported ? (
          <div className="text-gray-500">{text}</div>
        ) : (
          <InputNumber
            min={0}
            max={500}
            value={text}
            onChange={(value) => handleFlowDataChange(record.floor, 'morningIn', value || 0)}
            className="w-24"
            size="small"
          />
        )
      ),
    },
    {
      title: (
        <div className="flex items-center justify-between">
          <span>下午出发</span>
          {!isImported && (
            <Button
              type="text"
              icon={<PlusOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickInput('afternoonOut');
              }}
            />
          )}
        </div>
      ),
      dataIndex: 'afternoonOut',
      key: 'afternoonOut',
      width: 100,
      render: (text: number, record: FloorFlow) => (
        isImported ? (
          <div className="text-gray-500">{text}</div>
        ) : (
          <InputNumber
            min={0}
            max={500}
            value={text}
            onChange={(value) => handleFlowDataChange(record.floor, 'afternoonOut', value || 0)}
            className="w-24"
            size="small"
          />
        )
      ),
    },
    {
      title: (
        <div className="flex items-center justify-between">
          <span>下午到达</span>
          {!isImported && (
            <Button
              type="text"
              icon={<PlusOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickInput('afternoonIn');
              }}
            />
          )}
        </div>
      ),
      dataIndex: 'afternoonIn',
      key: 'afternoonIn',
      width: 100,
      render: (text: number, record: FloorFlow) => (
        isImported ? (
          <div className="text-gray-500">{text}</div>
        ) : (
          <InputNumber
            min={0}
            max={500}
            value={text}
            onChange={(value) => handleFlowDataChange(record.floor, 'afternoonIn', value || 0)}
            className="w-24"
            size="small"
          />
        )
      ),
    },
  ];

  const items: TabsProps['items'] = [
    {
      key: 'config',
      label: '楼层客流配置',
      children: (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              {!isImported && (
                <>
                  <Select
                    placeholder="选择模板"
                    style={{ width: 200 }}
                    onChange={handleApplyTemplate}
                    options={templates.map(t => ({
                      label: t.isPreset ? `${t.name}（预设）` : t.name,
                      value: t.id,
                    }))}
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
                  <Input
                    placeholder="新模板名称"
                    value={templateName}
                    onChange={e => setTemplateName(e.target.value)}
                    style={{ width: 150 }}
                  />
                  <Button
                    type="primary"
                    onClick={() => {
                      if (!templateName) {
                        message.error('请输入模板名称');
                        return;
                      }
                      const newTemplate: FlowTemplate = {
                        id: Date.now().toString(),
                        name: templateName,
                        data: flowData,
                        isPreset: false,
                      };
                      onSaveTemplate(newTemplate);
                      setTemplateName('');
                      message.success('模板保存成功');
                    }}
                  >
                    保存为模板
                  </Button>
                </>
              )}
              {isImported && (
                <div className="text-green-600 font-medium">已导入</div>
              )}
            </div>
          </div>
          <div className="max-h-[600px] overflow-auto">
            <Table
              columns={columns}
              dataSource={flowData}
              pagination={false}
              rowKey="floor"
              size="small"
              scroll={{ x: 'max-content', y: 500 }}
            />
          </div>
        </div>
      ),
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
              {templates.map(template => (
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
              {templates.filter(t => !t.isPreset).length === 0 && (
                <div className="px-4 py-8 text-center text-gray-500">
                  暂无自定义模板
                </div>
              )}
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
    <Modal
      title="楼层客流配置（人数）"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={
        isImported ? [
          <Button
            key="preview"
            icon={<EyeOutlined />}
            onClick={handlePreviewExcel}
          >
            预览Excel
          </Button>,
          <Button
            key="reset"
            icon={<ReloadOutlined />}
            onClick={handleReset}
          >
            重置
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={() => {
              onSave(flowData);
              onClose();
            }}
          >
            保存
          </Button>,
        ] : [
          <Button key="cancel" onClick={onClose}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              onSave(flowData);
              onClose();
            }}
          >
            保存
          </Button>,
        ]
      }
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
      />
    </Modal>

      <QuickInputModal
        visible={quickInputVisible}
        onClose={() => {
          setQuickInputVisible(false);
          setQuickInputType(null);
        }}
        onApply={handleQuickInputApply}
        title={
          quickInputType === 'morningOut' ? '上午出发人数' :
          quickInputType === 'morningIn' ? '上午到达人数' :
          quickInputType === 'afternoonOut' ? '下午出发人数' :
          '下午到达人数'
        }
        max={500}
      />
    </>
  );
} 