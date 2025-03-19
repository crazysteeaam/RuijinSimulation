import { useState } from 'react';
import { Card, InputNumber, Button } from 'antd';
import SpecialWindowConfig from './SpecialWindowConfig';
import { SpecialWindowType } from '../types/config';

interface ConfigPanelProps {
  value: number;
  onChange: (value: number) => void;
}

export default function ConfigPanel({ value, onChange }: ConfigPanelProps) {
  const [specialWindowVisible, setSpecialWindowVisible] = useState(false);
  const [specialWindowTypes, setSpecialWindowTypes] = useState<SpecialWindowType[]>([]);

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
  };

  const handleSpecialWindowSave = (types: SpecialWindowType[]) => {
    setSpecialWindowTypes(types);
  };

  return (
    <>
      <Card title="门诊场景推演全局配置" className="w-full" style={cardStyle}>
        <div className="space-y-4">
          <div>
            <div className="mb-2">推演速度</div>
            <InputNumber
              value={value}
              onChange={(val) => onChange(val || 1000)}
              className="w-full"
            />
          </div>
          <div>
            <div className="mb-2">特殊窗口类型</div>
            <Button 
              type="default" 
              block 
              className="rounded-full"
              onClick={() => setSpecialWindowVisible(true)}
            >
              配置窗口类型
            </Button>
            {specialWindowTypes.length > 0 && (
              <div className="mt-2 space-y-1">
                {specialWindowTypes.map(type => (
                  <div key={type.id} className="text-sm text-gray-500">
                    • {type.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      <SpecialWindowConfig
        visible={specialWindowVisible}
        onClose={() => setSpecialWindowVisible(false)}
        onSave={handleSpecialWindowSave}
        initialTypes={specialWindowTypes}
      />
    </>
  );
} 