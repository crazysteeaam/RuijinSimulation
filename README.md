## 项目结构说明

项目采用 Next.js 框架，主要目录结构如下：

### 主要目录

- `app/` - 主应用目录
  - `components/` - 可复用组件目录
  - `elevator/` - 电梯相关页面
  - `simulation/` - 仿真相关页面
  - `types/` - TypeScript 类型定义
  - `page.tsx` - 主页面
  - `layout.tsx` - 全局布局
  - `globals.css` - 全局样式

### 组件说明

配置相关组件：
- `ConfigPanel.tsx` - 配置面板主组件
- `GlobalConfig.tsx` - 全局配置组件
- `RoomConfig.tsx` - 房间配置组件
- `LabConfig.tsx` - 实验室配置组件
- `FlowConfig.tsx` - 流程配置主组件
- `FlowConfigPanel.tsx` - 流程配置面板
- `SpeedConfig.tsx` - 速度配置组件

电梯相关组件：
- `ElevatorConfig.tsx` - 电梯配置主组件
- `ElevatorFlowConfig.tsx` - 电梯流程配置
- `ElevatorPoints.tsx` - 电梯监测点配置
- `ElevatorScheduleConfig.tsx` - 电梯调度配置
- `ElevatorStats.tsx` - 电梯统计信息
- `ElevatorUtilizationDetail.tsx` - 电梯利用率详情

监测与统计组件：
- `MonitoringPoints.tsx` - 监测点配置
- `DataCards.tsx` - 数据卡片展示
- `InspectionStats.tsx` - 检查统计
- `InspectionUtilizationDetail.tsx` - 检查利用率详情
- `StatsPanel.tsx` - 统计面板
- `SimulationHistory.tsx` - 仿真历史记录

特殊配置组件：
- `SpecialWindowConfig.tsx` - 特殊窗口配置
- `RightPanel.tsx` - 右侧面板
- `SimulationCard.tsx` - 仿真卡片组件

### 其他目录

- `public/` - 静态资源目录
- `docs/` - 项目文档
- `.next/` - Next.js 构建输出
- `node_modules/` - 项目依赖

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.