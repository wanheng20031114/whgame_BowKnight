/**
 * 游戏配置常量
 * 
 * 集中管理所有游戏参数，方便调整和平衡
 */

// 画布配置
export const CANVAS_CONFIG = {
    width: 1280,          // 画布宽度
    height: 720,          // 画布高度
    backgroundColor: 0x1a1a2e,  // 背景颜色
};

// 玩家配置
export const PLAYER_CONFIG = {
    speed: 5,              // 移动速度（像素/帧）
    maxHp: 100,            // 最大生命值
    size: 40,              // 碰撞体积半径
    spriteSize: 64,        // 精灵显示大小
    fireRate: 300,         // 射击间隔（毫秒）
    bulletSpeed: 10,       // 子弹速度
    bulletDamage: 25,      // 子弹伤害
};

// 敌人（僵尸）配置
export const ENEMY_CONFIG = {
    speed: 1.5,            // 移动速度
    maxHp: 50,             // 生命值
    size: 30,              // 碰撞体积半径
    damage: 10,            // 每秒造成伤害
    color: 0x66bb6a,       // 僵尸颜色（绿色）
    spawnInterval: 2000,   // 生成间隔（毫秒）
};

// 子弹配置
export const BULLET_CONFIG = {
    size: 8,               // 子弹半径
    color: 0xffd700,       // 子弹颜色（金色）
};
