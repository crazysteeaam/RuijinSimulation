'use client';

import { useState } from 'react';
import { Layout, Radio, Card, Button } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import ElevatorConfig from '../components/ElevatorConfig';
import ElevatorPoints from '../components/ElevatorPoints';
import ElevatorStats from '../components/ElevatorStats';
import { useRouter } from 'next/navigation';

const { Content } = Layout;

// 模拟电梯利用率数据
const mockUtilizationData = [
  { elevator: '10号电梯', utilization: 100 },
  { elevator: '11号电梯', utilization: 65 },
  { elevator: '12号电梯', utilization: 45 },
  { elevator: '13号电梯', utilization: 75 },
];

export default function ElevatorPage() {
  const router = useRouter();
  const [configValue, setConfigValue] = useState(1000);
  const [modelType, setModelType] = useState<'real' | 'single' | 'building'>('real');

  return (
    <Layout className="h-screen overflow-hidden">
      <Content className="relative h-full">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/elevator-layout.jpg)' }}
        />
        <div className="relative h-full flex flex-col">
          <div className="flex-1 flex">
            <div className="flex-1 relative">
              <div className="fixed left-4 top-4 z-50">
                <ElevatorConfig 
                  speed={configValue}
                  onSpeedChange={setConfigValue}
                />
              </div>
              <ElevatorPoints modelType={modelType} />
            </div>
            <div className="w-[400px] h-full overflow-auto bg-transparent">
              <ElevatorStats
                currentCapacity={220}
                waitingCount={15}
                utilizationData={mockUtilizationData}
                averageWaitTime="00:02:00"
              />
            </div>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <Card className="shadow-lg border-none">
              <div className="flex flex-col items-center space-y-2">
                <Radio.Group
                  value={modelType}
                  onChange={(e) => setModelType(e.target.value)}
                  size="large"
                  className="flex-wrap justify-center"
                  buttonStyle="solid"
                >
                  <Radio.Button value="real">真实排布</Radio.Button>
                  <Radio.Button value="single">单一方向</Radio.Button>
                  <Radio.Button value="building">真实楼栋</Radio.Button>
                </Radio.Group>
              </div>
            </Card>
          </div>
          <div className="fixed left-4 bottom-4 z-50">
            <Button 
              type="primary"
              icon={<HomeOutlined />}
              onClick={() => router.push('/')}
              size="large"
            >
              退出仿真
            </Button>
          </div>
        </div>
      </Content>
    </Layout>
  );
} 