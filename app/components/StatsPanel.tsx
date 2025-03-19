import { Card } from 'antd';
import { Line } from '@ant-design/charts';

export default function StatsPanel() {
  const data = [
    { time: '08:00', value: 3 },
    { time: '09:00', value: 4 },
    { time: '10:00', value: 6.5 },
    { time: '11:00', value: 5 },
    { time: '12:00', value: 4.9 },
    { time: '13:00', value: 6 },
    { time: '14:00', value: 7 },
    { time: '15:00', value: 9 },
    { time: '16:00', value: 8 },
    { time: '17:00', value: 6 },
  ];

  const config = {
    data,
    height: 200,
    xField: 'time',
    yField: 'value',
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
  };

  return (
    <div className="space-y-4">
      <Card size="small" title="总处理人数" style={cardStyle}>
        <div className="text-2xl font-bold">128</div>
      </Card>
      
      <Card size="small" title="当前等待人数" style={cardStyle}>
        <div className="text-2xl font-bold">15</div>
      </Card>

      <Card title="各窗口小时利用率" style={cardStyle}>
        <Line {...config} />
      </Card>

      <Card title="患者平均等待时长" style={cardStyle}>
        <div className="text-center py-4">
          <div className="text-3xl font-bold">12.5</div>
          <div className="text-gray-500">分钟</div>
        </div>
      </Card>

      <div className="text-center">
        <button className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors">
          运行仿真后可查看
        </button>
      </div>
    </div>
  );
} 