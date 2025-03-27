import { Card, InputNumber, Typography } from 'antd';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import dayjs from 'dayjs';

const { Text } = Typography;

interface GlobalConfigProps {
  speed: number;
  onSpeedChange: Dispatch<SetStateAction<number>>;
  className?: string;
}

export default function GlobalConfig({
  speed,
  onSpeedChange,
  className
}: GlobalConfigProps) {
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card size="small" className={className}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Text>仿真速度：</Text>
          <InputNumber
            min={1}
            max={100}
            value={speed}
            onChange={value => onSpeedChange(value || 1)}
            addonAfter="倍"
          />
        </div>
        <div className="flex items-center gap-2">
          <Text>当前时间：</Text>
          <Text>{currentTime.format('HH:mm:ss')}</Text>
        </div>
      </div>
    </Card>
  );
} 