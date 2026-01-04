/**
 * 类型定义
 */

// 阵营类型
export type Team = 'player' | 'enemy';

// 实体对象（单位）
export interface Entity {
    name: string;
    team: Team;
    hp: number;
    maxHp: number;
    attack: number;
    moveRange: number;
    attackRange: number;
    color: number;
    sprite?: string;  // 可选：图片路径（如 '/archer.png'）
}

// 单个格子的数据
export interface CellData {
    row: number;
    col: number;
    container: import('pixi.js').Container;
    background: import('pixi.js').Graphics;
    coordLabel: import('pixi.js').Text;
    entity: Entity | null;
    entityGraphics: import('pixi.js').Graphics | null;
    entitySprite: import('pixi.js').Sprite | null;  // 新增：图片精灵
    entityLabel: import('pixi.js').Text | null;
    hpBar: import('pixi.js').Graphics | null;
    hpBarBg: import('pixi.js').Graphics | null;
}
