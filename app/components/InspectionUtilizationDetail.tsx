import { Modal, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Line } from '@ant-design/plots';

interface InspectionUtilizationDetailProps {
  visible: boolean;
  onClose: () => void;
}

interface UtilizationRecord {
  time: string;
  station: string;
  utilization: number;
}

// 模拟数据生成函数
const generateMockData = (): UtilizationRecord[] => {
  const stations = ['1号工作站', '2号工作站', '3号工作站', '4号工作站', '5号工作站'];
  const data: UtilizationRecord[] = [];
  
  for (let hour = 8; hour <= 17; hour++) {
    for (const minute of [0, 30]) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const nextTimeStr = minute === 0 
        ? `${hour.toString().padStart(2, '0')}:30`
        : `${(hour + 1).toString().padStart(2, '0')}:00`;
      const timeRange = `${timeStr}-${nextTimeStr}`;
      
      stations.forEach(station => {
        // 为1号工作站生成较高的利用率
        const baseUtilization = station === '1号工作站' ? 90 : 65;
        const randomVariation = Math.random() * 20 - 10; // -10 到 10 之间的随机值
        data.push({
          time: timeRange,
          station,
          utilization: Math.min(100, Math.max(0, baseUtilization + randomVariation))
        });
      });
    }
  }
  
  return data;
};

export default function InspectionUtilizationDetail({
  visible,
  onClose
}: InspectionUtilizationDetailProps) {
  const mockData = generateMockData();

  const columns: ColumnsType<UtilizationRecord> = [
    {
      title: '时间段',
      dataIndex: 'time',
      key: 'time',
      width: 120,
    },
    {
      title: '工作站',
      dataIndex: 'station',
      key: 'station',
      width: 100,
    },
    {
      title: '利用率',
      dataIndex: 'utilization',
      key: 'utilization',
      width: 120,
      render: (utilization: number) => {
        const color = utilization > 85 ? 'red' : utilization > 70 ? 'orange' : 'green';
        return <Tag color={color}>{utilization.toFixed(1)}%</Tag>;
      },
      sorter: (a, b) => a.utilization - b.utilization,
    },
  ];

  const lineConfig = {
    data: mockData,
    xField: 'time',
    yField: 'utilization',
    seriesField: 'station',
    yAxis: {
      max: 100,
      label: {
        formatter: (v: string) => `${v}%`,
      },
    },
    legend: {
      position: 'top',
    },
    smooth: true,
    animation: {
      appear: {
        animation: 'wave-in',
        duration: 1000,
      },
    },
  };

  return (
    <Modal
      title="工作站利用率详情"
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={null}
    >
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">利用率趋势</h3>
          <Line {...lineConfig} height={300} />
        </div>
        
        <div className="bg-white rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">详细数据</h3>
          <Table
            dataSource={mockData}
            columns={columns}
            rowKey={(record) => `${record.time}-${record.station}`}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
          />
        </div>
      </div>
    </Modal>
  );
} 