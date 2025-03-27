import { Modal, Table, Button, Space, Tooltip, Input, Tag } from 'antd';
import { ExportOutlined, DeleteOutlined, SettingOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';

export interface SimulationRecord {
  id: string;
  date: string;
  note?: string;
  templateName?: string;
  duration: string;
  totalPatients: number;
  avgWaitingTime: string;
}

export interface SimulationHistoryProps {
  visible: boolean;
  onClose: () => void;
  onExport: (record: SimulationRecord) => void;
  onDelete: (record: SimulationRecord) => void;
  onApplyConfig: (record: SimulationRecord) => void;
  onUpdateNote: (record: SimulationRecord, note: string) => void;
}

export default function SimulationHistory({
  visible,
  onClose,
  onExport,
  onDelete,
  onApplyConfig,
  onUpdateNote
}: SimulationHistoryProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState('');

  // 模拟数据
  const mockData: SimulationRecord[] = [
    {
      id: '1',
      date: '2024/11/13 13:23:11',
      duration: '02:30:00',
      totalPatients: 245,
      avgWaitingTime: '00:15:30'
    },
    {
      id: '2',
      date: '2024/11/13 13:23:11',
      templateName: '早高峰配置',
      duration: '03:00:00',
      totalPatients: 320,
      avgWaitingTime: '00:35:20'
    },
    {
      id: '3',
      date: '2024/11/13 13:23:11',
      note: '下午测试配置',
      duration: '01:45:00',
      totalPatients: 180,
      avgWaitingTime: '00:20:15'
    }
  ];

  const handleStartEdit = (record: SimulationRecord) => {
    setEditingId(record.id);
    setEditingNote(record.note || '');
  };

  const handleSaveNote = (record: SimulationRecord) => {
    onUpdateNote(record, editingNote);
    setEditingId(null);
  };

  // 根据等待时间返回对应的标签颜色
  const getWaitingTimeColor = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    
    if (totalMinutes <= 15) return 'success';
    if (totalMinutes <= 30) return 'warning';
    return 'error';
  };

  const columns: ColumnsType<SimulationRecord> = [
    {
      title: '结束时间',
      dataIndex: 'date',
      key: 'date',
      width: 180
    },
    {
      title: '备注',
      key: 'noteOrTemplate',
      width: 200,
      render: (_: unknown, record: SimulationRecord) => (
        <div className="flex items-center gap-2">
          {editingId === record.id ? (
            <Space>
              <Input
                value={editingNote}
                onChange={(e) => setEditingNote(e.target.value)}
                onPressEnter={() => handleSaveNote(record)}
                autoFocus
              />
              <Button
                type="text"
                size="small"
                onClick={() => handleSaveNote(record)}
              >
                保存
              </Button>
              <Button
                type="text"
                size="small"
                onClick={() => setEditingId(null)}
              >
                取消
              </Button>
            </Space>
          ) : (
            <>
              <span>{record.note || record.templateName || '-'}</span>
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleStartEdit(record)}
              />
            </>
          )}
        </div>
      )
    },
    {
      title: '总处理人数',
      dataIndex: 'totalPatients',
      key: 'totalPatients',
      width: 120,
      render: (value: number) => `${value}人`
    },
    {
      title: '平均等待',
      dataIndex: 'avgWaitingTime',
      key: 'avgWaitingTime',
      width: 120,
      render: (time: string) => (
        <Tag color={getWaitingTimeColor(time)}>{time}</Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, record: SimulationRecord) => (
        <Space size="small">
          <Tooltip title="应用配置">
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => onApplyConfig(record)}
            >
              应用配置
            </Button>
          </Tooltip>
          <Tooltip title="导出报告">
            <Button
              type="text"
              icon={<ExportOutlined />}
              onClick={() => onExport(record)}
            >
              下载结果
            </Button>
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <Modal
      title="历史仿真记录"
      open={visible}
      onCancel={onClose}
      width={900}
      footer={null}
    >
      <Table
        dataSource={mockData}
        columns={columns}
        rowKey="id"
        pagination={false}
      />
    </Modal>
  );
} 