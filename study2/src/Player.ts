/**
 * 玩家类
 * 
 * 负责：
 * - 玩家的渲染（精灵图片）
 * - 玩家的移动控制
 * - 玩家的生命值管理
 * - 射击功能
 */

import { Container, Sprite, Graphics, Assets } from 'pixi.js';
import { PLAYER_CONFIG, CANVAS_CONFIG } from './config';

export class Player {
    // ==================== 属性 ====================

    public container: Container;     // 玩家容器（包含精灵和血条）
    public x: number;                // X 坐标
    public y: number;                // Y 坐标
    public hp: number;               // 当前生命值
    public maxHp: number;            // 最大生命值
    public lastFireTime: number = 0; // 上次射击时间

    private sprite: Sprite | null = null;      // 精灵图片
    private fallbackGraphics: Graphics | null = null;  // 备用图形
    private hpBar: Graphics;         // 血条
    private hpBarBg: Graphics;       // 血条背景

    // ==================== 构造函数 ====================

    constructor(x: number, y: number) {
        this.container = new Container();
        this.x = x;
        this.y = y;
        this.hp = PLAYER_CONFIG.maxHp;
        this.maxHp = PLAYER_CONFIG.maxHp;

        // 创建血条背景
        this.hpBarBg = new Graphics()
            .rect(-30, -50, 60, 8)
            .fill(0x333333);
        this.container.addChild(this.hpBarBg);

        // 创建血条
        this.hpBar = new Graphics()
            .rect(-30, -50, 60, 8)
            .fill(0x66bb6a);
        this.container.addChild(this.hpBar);

        // 更新容器位置
        this.container.position.set(x, y);
    }

    // ==================== 初始化精灵 ====================

    /**
     * 异步加载玩家精灵图片
     */
    async loadSprite(): Promise<void> {
        try {
            // 尝试加载弓箭手图片
            const texture = await Assets.load('/entity/archer.png');
            this.sprite = new Sprite(texture);
            this.sprite.width = PLAYER_CONFIG.spriteSize;
            this.sprite.height = PLAYER_CONFIG.spriteSize;
            this.sprite.anchor.set(0.5);
            this.container.addChild(this.sprite);
            console.log('✅ 玩家精灵加载成功');
        } catch {
            // 加载失败，使用备用圆形
            console.warn('⚠️ 无法加载玩家精灵，使用备用图形');
            this.fallbackGraphics = new Graphics()
                .circle(0, 0, PLAYER_CONFIG.size)
                .fill(0x42a5f5);
            this.container.addChild(this.fallbackGraphics);
        }
    }

    // ==================== 移动方法 ====================

    /**
     * 根据输入方向移动玩家
     * @param dx X 方向（-1=左，1=右，0=不动）
     * @param dy Y 方向（-1=上，1=下，0=不动）
     */
    move(dx: number, dy: number): void {
        // 计算新位置
        const newX = this.x + dx * PLAYER_CONFIG.speed;
        const newY = this.y + dy * PLAYER_CONFIG.speed;

        // 边界检测，确保玩家不会移出画布
        const margin = PLAYER_CONFIG.size;
        this.x = Math.max(margin, Math.min(CANVAS_CONFIG.width - margin, newX));
        this.y = Math.max(margin, Math.min(CANVAS_CONFIG.height - margin, newY));

        // 更新容器位置
        this.container.position.set(this.x, this.y);
    }

    // ==================== 伤害方法 ====================

    /**
     * 玩家受到伤害
     * @param damage 伤害值
     * @returns 玩家是否存活
     */
    takeDamage(damage: number): boolean {
        this.hp = Math.max(0, this.hp - damage);
        this.updateHpBar();
        return this.hp > 0;
    }

    /**
     * 更新血条显示
     */
    private updateHpBar(): void {
        const hpRatio = this.hp / this.maxHp;
        this.hpBar.clear();
        this.hpBar
            .rect(-30, -50, 60 * hpRatio, 8)
            .fill(hpRatio > 0.3 ? 0x66bb6a : 0xef5350);
    }

    // ==================== 射击方法 ====================

    /**
     * 检查是否可以射击（冷却时间）
     */
    canFire(): boolean {
        const now = Date.now();
        if (now - this.lastFireTime >= PLAYER_CONFIG.fireRate) {
            this.lastFireTime = now;
            return true;
        }
        return false;
    }

    // ==================== 获取位置 ====================

    getPosition(): { x: number; y: number } {
        return { x: this.x, y: this.y };
    }
}
