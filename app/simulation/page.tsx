'use client';

import { useState, useEffect } from 'react';
import { Layout, Button } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import LabConfig from '../components/LabConfig';
import RightPanel from '../components/RightPanel';
import MonitoringPoints from '../components/MonitoringPoints';
import Image from 'next/image';
import { SpecialWindowType } from '../types/config';
import { TemporaryWindow } from '../components/TemporaryWindowConfig';
import { useRouter } from 'next/navigation';

const { Content } = Layout;

interface WindowConfig {
  id: string;
  name: string;
  specialTypeId?: string;
  processTime: number;
  timeRanges: Array<{ start: string; end: string }>;
}

export default function SimulationPage() {
  const router = useRouter();
  const [speed, setSpeed] = useState(1);
  const [specialWindowTypes, setSpecialWindowTypes] = useState<SpecialWindowType[]>([
    { id: 'vip', name: 'VIP窗口', color: '#f5222d' },
    { id: 'elderly', name: '老年人窗口', color: '#52c41a' },
    { id: 'emergency', name: '急诊窗口', color: '#faad14' },
  ]);
  const [windowConfigs, setWindowConfigs] = useState<WindowConfig[]>([]);
  const [temporaryWindows, setTemporaryWindows] = useState<TemporaryWindow[]>([]);
  const [positioningMode, setPositioningMode] = useState(false);
  const [selectedWindow, setSelectedWindow] = useState<string | null>(null);

  // 从localStorage加载临时窗口数据
  useEffect(() => {
    const savedWindows = localStorage.getItem('temporaryWindows');
    if (savedWindows) {
      try {
        setTemporaryWindows(JSON.parse(savedWindows));
      } catch (e) {
        console.error('Failed to load temporary windows:', e);
      }
    }
  }, []);

  // 保存临时窗口数据到localStorage
  useEffect(() => {
    localStorage.setItem('temporaryWindows', JSON.stringify(temporaryWindows));
  }, [temporaryWindows]);

  const handleWindowConfigChange = (windowId: string, config: WindowConfig | undefined) => {
    if (!config) {
      setWindowConfigs(prev => prev.filter(c => c.id !== windowId));
      return;
    }

    setWindowConfigs(prev => {
      const existing = prev.find(c => c.id === windowId);
      if (existing) {
        return prev.map(c => c.id === windowId ? config : c);
      }
      return [...prev, config];
    });
  };

  const handleTemporaryWindowsChange = (windows: TemporaryWindow[]) => {
    setTemporaryWindows(windows);
  };

  const handleSetPosition = (windowId: string) => {
    setPositioningMode(true);
    setSelectedWindow(windowId);
  };

  const handleTemporaryWindowPositionChange = (windowId: string, x: number, y: number) => {
    setTemporaryWindows(prev => 
      prev.map(w => 
        w.id === windowId 
          ? { ...w, x, y }
          : w
      )
    );
    setPositioningMode(false);
    setSelectedWindow(null);
  };

  const handleSpecialWindowTypesChange = (types: SpecialWindowType[]) => {
    // 找出被删除的特殊窗口类型
    const deletedTypeIds = specialWindowTypes
      .filter(oldType => !types.find(newType => newType.id === oldType.id))
      .map(type => type.id);

    // 如果有类型被删除，更新使用这些类型的窗口配置
    if (deletedTypeIds.length > 0) {
      setWindowConfigs(prev => prev.map(config => {
        if (config.specialTypeId && deletedTypeIds.includes(config.specialTypeId)) {
          // 移除特殊类型配置，转为普通窗口
          const { specialTypeId, ...rest } = config;
          return rest;
        }
        return config;
      }));

      // 更新临时窗口的配置
      setTemporaryWindows(prev => prev.map(window => {
        if (window.config?.specialTypeId && deletedTypeIds.includes(window.config.specialTypeId)) {
          // 移除特殊类型配置，转为普通窗口
          return {
            ...window,
            config: {
              ...window.config,
              specialTypeId: undefined
            }
          };
        }
        return window;
      }));
    }

    setSpecialWindowTypes(types);
  };

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
              <MonitoringPoints 
                specialWindowTypes={specialWindowTypes}
                onWindowConfigChange={handleWindowConfigChange}
                temporaryWindows={temporaryWindows}
                onTemporaryWindowPositionChange={handleTemporaryWindowPositionChange}
                positioningMode={positioningMode}
                selectedWindow={selectedWindow}
              />
            </div>
            <div className="w-[300px]">
              <RightPanel />
            </div>
          </div>
          <div className="fixed left-4 top-4 z-50">
            <LabConfig 
              speed={speed}
              onSpeedChange={setSpeed}
              onSpecialWindowTypesChange={handleSpecialWindowTypesChange}
              windows={windowConfigs}
              temporaryWindows={temporaryWindows}
              onTemporaryWindowsChange={handleTemporaryWindowsChange}
              onSetPosition={handleSetPosition}
            />
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
        </Content>
      </Layout>
    </Layout>
  );
} 