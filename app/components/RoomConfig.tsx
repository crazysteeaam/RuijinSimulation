import { useState } from 'react';
import { Modal, Form, Input, Button, InputNumber, Select, Radio, RadioChangeEvent } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

interface TimeRange {
  start: string;
  end: string;
}

interface SpecialWindowType {
  id: string;
  type: string;
  label: string;
}

interface RoomConfigProps {
  visible: boolean;
  onClose: () => void;
  onSave: (config: {
    processTime: number;
    timeRanges: TimeRange[];
    specialTypeId?: string;
  }) => void;
  roomName: string;
  specialWindowTypes: SpecialWindowType[];
  initialConfig?: {
    processTime: number;
    timeRanges: TimeRange[];
    specialTypeId?: string;
  };
}

export default function RoomConfig({
  visible,
  onClose,
  onSave,
  roomName,
  specialWindowTypes,
  initialConfig = {
    processTime: 200,
    timeRanges: [
      { start: '07:30', end: '12:30' },
      { start: '13:30', end: '17:00' },
    ],
    specialTypeId: undefined,
  },
}: RoomConfigProps) {
  const [form] = Form.useForm();
  const [timeRanges, setTimeRanges] = useState<TimeRange[]>(initialConfig.timeRanges);
  const [isSpecialWindow, setIsSpecialWindow] = useState(!!initialConfig.specialTypeId);

  const handleAddTimeRange = () => {
    setTimeRanges([...timeRanges, { start: '08:00', end: '12:00' }]);
  };

  const handleRemoveTimeRange = (index: number) => {
    setTimeRanges(timeRanges.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      onSave({
        ...values,
        timeRanges,
        specialTypeId: isSpecialWindow ? values.specialTypeId : undefined,
      });
      onClose();
    } catch {
      // 表单验证错误
    }
  };

  const handleTimeChange = (index: number, type: 'start' | 'end', value: string) => {
    const newRanges = [...timeRanges];
    newRanges[index] = {
      ...newRanges[index],
      [type]: value,
    };
    setTimeRanges(newRanges);
  };

  const handleWindowTypeChange = (e: RadioChangeEvent) => {
    const isSpecial = e.target.value === 'special';
    setIsSpecialWindow(isSpecial);
    if (!isSpecial) {
      form.setFieldValue('specialTypeId', undefined);
    }
  };

  return (
    <Modal
      title={`${roomName}参数配置`}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="reset" onClick={() => {
          form.resetFields();
          setTimeRanges(initialConfig.timeRanges);
          setIsSpecialWindow(!!initialConfig.specialTypeId);
        }}>
          重置
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          保存
        </Button>,
      ]}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          processTime: initialConfig.processTime,
          specialTypeId: initialConfig.specialTypeId,
          windowType: initialConfig.specialTypeId ? 'special' : 'normal',
        }}
      >
        <Form.Item
          name="windowType"
          label="窗口类型"
        >
          <Radio.Group onChange={handleWindowTypeChange}>
            <Radio value="normal">普通窗口</Radio>
            <Radio value="special">特殊窗口</Radio>
          </Radio.Group>
        </Form.Item>

        {isSpecialWindow && (
          <Form.Item
            name="specialTypeId"
            label="特殊窗口类型"
            rules={[{ required: true, message: '请选择特殊窗口类型' }]}
          >
            <Select
              placeholder="请选择特殊窗口类型"
              options={specialWindowTypes.map(type => ({
                label: type.label,
                value: type.id,
              }))}
            />
          </Form.Item>
        )}

        <Form.Item
          name="processTime"
          label="处理时间"
          rules={[{ required: true, message: '请输入处理时间' }]}
        >
          <InputNumber
            min={1}
            max={3600}
            addonAfter="秒"
            className="w-full"
            placeholder="请输入处理时间（秒）"
          />
        </Form.Item>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium">开设时间</div>
            <Button
              type="link"
              icon={<PlusOutlined />}
              onClick={handleAddTimeRange}
              disabled={timeRanges.length >= 3}
            >
              新增时间段
            </Button>
          </div>
          
          <div className="space-y-3">
            {timeRanges.map((range, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={range.start}
                  onChange={(e) => handleTimeChange(index, 'start', e.target.value)}
                  placeholder="开始时间"
                  className="w-28"
                  maxLength={5}
                />
                <span>-</span>
                <Input
                  value={range.end}
                  onChange={(e) => handleTimeChange(index, 'end', e.target.value)}
                  placeholder="结束时间"
                  className="w-28"
                  maxLength={5}
                />
                {timeRanges.length > 1 && (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveTimeRange(index)}
                  />
                )}
              </div>
            ))}
          </div>
          {timeRanges.length >= 3 && (
            <div className="text-gray-400 text-sm mt-2">
              最多可添加3个时间段
            </div>
          )}
        </div>

        <div className="text-gray-500 text-sm">
          <div>说明：</div>
          <div>1. 处理时间范围为1-3600秒</div>
          <div>2. 时间格式为 HH:mm，如 09:30</div>
          <div>3. 每个时间段不能重叠</div>
          <div>4. 默认为普通窗口，如需设置特殊窗口类型请选择&quot;特殊窗口&quot;</div>
        </div>
      </Form>
    </Modal>
  );
} 