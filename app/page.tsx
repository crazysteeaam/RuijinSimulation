'use client';

import { Typography } from 'antd';
import SimulationCard from './components/SimulationCard';

const { Title } = Typography;

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Title className="text-center mb-8">瑞金医院仿真推演系统</Title>
        <div className="text-center text-gray-500 mb-12">
          本仿真系统的一句话介绍，如需要更多说明可写一句。
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <SimulationCard
            title="门诊检验科仿真"
            description="模拟门诊检验科的工作流程，包括患者到达、分诊、检验等环节。"
            image="/images/hospital-layout.jpg"
            href="/simulation"
          />
          <SimulationCard
            title="电梯运行仿真"
            description="模拟医院电梯运行情况，包括乘客等待、电梯调度等过程。"
            image="/images/elevator-layout.jpg"
            href="/elevator"
          />
        </div>
      </div>
    </div>
  );
}
