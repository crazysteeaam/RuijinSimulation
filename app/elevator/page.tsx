'use client';

import { useState } from 'react';
import { Layout, Radio, Card, Button, Modal } from 'antd';
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
  const [alertVisible, setAlertVisible] = useState(true); // 默认弹出
  const [alertClosed, setAlertClosed] = useState(false);

  return (
    <Layout className="h-screen overflow-hidden">
      {/* 电梯报警弹窗 */}
      <Modal
        open={alertVisible}
        onCancel={() => { setAlertVisible(false); setAlertClosed(true); }}
        footer={null}
        closable
        centered
        maskClosable={false}
        maskStyle={{ background: 'transparent' }}
        width={500}
      >
        <div className="space-y-4">
          {/* 标题和时间 */}
          <div className="flex items-center justify-between">
            <div className="text-red-600 text-lg font-bold">🧾 报警提示内容</div>
            <div className="text-gray-500 text-sm">⏰ [08:46:50]</div>
          </div>
          
          {/* 主要报警信息 */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-gray-800 mb-3">
              电梯厅【3F-东侧B厅】当前等待人数为 <span className="text-red-600 font-bold text-lg">26人</span>，
              已超过安全预警阈值（20人）。
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex justify-end space-x-2">
            <Button 
              type="primary" 
              danger
              size="small"
              onClick={() => { setAlertVisible(false); setAlertClosed(true); }}
            >
              已了解
            </Button>
          </div>
        </div>
      </Modal>
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
              <ElevatorPoints />
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