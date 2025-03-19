import GlobalConfig, { GlobalConfigProps } from './GlobalConfig';
import FlowConfigPanel from './FlowConfigPanel';

export default function ElevatorConfig(props: GlobalConfigProps) {
  return (
    <div className="w-80">
      <GlobalConfig {...props} className="mb-4" />
      <FlowConfigPanel type="elevator" />
    </div>
  );
} 