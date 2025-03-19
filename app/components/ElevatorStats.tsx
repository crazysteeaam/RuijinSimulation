import { useState } from 'react';
import { Card, Statistic, Typography, Button } from 'antd';
import { Column } from '@ant-design/plots';
import type { Plot } from '@ant-design/plots';
import { HistoryOutlined } from '@ant-design/icons';
import SimHistory from './SimulationHistory';
import ElevatorUtilizationDetail from './ElevatorUtilizationDetail';

const { Title } = Typography;

interface ElevatorStatsProps {
  currentCapacity: number;
  waitingCount: number;
  utilizationData: {
    elevator: string;
    utilization: number;
  }[];
  averageWaitTime: string;
}

interface DataRecord {
  elevator: string;
  utilization: number;
}

export default function ElevatorStats({
  currentCapacity,
  waitingCount,
  utilizationData,
  averageWaitTime,
}: ElevatorStatsProps) {
  const [historyVisible, setHistoryVisible] = useState(false);
  const [utilizationDetailVisible, setUtilizationDetailVisible] = useState(false);

  const config = {
    data: utilizationData,
    xField: 'elevator',
    yField: 'utilization',
    color: ({ elevator }: DataRecord) => {
      return elevator === '10号电梯' ? '#ff4d4f' : '#52c41a';
    },
    columnStyle: {
      radius: [4, 4, 0, 0],
      cursor: 'pointer',
    },
    label: {
      position: 'top',
      style: {
        fill: '#666',
        fontSize: 12,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
        style: {
          fill: '#666',
          fontSize: 12,
        },
      },
      line: {
        style: {
          stroke: '#f0f0f0',
        },
      },
    },
    yAxis: {
      max: 100,
      label: {
        formatter: (v: string) => `${v}%`,
        style: {
          fill: '#666',
          fontSize: 12,
        },
      },
      grid: {
        line: {
          style: {
            stroke: '#f0f0f0',
            lineDash: [4, 4],
          },
        },
      },
    },
    meta: {
      utilization: {
        alias: '利用率',
      },
    },
    onReady: (plot: Plot) => {
      plot.on('element:click', () => {
        setUtilizationDetailVisible(true);
      });
    },
  };

  const cardStyle = {
    background: '#fff',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    border: 'none',
  };

  return (
    <>
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-4">
          <Card style={cardStyle}>
            <Statistic
              title={<span className="text-[#666]">实时容量</span>}
              value={currentCapacity}
              suffix="人"
              valueStyle={{ color: '#262626', fontSize: 28 }}
            />
          </Card>
          <Card style={cardStyle}>
            <Statistic
              title={<span className="text-[#666]">当前等待人数</span>}
              value={waitingCount}
              suffix="人"
              valueStyle={{ color: '#262626', fontSize: 28 }}
            />
          </Card>
        </div>

        <Card style={cardStyle}>
          <Title level={5} className="text-[#666] mb-4">各电梯利用率</Title>
          <div className="cursor-pointer" onClick={() => setUtilizationDetailVisible(true)}>
            <Column {...config} height={200} />
          </div>
        </Card>

        <Card style={cardStyle}>
          <Statistic
            title={<span className="text-[#666]">患者平均等待时长</span>}
            value={averageWaitTime}
            valueStyle={{ color: '#262626', fontSize: 28 }}
          />
        </Card>

        <Button
          type="primary"
          size="large"
          icon={<HistoryOutlined />}
          className="w-full shadow-lg"
          onClick={() => setHistoryVisible(true)}
        >
          查看历史仿真记录
        </Button>
      </div>

      <SimHistory
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
        onReplay={(record) => console.log('Replay:', record)}
        onExport={(record) => console.log('Export:', record)}
        onDelete={(record) => console.log('Delete:', record)}
        onApplyConfig={(record) => console.log('Apply Config:', record)}
        onUpdateNote={(record, note) => console.log('Update Note:', record, note)}
      />

      <ElevatorUtilizationDetail
        visible={utilizationDetailVisible}
        onClose={() => setUtilizationDetailVisible(false)}
      />
    </>
  );
} 