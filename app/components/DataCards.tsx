import { Card } from 'antd';
import { MoreOutlined, HistoryOutlined } from '@ant-design/icons';
import { useState } from 'react';
import InspectionUtilizationDetail from './InspectionUtilizationDetail';

interface DataCardsProps {
  totalPatients: number;
  waitingPatients: number;
  avgWaitingTime: string;
  utilizationData: {
    name: string;
    value: number;
  }[];
  onViewHistory?: () => void;
}

export default function DataCards({ totalPatients, waitingPatients, avgWaitingTime, utilizationData, onViewHistory }: DataCardsProps) {
  const [utilizationDetailVisible, setUtilizationDetailVisible] = useState(false);

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* 顶部数据卡片 */}
      <div className="grid grid-cols-2 gap-4">
        <Card 
          className="bg-white shadow-sm" 
          styles={{ body: { padding: '16px' } }}
          extra={<MoreOutlined className="text-gray-400" />}
        >
          <div>
            <div className="text-gray-500 text-sm mb-2">总处理人数</div>
            <div className="text-4xl font-bold">{totalPatients}</div>
            <div className="text-gray-400 mt-1">人</div>
          </div>
        </Card>
        <Card 
          className="bg-white shadow-sm" 
          styles={{ body: { padding: '16px' } }}
          extra={<MoreOutlined className="text-gray-400" />}
        >
          <div>
            <div className="text-gray-500 text-sm mb-2">当前等待人数</div>
            <div className="text-4xl font-bold">{waitingPatients}</div>
            <div className="text-gray-400 mt-1">人</div>
          </div>
        </Card>
      </div>

      {/* 窗口利用率卡片 */}
      <Card 
        className="bg-white shadow-sm cursor-pointer" 
        styles={{ body: { padding: '16px' } }}
        extra={<MoreOutlined className="text-gray-400" />}
        onClick={() => setUtilizationDetailVisible(true)}
      >
        <div>
          <div className="text-gray-500 text-sm mb-4">各窗口/设备利用率</div>
          <div className="space-y-3">
            {utilizationData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="text-sm text-gray-500 w-24">{item.name}</div>
                <div className="flex-1">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-400" 
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 等待时间卡片 */}
      <Card 
        className="bg-white shadow-sm" 
        styles={{ body: { padding: '16px' } }}
        extra={<MoreOutlined className="text-gray-400" />}
      >
        <div>
          <div className="text-gray-500 text-sm mb-2">患者平均等待时长</div>
          <div className="font-mono text-4xl font-bold">{avgWaitingTime}</div>
        </div>
      </Card>

      {/* 经营管理化建议卡片 */}
      <Card 
        className="bg-white shadow-sm text-center" 
        styles={{ body: { padding: '24px' } }}
      >
        <div className="text-gray-500">经营管理化建议</div>
        <div className="text-gray-400 mt-4">运行仿真后可查看</div>
      </Card>

      {/* 历史仿真记录按钮 */}
      <button
        onClick={onViewHistory}
        className="flex items-center justify-center gap-2 py-3 px-4 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
      >
        <HistoryOutlined className="text-gray-400" />
        <span className="text-gray-500">查看历史仿真记录</span>
      </button>

      <InspectionUtilizationDetail
        visible={utilizationDetailVisible}
        onClose={() => setUtilizationDetailVisible(false)}
      />
    </div>
  );
} 