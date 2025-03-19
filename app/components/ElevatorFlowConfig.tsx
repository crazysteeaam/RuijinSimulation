import { useState } from 'react';
import { Modal, Input, Button, Table, Tabs, message, Select } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { TabsProps } from 'antd';

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

const DEFAULT_FLOW_DATA: FloorFlow[] = Array.from({ length: 22 }, (_, i) => ({
  floor: `${i + 1}楼`,
  morningOut: 210,
  morningIn: 24,
  afternoonOut: 231,
  afternoonIn: 244,
}));

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

  const columns = [
    {
      title: '楼层',
      dataIndex: 'floor',
      key: 'floor',
      width: 80,
      fixed: 'left' as const,
    },
    {
      title: '上午出发',
      dataIndex: 'morningOut',
      key: 'morningOut',
      width: 100,
      render: (text: number, record: FloorFlow) => (
        <Input
          type="number"
          value={text}
          onChange={(e) => handleFlowDataChange(record.floor, 'morningOut', parseInt(e.target.value) || 0)}
        />
      ),
    },
    {
      title: '上午到达',
      dataIndex: 'morningIn',
      key: 'morningIn',
      width: 100,
      render: (text: number, record: FloorFlow) => (
        <Input
          type="number"
          value={text}
          onChange={(e) => handleFlowDataChange(record.floor, 'morningIn', parseInt(e.target.value) || 0)}
        />
      ),
    },
    {
      title: '下午出发',
      dataIndex: 'afternoonOut',
      key: 'afternoonOut',
      width: 100,
      render: (text: number, record: FloorFlow) => (
        <Input
          type="number"
          value={text}
          onChange={(e) => handleFlowDataChange(record.floor, 'afternoonOut', parseInt(e.target.value) || 0)}
        />
      ),
    },
    {
      title: '下午到达',
      dataIndex: 'afternoonIn',
      key: 'afternoonIn',
      width: 100,
      render: (text: number, record: FloorFlow) => (
        <Input
          type="number"
          value={text}
          onChange={(e) => handleFlowDataChange(record.floor, 'afternoonIn', parseInt(e.target.value) || 0)}
        />
      ),
    },
  ];

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

  const items: TabsProps['items'] = [
    {
      key: 'config',
      label: '楼层客流配置',
      children: (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <Select
                placeholder="选择模板"
                style={{ width: 200 }}
                onChange={handleApplyTemplate}
                options={templates.map(t => ({
                  label: t.isPreset ? `${t.name}（预设）` : t.name,
                  value: t.id,
                }))}
              />
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
    <Modal
      title="楼层客流配置（人数）"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
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