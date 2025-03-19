import { useState } from 'react';
import { Card, Statistic, Typography } from 'antd';
import { Column } from '@ant-design/plots';
import type { Plot } from '@ant-design/plots';
import InspectionUtilizationDetail from './InspectionUtilizationDetail';

const { Title } = Typography;

interface InspectionStatsProps {
  currentCapacity: number;
  waitingCount: number;
  utilizationData: {
    station: string;
    utilization: number;
  }[];
  averageWaitTime: string;
}

export default function InspectionStats({
  currentCapacity,
  waitingCount,
  utilizationData,
  averageWaitTime,
}: InspectionStatsProps) {
  const [utilizationDetailVisible, setUtilizationDetailVisible] = useState(false);

  const config = {
    data: utilizationData,
    xField: 'station',
    yField: 'utilization',
    color: ({ utilization }: { utilization: number }) => {
      return utilization > 85 ? '#ff4d4f' : '#52c41a';
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
          <Title level={5} className="text-[#666] mb-4">各工作站利用率</Title>
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
      </div>

      <InspectionUtilizationDetail
        visible={utilizationDetailVisible}
        onClose={() => setUtilizationDetailVisible(false)}
      />
    </>
  );
} 