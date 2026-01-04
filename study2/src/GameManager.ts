/**
 * 游戏管理器
 * 
 * 负责：
 * - 管理所有游戏对象（玩家、敌人、子弹）
 * - 处理游戏逻辑（生成敌人、碰撞检测、伤害计算）
 * - 协调各个模块
 */

import { Container, Text, Application } from 'pixi.js';
import { Player } from './Player';
import { Enemy } from './Enemy';
import { Bullet } from './Bullet';
import { InputManager } from './InputManager';
import { CANVAS_CONFIG, ENEMY_CONFIG, PLAYER_CONFIG } from './config';

export class GameManager {
    // ==================== 游戏对象 ====================

    private app: Application;           // PixiJS 应用
    private gameContainer: Container;   // 游戏容器
    private player: Player;             // 玩家
    private enemies: Enemy[] = [];      // 敌人列表
    private bullets: Bullet[] = [];     // 子弹列表
    private inputManager: InputManager; // 输入管理器

    // ==================== UI 元素 ====================

    private scoreText: Text;            // 分数显示
    private hpText: Text;               // 生命值显示

    // ==================== 游戏状态 ====================

    private score: number = 0;          // 得分
    private lastSpawnTime: number = 0;  // 上次生成敌人时间
    private isGameOver: boolean = false;// 游戏是否结束

    // ==================== 构造函数 ====================

    constructor(app: Application) {
        this.app = app;
        this.gameContainer = new Container();
        this.app.stage.addChild(this.gameContainer);

        // 初始化输入管理器
        this.inputManager = new InputManager();

        // 创建玩家（位于屏幕左侧中央）
        this.player = new Player(150, CANVAS_CONFIG.height / 2);
        this.gameContainer.addChild(this.player.container);

        // 创建 UI
        this.scoreText = new Text({
            text: '得分: 0',
            style: { fontSize: 24, fill: 0xffffff }
        });
        this.scoreText.position.set(20, 20);
        this.app.stage.addChild(this.scoreText);

        this.hpText = new Text({
            text: `生命: ${this.player.hp}`,
            style: { fontSize: 24, fill: 0x66bb6a }
        });
        this.hpText.position.set(20, 50);
        this.app.stage.addChild(this.hpText);

        // 操作提示
        const tipText = new Text({
            text: '操作: 方向键/WASD 移动 | Z 射击',
            style: { fontSize: 16, fill: 0x888888 }
        });
        tipText.position.set(20, CANVAS_CONFIG.height - 30);
        this.app.stage.addChild(tipText);

        console.log('✅ 游戏管理器初始化完成');
    }

    // ==================== 初始化 ====================

    /**
     * 异步初始化（加载资源等）
     */
    async init(): Promise<void> {
        await this.player.loadSprite();
        console.log('✅ 游戏资源加载完成');
    }

    // ==================== 游戏循环 ====================

    /**
     * 每帧更新（由 Ticker 调用）
     * @param deltaTime 帧间隔时间
     */
    update(_deltaTime: number): void {
        if (this.isGameOver) return;

        // 1. 处理玩家输入
        this.handleInput();

        // 2. 更新子弹
        this.updateBullets();

        // 3. 更新敌人
        this.updateEnemies();

        // 4. 生成新敌人
        this.spawnEnemies();

        // 5. 检测碰撞
        this.checkCollisions();

        // 6. 清理死亡对象
        this.cleanup();

        // 7. 更新 UI
        this.updateUI();
    }

    // ==================== 输入处理 ====================

    private handleInput(): void {
        // 移动
        const { dx, dy } = this.inputManager.getDirection();
        this.player.move(dx, dy);

        // 射击
        if (this.inputManager.isAttacking() && this.player.canFire()) {
            this.fireBullet();
        }
    }

    // ==================== 射击 ====================

    /**
     * 发射子弹，自动瞄准最近的敌人
     */
    private fireBullet(): void {
        const playerPos = this.player.getPosition();

        // 找到最近的敌人
        let closestEnemy: Enemy | null = null;
        let closestDistance = Infinity;

        for (const enemy of this.enemies) {
            if (!enemy.isAlive) continue;

            const enemyPos = enemy.getPosition();
            const dx = enemyPos.x - playerPos.x;
            const dy = enemyPos.y - playerPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        }

        // 创建子弹
        let targetX: number, targetY: number;
        if (closestEnemy) {
            const enemyPos = closestEnemy.getPosition();
            targetX = enemyPos.x;
            targetY = enemyPos.y;
        } else {
            // 没有敌人，向右发射
            targetX = playerPos.x + 100;
            targetY = playerPos.y;
        }

        const bullet = new Bullet(playerPos.x, playerPos.y, targetX, targetY);
        this.bullets.push(bullet);
        this.gameContainer.addChild(bullet.graphics);
    }

    // ==================== 更新子弹 ====================

    private updateBullets(): void {
        for (const bullet of this.bullets) {
            bullet.update(CANVAS_CONFIG.width, CANVAS_CONFIG.height);
        }
    }

    // ==================== 更新敌人 ====================

    private updateEnemies(): void {
        const playerPos = this.player.getPosition();

        for (const enemy of this.enemies) {
            if (enemy.isAlive) {
                enemy.moveTowards(playerPos.x, playerPos.y);
            }
        }
    }

    // ==================== 生成敌人 ====================

    private spawnEnemies(): void {
        const now = Date.now();

        if (now - this.lastSpawnTime >= ENEMY_CONFIG.spawnInterval) {
            // 在屏幕右侧随机位置生成敌人
            const x = CANVAS_CONFIG.width + 30;  // 屏幕右侧外
            const y = Math.random() * (CANVAS_CONFIG.height - 100) + 50;  // 随机 Y 位置

            const enemy = new Enemy(x, y);
            this.enemies.push(enemy);
            this.gameContainer.addChild(enemy.container);

            this.lastSpawnTime = now;
        }
    }

    // ==================== 碰撞检测 ====================

    private checkCollisions(): void {
        const playerPos = this.player.getPosition();

        // 1. 子弹与敌人碰撞
        for (const bullet of this.bullets) {
            if (!bullet.isActive) continue;

            for (const enemy of this.enemies) {
                if (!enemy.isAlive) continue;

                const enemyPos = enemy.getPosition();
                if (bullet.isCollidingWith(enemyPos.x, enemyPos.y, ENEMY_CONFIG.size)) {
                    // 子弹击中敌人
                    bullet.deactivate();
                    const survived = enemy.takeDamage(PLAYER_CONFIG.bulletDamage);

                    if (!survived) {
                        // 敌人死亡，加分
                        this.score += 10;
                    }
                    break;
                }
            }
        }

        // 2. 敌人与玩家碰撞（每帧造成伤害）
        for (const enemy of this.enemies) {
            if (!enemy.isAlive) continue;

            if (enemy.isCollidingWith(playerPos.x, playerPos.y, PLAYER_CONFIG.size)) {
                // 敌人接触玩家，造成伤害（每帧伤害较小）
                const damagePerFrame = ENEMY_CONFIG.damage / 60;  // 假设 60fps
                const survived = this.player.takeDamage(damagePerFrame);

                if (!survived) {
                    this.gameOver();
                }
            }
        }
    }

    // ==================== 清理死亡对象 ====================

    private cleanup(): void {
        // 清理非激活的子弹
        this.bullets = this.bullets.filter(bullet => {
            if (!bullet.isActive) {
                this.gameContainer.removeChild(bullet.graphics);
                bullet.graphics.destroy();
                return false;
            }
            return true;
        });

        // 清理死亡的敌人
        this.enemies = this.enemies.filter(enemy => {
            if (!enemy.isAlive) {
                this.gameContainer.removeChild(enemy.container);
                enemy.container.destroy();
                return false;
            }
            return true;
        });
    }

    // ==================== UI 更新 ====================

    private updateUI(): void {
        this.scoreText.text = `得分: ${this.score}`;
        this.hpText.text = `生命: ${Math.ceil(this.player.hp)}`;
        this.hpText.style.fill = this.player.hp > 30 ? 0x66bb6a : 0xef5350;
    }

    // ==================== 游戏结束 ====================

    private gameOver(): void {
        this.isGameOver = true;

        // 显示游戏结束文本
        const gameOverText = new Text({
            text: `游戏结束！\n最终得分: ${this.score}\n\n按 R 重新开始`,
            style: { fontSize: 48, fill: 0xef5350, align: 'center' }
        });
        gameOverText.anchor.set(0.5);
        gameOverText.position.set(CANVAS_CONFIG.width / 2, CANVAS_CONFIG.height / 2);
        this.app.stage.addChild(gameOverText);

        // 监听 R 键重新开始
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'r') {
                location.reload();
            }
        });

        console.log('💀 游戏结束，得分:', this.score);
    }
}
