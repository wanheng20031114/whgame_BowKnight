/**
 * 网格系统
 */

import { Graphics, Text, Container } from 'pixi.js';
import type { CellData } from './types';
import { GRID_CONFIG } from './config';

// 全局网格数据
export const grid: CellData[][] = [];

/**
 * 初始化网格
 */
export function initGrid(gridContainer: Container): void {
    const { rows, cols, cellSize, gap } = GRID_CONFIG;

    for (let row = 0; row < rows; row++) {
        grid[row] = [];
        for (let col = 0; col < cols; col++) {
            const cellData = createCellGraphics(row, col, cellSize, gap);
            grid[row][col] = cellData;
            gridContainer.addChild(cellData.container);
        }
    }
}

/**
 * 创建单个格子的图形
 */
function createCellGraphics(row: number, col: number, cellSize: number, gap: number): CellData {
    const container = new Container();
    container.position.set(col * (cellSize + gap), row * (cellSize + gap));

    // 背景
    const background = new Graphics()
        .roundRect(0, 0, cellSize, cellSize, 6)
        .fill(0x2a2a3a);
    background.eventMode = 'static';
    background.cursor = 'pointer';
    container.addChild(background);

    // 坐标标签
    const coordLabel = new Text({
        text: `${row},${col}`,
        style: { fontSize: 14, fill: 0x3a3a4a }
    });
    coordLabel.anchor.set(0.5);
    coordLabel.position.set(cellSize / 2, cellSize / 2);
    container.addChild(coordLabel);

    return {
        row,
        col,
        container,
        background,
        coordLabel,
        entity: null,
        entityGraphics: null,
        entitySprite: null,
        entityLabel: null,
        hpBar: null,
        hpBarBg: null,
    };
}

/**
 * 获取格子
 */
export function getCell(row: number, col: number): CellData | null {
    if (row < 0 || row >= grid.length) return null;
    if (col < 0 || col >= grid[0].length) return null;
    return grid[row][col];
}

/**
 * 计算曼哈顿距离
 */
export function getDistance(r1: number, c1: number, r2: number, c2: number): number {
    return Math.abs(r1 - r2) + Math.abs(c1 - c2);
}

/**
 * 获取范围内的格子
 */
export function getCellsInRange(centerRow: number, centerCol: number, range: number): CellData[] {
    const result: CellData[] = [];
    const { rows, cols } = GRID_CONFIG;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (r === centerRow && c === centerCol) continue;
            if (getDistance(centerRow, centerCol, r, c) <= range) {
                result.push(grid[r][c]);
            }
        }
    }
    return result;
}
