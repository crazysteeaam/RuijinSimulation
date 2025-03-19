import { Card, InputNumber, Typography } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface SpeedConfigProps {
  speed: number;
  currentTime: string;
  onSpeedChange: (value: number) => void;
}

export default function SpeedConfig({ speed, currentTime, onSpeedChange }: SpeedConfigProps) {
  return (
    <Card size="small" className="mb-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <ClockCircleOutlined />
          <Text>当前时刻：{currentTime}</Text>
        </div>
        <div className="flex items-center gap-2">
          <Text>推演速度：</Text>
          <InputNumber
            min={1}
            max={10000}
            value={speed}
            onChange={value => onSpeedChange(value || 1000)}
            addonAfter="倍"
            className="w-32"
          />
        </div>
      </div>
    </Card>
  );
} 