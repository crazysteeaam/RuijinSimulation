'use client';

import { useState, useEffect } from 'react';
import { Layout, Button, Modal } from 'antd';
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
  // 假设大等候区人数由此维护，实际可替换为真实数据来源
  const [waitingPatients, setWaitingPatients] = useState(248);
  const [alertVisible, setAlertVisible] = useState(true); // 默认弹出
  const [alertClosed, setAlertClosed] = useState(false);
  // const WAITING_THRESHOLD = 100; // 不再需要

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

  // 移除useEffect判断，直接用alertVisible控制
  // useEffect(() => {
  //   if (waitingPatients > WAITING_THRESHOLD && !alertVisible && !alertClosed) {
  //     setAlertVisible(true);
  //   }
  //   if (waitingPatients <= WAITING_THRESHOLD) {
  //     setAlertClosed(false); // 人数降下去后允许再次弹窗
  //   }
  // }, [waitingPatients, alertVisible, alertClosed]);

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
      {/* 报警弹窗 */}
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
            <div className="text-gray-500 text-sm">⏰ [08:35:12]</div>
          </div>
          
          {/* 主要报警信息 */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-gray-800 mb-3">
              当前大等候区内等候人数为 <span className="text-red-600 font-bold text-lg">{waitingPatients}人</span>，
              已超出预警阈值（200人），请及时关注并疏导。
            </div>
            
            {/* 患者分类统计 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">● 常规体检患者：</span>
                <span className="font-semibold">152 人</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">● 老年体检患者：</span>
                <span className="font-semibold">36 人</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">● 单项复查患者：</span>
                <span className="font-semibold">22 人</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">● VIP 高端体检患者：</span>
                <span className="font-semibold">15 人</span>
              </div>
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
              {/* waitingPatients 传递给 RightPanel 或 DataCards，实际业务可替换 */}
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