import { useState } from 'react';
import DataCards from './DataCards';
import SimulationHistory, { SimulationRecord } from './SimulationHistory';
import { message } from 'antd';

export default function RightPanel() {
  const [historyVisible, setHistoryVisible] = useState(false);

  // 模拟数据
  const [stats] = useState({
    totalPatients: 124,
    waitingPatients: 26,
    avgWaitingTime: '00:23:45',
    utilizationData: [
      { name: '普通窗口1', value: 85 },
      { name: '普通窗口2', value: 75 },
      { name: '普通窗口3', value: 65 },
      { name: '急诊窗口', value: 90 },
      { name: '老年人窗口', value: 70 }
    ]
  });

  const handleApplyConfig = (record: SimulationRecord) => {
    message.info(`应用配置：${record.templateName || '未命名配置'}`);
    setHistoryVisible(false);
  };

  const handleExport = (record: SimulationRecord) => {
    message.success(`导出仿真报告：${record.templateName || '未命名配置'}`);
  };

  const handleDelete = (record: SimulationRecord) => {
    message.success(`删除仿真记录：${record.templateName || '未命名配置'}`);
  };

  const handleUpdateNote = (record: SimulationRecord, note: string) => {
    message.success(`备注已更新：${note}`);
    // 这里可以添加实际的备注更新逻辑
  };

  return (
    <div className="fixed right-4 top-4 w-80">
      <DataCards 
        {...stats}
        onViewHistory={() => setHistoryVisible(true)}
      />

      <SimulationHistory
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
        onExport={handleExport}
        onDelete={handleDelete}
        onApplyConfig={handleApplyConfig}
        onUpdateNote={handleUpdateNote}
      />
    </div>
  );
} 