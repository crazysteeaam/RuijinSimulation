import { useState } from 'react';
import { Modal, Form, Input, Button, Tag, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { SpecialWindowType } from '../types/config';

interface SpecialWindowConfigProps {
  visible: boolean;
  onClose: () => void;
  onSave: (types: SpecialWindowType[]) => void;
  initialTypes?: SpecialWindowType[];
}

const presetTypes = [
  { label: '老年人专窗', value: 'elderly' },
  { label: '项目专窗', value: 'project' },
  { label: '急诊专窗', value: 'emergency' },
  { label: 'VIP专窗', value: 'vip' },
  { label: '慢病专窗', value: 'chronic' },
];

export default function SpecialWindowConfig({
  visible,
  onClose,
  onSave,
  initialTypes = [],
}: SpecialWindowConfigProps) {
  const [form] = Form.useForm();
  const [types, setTypes] = useState<SpecialWindowType[]>(initialTypes);

  const handleAddCustom = async () => {
    try {
      const values = await form.validateFields();
      if (types.length >= 5) {
        Modal.error({ title: '提示', content: '最多只能添加5个特殊窗口类型' });
        return;
      }

      const newType: SpecialWindowType = {
        id: Date.now().toString(),
        name: values.customType,
        color: '#1890ff'
      };

      // 检查是否已存在
      if (types.some(t => t.name === newType.name)) {
        Modal.error({ title: '提示', content: '该窗口类型已存在' });
        return;
      }

      setTypes([...types, newType]);
      form.resetFields();
    } catch {
      // 表单验证错误
    }
  };

  const handleAddPreset = (preset: typeof presetTypes[0]) => {
    if (types.length >= 5) {
      Modal.error({ title: '提示', content: '最多只能添加5个特殊窗口类型' });
      return;
    }

    if (types.some(t => t.name === preset.label)) {
      Modal.error({ title: '提示', content: '该窗口类型已存在' });
      return;
    }

    const newType: SpecialWindowType = {
      id: Date.now().toString(),
      name: preset.label,
      color: '#1890ff'
    };

    setTypes([...types, newType]);
  };

  const handleDelete = (id: string) => {
    setTypes(types.filter(t => t.id !== id));
  };

  const handleSave = () => {
    onSave(types);
    onClose();
  };

  return (
    <Modal
      title="特殊窗口类型配置"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>取消</Button>,
        <Button key="save" type="primary" onClick={handleSave}>保存</Button>,
      ]}
      width={500}
    >
      <div className="space-y-6">
        <div>
          <div className="mb-2 font-medium">预设类型：</div>
          <div className="flex flex-wrap gap-2">
            {presetTypes.map(type => (
              <Button
                key={type.value}
                size="small"
                onClick={() => handleAddPreset(type)}
                disabled={types.some(t => t.name === type.label)}
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>

        <Form form={form} layout="vertical">
          <Form.Item
            label="自定义类型："
            name="customType"
            rules={[
              { required: true, message: '请输入窗口类型名称' },
              { max: 10, message: '类型名称不能超过10个字符' }
            ]}
          >
            <Input.Search
              placeholder="请输入窗口类型名称"
              enterButton="添加"
              onSearch={handleAddCustom}
              maxLength={10}
            />
          </Form.Item>
        </Form>

        <div className="border-t pt-4">
          <div className="font-medium mb-2">已激活窗口类型：</div>
          <div className="space-y-2">
            {types.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded"
              >
                <Tag color="blue">{item.name}</Tag>
                <Popconfirm
                  title="确定要删除这个窗口类型吗？"
                  onConfirm={() => handleDelete(item.id)}
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
} 