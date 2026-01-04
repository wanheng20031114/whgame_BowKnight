/**
 * 输入管理器
 * 
 * 负责：
 * - 监听键盘事件
 * - 管理按键状态
 * - 提供方向输入和攻击输入的接口
 */

export class InputManager {
    // ==================== 按键状态 ====================

    private keys: Set<string> = new Set();  // 当前按下的键

    // ==================== 构造函数 ====================

    constructor() {
        // 监听键盘按下事件
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.key.toLowerCase());
        });

        // 监听键盘释放事件
        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.key.toLowerCase());
        });

        console.log('✅ 输入管理器初始化完成');
    }

    // ==================== 方向输入 ====================

    /**
     * 获取移动方向
     * @returns { dx, dy } 方向向量（-1, 0, 1）
     */
    getDirection(): { dx: number; dy: number } {
        let dx = 0;
        let dy = 0;

        // 左右方向
        if (this.keys.has('arrowleft') || this.keys.has('a')) {
            dx = -1;
        } else if (this.keys.has('arrowright') || this.keys.has('d')) {
            dx = 1;
        }

        // 上下方向
        if (this.keys.has('arrowup') || this.keys.has('w')) {
            dy = -1;
        } else if (this.keys.has('arrowdown') || this.keys.has('s')) {
            dy = 1;
        }

        return { dx, dy };
    }

    // ==================== 攻击输入 ====================

    /**
     * 检查是否按下攻击键
     * @returns 是否按下 Z 键
     */
    isAttacking(): boolean {
        return this.keys.has('z');
    }

    // ==================== 其他输入 ====================

    /**
     * 检查某个键是否被按下
     * @param key 键名（小写）
     */
    isKeyDown(key: string): boolean {
        return this.keys.has(key.toLowerCase());
    }
}
