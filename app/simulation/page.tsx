'use client';

import { useState } from 'react';
import { Layout } from 'antd';
import LabConfig from '../components/LabConfig';
import RightPanel from '../components/RightPanel';
import MonitoringPoints from '../components/MonitoringPoints';
import Image from 'next/image';

const { Content } = Layout;

export default function SimulationPage() {
  const [configValue, setConfigValue] = useState(1000);

  return (
    <Layout className="min-h-screen h-screen">
      <Layout className="h-full">
        <Content className="relative h-full">
          <div className="absolute inset-0">
            <Image
              src="/hospital-layout.jpg"
              alt="Hospital Layout"
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </div>
          <div className="relative z-10 p-6 flex gap-4 h-full">
            <div className="flex-1 min-h-[600px] relative">
              <MonitoringPoints />
            </div>
            <div className="w-[300px]">
              <RightPanel />
            </div>
          </div>
          <div className="fixed left-4 top-4 z-50">
            <LabConfig 
              speed={configValue}
              onSpeedChange={setConfigValue}
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
} 