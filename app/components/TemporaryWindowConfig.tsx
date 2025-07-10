import { Button, Card, message } from 'antd';
import { PlusOutlined, DeleteOutlined, EnvironmentOutlined } from '@ant-design/icons';

export interface TemporaryWindow {
  id: string;
  name: string;
  x: number | null;
  y: number | null;
  active: boolean;
  rotation?: number; // 新增旋转角度，单位度，0/90/180/270
  config?: {
    processTime: number;
    timeRanges: Array<{ start: string; end: string }>;
    specialTypeId?: string;
  };
}

interface TemporaryWindowConfigProps {
  windows: TemporaryWindow[];
  onWindowsChange: (windows: TemporaryWindow[]) => void;
  onSetPosition?: (windowId: string) => void;
  onRotateWindow?: (windowId: string, rotation: number) => void; // 新增旋转回调
}

export default function TemporaryWindowConfig({ 
  windows,
  onWindowsChange, 
  onSetPosition,
  onRotateWindow
}: TemporaryWindowConfigProps) {
  const handleAddWindow = () => {
    if (windows.length >= 5) {
      message.error('最多可添加5个临时窗口');
      return;
    }

    // 找到当前最大的窗口编号
    const maxNumber = windows.reduce((max, window) => {
      const num = parseInt(window.id.replace('check', ''));
      return num > max ? num : max;
    }, 10);  // 从10开始，因为1-10是固定窗口

    const newWindow: TemporaryWindow = {
      id: `check${maxNumber + 1}`,
      name: `检验窗${maxNumber + 1}`,
      x: null,
      y: null,
      active: true,
      config: {
        processTime: 200,
        timeRanges: [
          { start: '07:30', end: '12:30' },
          { start: '13:30', end: '17:00' }
        ]
      }
    };

    onWindowsChange([...windows, newWindow]);
  };

  const handleDeleteWindow = (windowId: string) => {
    onWindowsChange(windows.filter(w => w.id !== windowId));
    message.success('临时窗口已删除');
  };

  const handleSetPosition = (windowId: string) => {
    if (onSetPosition) {
      onSetPosition(windowId);
    }
  };

  // 旋转窗口
  const handleRotateWindow = (windowId: string) => {
    const win = windows.find(w => w.id === windowId);
    if (!win) return;
    const newRotation = ((win.rotation || 0) + 90) % 360;
    if (onRotateWindow) {
      onRotateWindow(windowId, newRotation);
    } else {
      // 内部直接修改
      onWindowsChange(windows.map(w => w.id === windowId ? { ...w, rotation: newRotation } : w));
    }
    message.success('已旋转90°');
  };

  // 监听键盘R旋转
  // 这里只做提示，实际场景设置时建议在场景组件监听

  return (
    <Card size="small" className="mb-4 min-w-[280px]">
      <div className="flex flex-col gap-2">
        <Button
          type="text"
          icon={<PlusOutlined />}
          onClick={handleAddWindow}
          className="text-left"
        >
          新增临时窗口
        </Button>
        {/* 移除快捷键提示 */}
        {windows.length > 0 && (
          <div className="mt-2">
            <div className="text-sm text-gray-500 mb-1">已添加窗口：</div>
            <div className="space-y-2">
              {windows.map(window => (
                <div key={window.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-[120px]">
                    <div className="truncate">{window.name}</div>
                    <div className="text-xs text-gray-400">
                      {window.x !== null ? '已设置位置' : '(未设置位置)'}
                      {typeof window.rotation === 'number' && window.x !== null && (
                        <span className="ml-2 text-blue-500">旋转: {window.rotation}°</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      type="link"
                      size="small"
                      icon={<EnvironmentOutlined />}
                      onClick={() => handleSetPosition(window.id)}
                    >
                      {window.x === null ? '设置位置' : '重新设置'}
                    </Button>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => handleRotateWindow(window.id)}
                    >
                      旋转90°
                    </Button>
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteWindow(window.id)}
                      style={{ marginLeft: 0 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 