/**
 * 实体（单位）相关函数
 */

import { Graphics, Text, Sprite, Assets } from 'pixi.js';
import type { Entity, CellData, Team } from './types';
import { GRID_CONFIG } from './config';

// 单位模板（包含可选的sprite路径）
const UNIT_TEMPLATES: Record<string, Omit<Entity, 'team' | 'color'>> = {
    '士兵': { name: '士兵', hp: 100, maxHp: 100, attack: 20, moveRange: 2, attackRange: 1 },
    '弓箭手': { name: '弓箭手', hp: 60, maxHp: 60, attack: 30, moveRange: 2, attackRange: 3, sprite: '../public/entity/archer.png' },
    '坦克': { name: '坦克', hp: 300, maxHp: 300, attack: 15, moveRange: 1, attackRange: 1 },
    '骑兵': { name: '骑兵', hp: 80, maxHp: 80, attack: 25, moveRange: 4, attackRange: 1 },
};

/**
 * 预加载所有单位的图片
 */
export async function preloadAssets(): Promise<void> {
    const spritePaths = Object.values(UNIT_TEMPLATES)
        .filter(u => u.sprite)
        .map(u => u.sprite as string);

    for (const path of spritePaths) {
        try {
            await Assets.load(path);
            console.log(`✅ 加载图片: ${path}`);
        } catch (e) {
            console.warn(`⚠️ 无法加载图片: ${path}，将使用默认图形`);
        }
    }
}

/**
 * 创建单位
 */
export function createUnit(type: string, team: Team): Entity {
    const base = UNIT_TEMPLATES[type] || UNIT_TEMPLATES['士兵'];
    return {
        ...base,
        team,
        color: team === 'player' ? 0x42a5f5 : 0xef5350,
    };
}

/**
 * 获取随机单位类型
 */
export function getRandomUnitType(): string {
    const types = Object.keys(UNIT_TEMPLATES);
    return types[Math.floor(Math.random() * types.length)];
}

/**
 * 在格子上添加实体
 */
export async function addEntityToCell(cell: CellData, entity: Entity): Promise<boolean> {
    if (cell.entity) return false;

    const { cellSize } = GRID_CONFIG;
    cell.entity = { ...entity };
    cell.coordLabel.visible = false;

    // 如果有精灵图，使用图片；否则使用圆形
    if (entity.sprite) {
        try {
            const texture = await Assets.load(entity.sprite);
            const sprite = new Sprite(texture);

            // 设置精灵大小和位置（居中，留出血条和名称空间）
            sprite.width = 50;
            sprite.height = 50;
            sprite.anchor.set(0.5);
            sprite.position.set(cellSize / 2, cellSize / 2 - 5);

            // 敌方单位添加红色滤镜
            if (entity.team === 'enemy') {
                sprite.tint = 0xff6666;
            }

            cell.entitySprite = sprite;
            cell.container.addChild(sprite);
        } catch {
            // 加载失败，使用默认圆形
            createDefaultGraphics(cell, entity, cellSize);
        }
    } else {
        // 使用默认圆形
        createDefaultGraphics(cell, entity, cellSize);
    }

    // 实体名称
    cell.entityLabel = new Text({
        text: entity.name,
        style: { fontSize: 11, fill: 0xffffff }
    });
    cell.entityLabel.anchor.set(0.5);
    cell.entityLabel.position.set(cellSize / 2, cellSize - 12);
    cell.container.addChild(cell.entityLabel);

    // 血条背景（灰色）
    cell.hpBarBg = new Graphics()
        .rect(10, 5, cellSize - 20, 6)
        .fill(0x333333);
    cell.container.addChild(cell.hpBarBg);

    // 血条（绿色）
    cell.hpBar = new Graphics()
        .rect(10, 5, cellSize - 20, 6)
        .fill(0x66bb6a);
    cell.container.addChild(cell.hpBar);

    return true;
}

/**
 * 创建默认的圆形图形
 */
function createDefaultGraphics(cell: CellData, entity: Entity, cellSize: number): void {
    cell.entityGraphics = new Graphics()
        .circle(cellSize / 2, cellSize / 2 - 8, 22)
        .fill(entity.color);
    cell.container.addChild(cell.entityGraphics);
}

/**
 * 从格子移除实体
 */
export function removeEntityFromCell(cell: CellData): boolean {
    if (!cell.entity) return false;

    // 销毁所有图形元素
    if (cell.entityGraphics) {
        cell.container.removeChild(cell.entityGraphics);
        cell.entityGraphics.destroy();
        cell.entityGraphics = null;
    }
    if (cell.entitySprite) {
        cell.container.removeChild(cell.entitySprite);
        cell.entitySprite.destroy();
        cell.entitySprite = null;
    }
    if (cell.entityLabel) {
        cell.container.removeChild(cell.entityLabel);
        cell.entityLabel.destroy();
        cell.entityLabel = null;
    }
    if (cell.hpBar) {
        cell.container.removeChild(cell.hpBar);
        cell.hpBar.destroy();
        cell.hpBar = null;
    }
    if (cell.hpBarBg) {
        cell.container.removeChild(cell.hpBarBg);
        cell.hpBarBg.destroy();
        cell.hpBarBg = null;
    }

    cell.entity = null;
    cell.coordLabel.visible = true;

    return true;
}

/**
 * 更新血条显示
 */
export function updateHpBar(cell: CellData): void {
    if (!cell.entity || !cell.hpBar) return;

    const { cellSize } = GRID_CONFIG;
    const hpRatio = Math.max(0, cell.entity.hp / cell.entity.maxHp);

    cell.hpBar.clear();
    cell.hpBar
        .rect(10, 5, (cellSize - 20) * hpRatio, 6)
        .fill(hpRatio > 0.3 ? 0x66bb6a : 0xef5350);
}

/**
 * 移动实体从一个格子到另一个格子
 */
export function moveEntityBetweenCells(fromCell: CellData, toCell: CellData): boolean {
    if (!fromCell.entity || toCell.entity) return false;

    // 移动数据
    toCell.entity = fromCell.entity;
    fromCell.entity = null;

    // 移动图形元素
    if (fromCell.entityGraphics) {
        fromCell.container.removeChild(fromCell.entityGraphics);
        toCell.container.addChild(fromCell.entityGraphics);
        toCell.entityGraphics = fromCell.entityGraphics;
        fromCell.entityGraphics = null;
    }
    // 移动精灵
    if (fromCell.entitySprite) {
        fromCell.container.removeChild(fromCell.entitySprite);
        toCell.container.addChild(fromCell.entitySprite);
        toCell.entitySprite = fromCell.entitySprite;
        fromCell.entitySprite = null;
    }
    if (fromCell.entityLabel) {
        fromCell.container.removeChild(fromCell.entityLabel);
        toCell.container.addChild(fromCell.entityLabel);
        toCell.entityLabel = fromCell.entityLabel;
        fromCell.entityLabel = null;
    }
    // 注意顺序！先移动背景，再移动血条
    if (fromCell.hpBarBg) {
        fromCell.container.removeChild(fromCell.hpBarBg);
        toCell.container.addChild(fromCell.hpBarBg);
        toCell.hpBarBg = fromCell.hpBarBg;
        fromCell.hpBarBg = null;
    }
    if (fromCell.hpBar) {
        fromCell.container.removeChild(fromCell.hpBar);
        toCell.container.addChild(fromCell.hpBar);
        toCell.hpBar = fromCell.hpBar;
        fromCell.hpBar = null;
    }

    // 更新坐标标签可见性
    fromCell.coordLabel.visible = true;
    toCell.coordLabel.visible = false;

    return true;
}
