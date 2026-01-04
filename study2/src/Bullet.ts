/**
 * 子弹类
 * 
 * 负责：
 * - 子弹的渲染
 * - 子弹的移动（向目标方向）
 * - 子弹与敌人的碰撞检测
 */

import { Graphics } from 'pixi.js';
import { BULLET_CONFIG, PLAYER_CONFIG } from './config';

export class Bullet {
    // ==================== 属性 ====================

    public graphics: Graphics;       // 子弹图形
    public x: number;                // X 坐标
    public y: number;                // Y 坐标
    public isActive: boolean = true; // 是否激活（用于对象池回收）

    private velocityX: number;       // X 方向速度
    private velocityY: number;       // Y 方向速度

    // ==================== 构造函数 ====================

    /**
     * 创建子弹
     * @param startX 起始 X 坐标
     * @param startY 起始 Y 坐标
     * @param targetX 目标 X 坐标
     * @param targetY 目标 Y 坐标
     */
    constructor(startX: number, startY: number, targetX: number, targetY: number) {
        this.x = startX;
        this.y = startY;

        // 计算方向向量
        const dx = targetX - startX;
        const dy = targetY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 归一化并设置速度
        if (distance > 0) {
            this.velocityX = (dx / distance) * PLAYER_CONFIG.bulletSpeed;
            this.velocityY = (dy / distance) * PLAYER_CONFIG.bulletSpeed;
        } else {
            // 如果没有目标，向右发射
            this.velocityX = PLAYER_CONFIG.bulletSpeed;
            this.velocityY = 0;
        }

        // 创建子弹图形（金色小圆）
        this.graphics = new Graphics()
            .circle(0, 0, BULLET_CONFIG.size)
            .fill(BULLET_CONFIG.color);
        this.graphics.position.set(this.x, this.y);
    }

    // ==================== 更新方法 ====================

    /**
     * 更新子弹位置
     * @param canvasWidth 画布宽度（用于边界检测）
     * @param canvasHeight 画布高度
     */
    update(canvasWidth: number, canvasHeight: number): void {
        if (!this.isActive) return;

        // 移动子弹
        this.x += this.velocityX;
        this.y += this.velocityY;

        // 更新图形位置
        this.graphics.position.set(this.x, this.y);

        // 边界检测，超出屏幕则标记为非激活
        if (this.x < -50 || this.x > canvasWidth + 50 ||
            this.y < -50 || this.y > canvasHeight + 50) {
            this.isActive = false;
        }
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
        return distance < BULLET_CONFIG.size + targetRadius;
    }

    // ==================== 销毁 ====================

    /**
     * 标记子弹为非激活
     */
    deactivate(): void {
        this.isActive = false;
    }
}
