import { useState } from 'react';
import { Tooltip, Button, Modal, Form, InputNumber } from 'antd';
import { MoreOutlined } from '@ant-design/icons';

interface RegistrationPoint {
  id: string;
  name: string;
  x: number;
  y: number;
  active?: boolean;
  config?: {
    processTime: number;
  };
}

interface RegistrationPointsProps {
  points: RegistrationPoint[];
  onConfigChange?: (pointId: string, config: RegistrationPoint['config']) => void;
}

export default function RegistrationPoints({ points, onConfigChange }: RegistrationPointsProps) {
  const [configVisible, setConfigVisible] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<RegistrationPoint | null>(null);
  const [form] = Form.useForm();

  const handleConfigClick = (point: RegistrationPoint, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPoint(point);
    form.setFieldsValue({
      processTime: point.config?.processTime || 300,
    });
    setConfigVisible(true);
  };

  const handleConfigSave = () => {
    form.validateFields().then((values) => {
      if (selectedPoint && onConfigChange) {
        onConfigChange(selectedPoint.id, {
          processTime: values.processTime,
        });
      }
      setConfigVisible(false);
      setSelectedPoint(null);
    });
  };

  return (
    <>
      {points.map((point) => (
        <Tooltip 
          key={point.id} 
          title={
            <div>
              <div>{point.name}</div>
              {point.config?.processTime && (
                <div className="text-xs mt-1">
                  处理时间：{point.config.processTime}秒
                </div>
              )}
            </div>
          }
        >
          <div
            className={`absolute cursor-pointer flex items-center rounded-full bg-white/90 shadow-lg px-2 py-1 ${
              point.active ? 'border-l-4 border-blue-500' : ''
            }`}
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className={`text-sm ${point.active ? 'text-blue-500' : 'text-gray-500'}`}>
              {point.name}
            </div>
            <Button
              type="text"
              size="small"
              className="flex items-center ml-1 !px-0"
              icon={<MoreOutlined />}
              onClick={(e) => handleConfigClick(point, e)}
            />
          </div>
        </Tooltip>
      ))}

      <Modal
        title={`${selectedPoint?.name} 配置`}
        open={configVisible}
        onOk={handleConfigSave}
        onCancel={() => {
          setConfigVisible(false);
          setSelectedPoint(null);
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="processTime"
            label="处理时间（秒）"
            rules={[{ required: true, message: '请输入处理时间' }]}
          >
            <InputNumber min={1} max={3600} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
} 