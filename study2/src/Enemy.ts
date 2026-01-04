/**
 * 敌人（僵尸）类
 * 
 * 负责：
 * - 僵尸的渲染
 * - 向玩家移动的 AI
 * - 与玩家碰撞检测
 * - 生命值管理
 */

import { Container, Graphics } from 'pixi.js';
import { ENEMY_CONFIG } from './config';

export class Enemy {
    // ==================== 属性 ====================

    public container: Container;     // 敌人容器
    public x: number;                // X 坐标
    public y: number;                // Y 坐标
    public hp: number;               // 当前生命值
    public maxHp: number;            // 最大生命值
    public isAlive: boolean = true;  // 是否存活

    private graphics: Graphics;      // 图形（圆形）
    private hpBar: Graphics;         // 血条
    private hpBarBg: Graphics;       // 血条背景

    // ==================== 构造函数 ====================

    constructor(x: number, y: number) {
        this.container = new Container();
        this.x = x;
        this.y = y;
        this.hp = ENEMY_CONFIG.maxHp;
        this.maxHp = ENEMY_CONFIG.maxHp;

        // 创建僵尸图形（绿色圆形）
        this.graphics = new Graphics()
            .circle(0, 0, ENEMY_CONFIG.size)
            .fill(ENEMY_CONFIG.color);
        this.container.addChild(this.graphics);

        // 创建血条背景
        this.hpBarBg = new Graphics()
            .rect(-20, -40, 40, 6)
            .fill(0x333333);
        this.container.addChild(this.hpBarBg);

        // 创建血条
        this.hpBar = new Graphics()
            .rect(-20, -40, 40, 6)
            .fill(0xef5350);
        this.container.addChild(this.hpBar);

        // 更新容器位置
        this.container.position.set(x, y);
    }

    // ==================== AI 移动 ====================

    /**
     * 向目标位置移动（追踪玩家）
     * @param targetX 目标 X 坐标
     * @param targetY 目标 Y 坐标
     */
    moveTowards(targetX: number, targetY: number): void {
        if (!this.isAlive) return;

        // 计算方向向量
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 如果距离大于0，进行移动
        if (distance > 0) {
            // 归一化方向并乘以速度
            const moveX = (dx / distance) * ENEMY_CONFIG.speed;
            const moveY = (dy / distance) * ENEMY_CONFIG.speed;

            this.x += moveX;
            this.y += moveY;

            // 更新容器位置
            this.container.position.set(this.x, this.y);
        }
    }

    // ==================== 伤害方法 ====================

    /**
     * 敌人受到伤害
     * @param damage 伤害值
     * @returns 敌人是否存活
     */
    takeDamage(damage: number): boolean {
        this.hp = Math.max(0, this.hp - damage);
        this.updateHpBar();

        if (this.hp <= 0) {
            this.isAlive = false;
        }

        return this.isAlive;
    }

    /**
     * 更新血条显示
     */
    private updateHpBar(): void {
        const hpRatio = this.hp / this.maxHp;
        this.hpBar.clear();
        this.hpBar
            .rect(-20, -40, 40 * hpRatio, 6)
            .fill(0xef5350);
    }

    // ==================== 碰撞检测 ====================

    /**
     * 检查是否与目标碰撞
     * @param targetX 目标 X
     * @param targetY 目标 Y
     * @param targetRadius 目标半径
     */
    isCollidingWith(targetX: number, targetY: number, targetRadius: number): boolean {
        const dx = this.x - targetX;
        const dy = this.y - targetY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < ENEMY_CONFIG.size + targetRadius;
    }

    // ==================== 获取位置 ====================

    getPosition(): { x: number; y: number } {
        return { x: this.x, y: this.y };
    }
}
