import { useState } from 'react';
import { Button, Card } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import GlobalConfig, { GlobalConfigProps } from './GlobalConfig';
import SpecialWindowConfig from './SpecialWindowConfig';
import FlowConfigPanel from './FlowConfigPanel';
import { SpecialWindowType } from '../types/config';

export default function LabConfig(props: GlobalConfigProps) {
  const [specialWindowConfigVisible, setSpecialWindowConfigVisible] = useState(false);
  const [specialWindowTypes, setSpecialWindowTypes] = useState<SpecialWindowType[]>([]);

  const handleSpecialWindowSave = (types: SpecialWindowType[]) => {
    setSpecialWindowTypes(types);
  };

  return (
    <div className="fixed left-4 top-4 w-80">
      <GlobalConfig {...props} className="mb-4" />
      
      <Card size="small" className="mb-4">
        <div className="flex flex-col gap-2">
          <Button
            type="text"
            icon={<SettingOutlined />}
            onClick={() => setSpecialWindowConfigVisible(true)}
            className="text-left"
          >
            窗口类型配置
          </Button>
        </div>
      </Card>

      <FlowConfigPanel 
        specialWindowTypes={specialWindowTypes}
      />

      <SpecialWindowConfig
        visible={specialWindowConfigVisible}
        onClose={() => setSpecialWindowConfigVisible(false)}
        onSave={handleSpecialWindowSave}
        initialTypes={specialWindowTypes}
      />
    </div>
  );
} 