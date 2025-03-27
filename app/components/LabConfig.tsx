import { useState } from 'react';
import { Button, Card } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import GlobalConfig from './GlobalConfig';
import SpecialWindowConfig from './SpecialWindowConfig';
import FlowConfigPanel from './FlowConfigPanel';
import ActiveSpecialWindowList from './ActiveSpecialWindowList';
import TemporaryWindowConfig, { TemporaryWindow } from './TemporaryWindowConfig';
import { SpecialWindowType, WindowConfig } from '../types/config';
import { Dispatch, SetStateAction } from 'react';

interface LabConfigProps {
  speed: number;
  onSpeedChange: Dispatch<SetStateAction<number>>;
  onSpecialWindowTypesChange: (types: SpecialWindowType[]) => void;
  windows: WindowConfig[];
  temporaryWindows: TemporaryWindow[];
  onTemporaryWindowsChange: (windows: TemporaryWindow[]) => void;
  onSetPosition?: (windowId: string) => void;
  className?: string;
}

export default function LabConfig(props: LabConfigProps) {
  const [specialWindowConfigVisible, setSpecialWindowConfigVisible] = useState(false);
  const [specialWindowTypes, setSpecialWindowTypes] = useState<SpecialWindowType[]>([]);

  const handleSpecialWindowSave = (types: SpecialWindowType[]) => {
    setSpecialWindowTypes(types);
    props.onSpecialWindowTypesChange(types);
  };

  const handleTemporaryWindowsChange = (windows: TemporaryWindow[]) => {
    props.onTemporaryWindowsChange(windows);
  };

  return (
    <div className="fixed left-4 top-4 w-80">
      <GlobalConfig 
        speed={props.speed}
        onSpeedChange={props.onSpeedChange}
        className="mb-4"
      />
      
      <Card size="small" className="mb-4">
        <div className="flex flex-col gap-2">
          <Button
            type="text"
            icon={<SettingOutlined />}
            onClick={() => setSpecialWindowConfigVisible(true)}
            className="text-left"
          >
            特殊窗口类型配置
          </Button>
        </div>
      </Card>

      <Card size="small" className="mb-4">
        <ActiveSpecialWindowList
          specialWindowTypes={specialWindowTypes}
          windows={props.windows}
        />
      </Card>

      <TemporaryWindowConfig 
        windows={props.temporaryWindows}
        onWindowsChange={handleTemporaryWindowsChange}
        onSetPosition={props.onSetPosition}
      />

      <FlowConfigPanel specialWindowTypes={specialWindowTypes} />

      <SpecialWindowConfig
        visible={specialWindowConfigVisible}
        onClose={() => setSpecialWindowConfigVisible(false)}
        onSave={handleSpecialWindowSave}
        initialTypes={specialWindowTypes}
      />
    </div>
  );
} 