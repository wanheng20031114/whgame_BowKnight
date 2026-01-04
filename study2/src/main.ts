/**
 * 弓箭手射击游戏 - 主入口
 * 
 * 游戏玩法：
 * - 方向键/WASD 控制玩家移动
 * - Z 键射击，自动瞄准最近的敌人
 * - 僵尸从右侧不断生成，向玩家靠近
 * - 僵尸接触玩家时会造成持续伤害
 * - 玩家生命值归零则游戏结束
 * 
 * 文件结构：
 * - config.ts       游戏配置
 * - Player.ts       玩家类
 * - Enemy.ts        敌人类
 * - Bullet.ts       子弹类
 * - InputManager.ts 输入管理
 * - GameManager.ts  游戏管理
 * - main.ts         入口（本文件）
 */

import { Application } from 'pixi.js';
import { CANVAS_CONFIG } from './config';
import { GameManager } from './GameManager';
import './style.css';

// ============================================
// 主程序
// ============================================
async function main() {
  console.log('🎮 弓箭手射击游戏启动中...');

  // 1. 创建 PixiJS 应用
  const app = new Application();
  await app.init({
    width: CANVAS_CONFIG.width,
    height: CANVAS_CONFIG.height,
    backgroundColor: CANVAS_CONFIG.backgroundColor,
  });

  // 2. 添加画布到页面
  document.getElementById('app')!.appendChild(app.canvas);

  // 3. 创建游戏管理器
  const gameManager = new GameManager(app);
  await gameManager.init();

  // 4. 启动游戏循环
  app.ticker.add((ticker) => {
    gameManager.update(ticker.deltaTime);
  });

  console.log('✅ 游戏启动完成！');
  console.log('📖 操作说明：');
  console.log('   - 方向键/WASD：移动');
  console.log('   - Z：射击（自动瞄准）');
}

// 启动游戏
main().catch(console.error);
