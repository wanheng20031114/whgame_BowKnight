/**
 * PixiJS 战斗网格系统 - 主入口
 * 
 * 文件结构：
 * - types.ts      类型定义
 * - config.ts     配置常量
 * - entity.ts     实体（单位）管理
 * - grid.ts       网格系统
 * - interaction.ts 交互处理
 * - ui.ts         UI 组件
 * - main.ts       主入口（本文件）
 */

import { Application, Container } from 'pixi.js';
import './style.css';

import { APP_CONFIG, GRID_CONFIG } from './config';
import { grid, initGrid } from './grid';
import { createUnit, addEntityToCell, preloadAssets } from './entity';
import { bindCellEvents } from './interaction';
import { createTitle, createStatusText, createTipText, createLegend } from './ui';

// ============================================
// 应用实例
// ============================================
const app = new Application();

// ============================================
// 主程序
// ============================================
async function init() {
  // 初始化 PixiJS 应用
  await app.init(APP_CONFIG);
  document.getElementById('app')!.appendChild(app.canvas);

  // 禁用右键菜单
  app.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  // 预加载图片资源
  await preloadAssets();

  // 创建 UI
  const title = createTitle('战斗网格系统', 640, 15);
  app.stage.addChild(title);

  const tipText = createTipText('中键点击空格生成单位 | 左键选中 | 右键移动/攻击', 640, 50);
  app.stage.addChild(tipText);

  const statusText = createStatusText(640, 80);
  app.stage.addChild(statusText);

  const legend = createLegend(900, 150);
  app.stage.addChild(legend);

  // 创建网格容器
  const gridContainer = new Container();
  gridContainer.position.set(GRID_CONFIG.offsetX, GRID_CONFIG.offsetY);
  app.stage.addChild(gridContainer);

  // 初始化网格
  initGrid(gridContainer);

  // 绑定所有格子的事件
  for (const row of grid) {
    for (const cell of row) {
      bindCellEvents(cell, statusText);
    }
  }

  // 预生成一些单位（现在是异步的）
  await addEntityToCell(grid[1][1], createUnit('士兵', 'player'));
  await addEntityToCell(grid[2][2], createUnit('弓箭手', 'player'));
  await addEntityToCell(grid[1][5], createUnit('士兵', 'enemy'));
  await addEntityToCell(grid[3][6], createUnit('坦克', 'enemy'));

  console.log('✅ 战斗网格系统初始化完成');
  console.log('📂 代码已模块化，查看 src/ 目录');
  console.log('🖼️ 弓箭手将使用图片显示（如果 public/archer.png 存在）');

  // 暴露到全局（调试用）
  (window as any).grid = grid;
  (window as any).app = app;
}

// 启动
init().catch(console.error);
