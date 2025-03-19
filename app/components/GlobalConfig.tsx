import { useState, useEffect } from 'react';
import { Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import SpeedConfig from './SpeedConfig';

export interface GlobalConfigProps {
  speed: number;
  onSpeedChange: (value: number) => void;
  className?: string;
}

export default function GlobalConfig({ speed, onSpeedChange, className }: GlobalConfigProps) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState('08:00:00');

  // 模拟更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(prev => {
        const [hours, minutes, seconds] = prev.split(':').map(Number);
        let newSeconds = seconds + 1;
        let newMinutes = minutes;
        let newHours = hours;

        if (newSeconds >= 60) {
          newSeconds = 0;
          newMinutes += 1;
        }
        if (newMinutes >= 60) {
          newMinutes = 0;
          newHours += 1;
        }
        if (newHours >= 24) {
          newHours = 0;
        }

        return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}:${String(newSeconds).padStart(2, '0')}`;
      });
    }, 1000 / (speed || 1));

    return () => clearInterval(timer);
  }, [speed]);

  const handleExit = () => {
    router.push('/');
  };

  return (
    <div className={className}>
      <div className="mb-4">
        <SpeedConfig
          speed={speed}
          currentTime={currentTime}
          onSpeedChange={onSpeedChange}
        />
      </div>

      <div className="fixed left-4 bottom-4">
        <Button
          type="text"
          icon={<LogoutOutlined />}
          onClick={handleExit}
          className="text-left"
        >
          退出仿真
        </Button>
      </div>
    </div>
  );
} 