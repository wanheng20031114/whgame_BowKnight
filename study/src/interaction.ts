/**
 * 交互处理
 */

import type { Text } from 'pixi.js';
import type { CellData, Team } from './types';
import { GRID_CONFIG } from './config';
import { grid, getDistance } from './grid';
import {
    createUnit,
    getRandomUnitType,
    addEntityToCell,
    removeEntityFromCell,
    moveEntityBetweenCells,
    updateHpBar,
} from './entity';

// 全局状态
let selectedCell: CellData | null = null;
let highlightedCells: CellData[] = [];

/**
 * 绑定格子事件
 */
export function bindCellEvents(cell: CellData, statusText: Text): void {
    const { background } = cell;

    // 悬停效果
    background.on('pointerover', () => {
        if (!isHighlighted(cell)) {
            background.tint = 0x4a4a5a;
        }
    });
    background.on('pointerout', () => {
        if (!isHighlighted(cell)) {
            background.tint = 0xffffff;
        }
    });

    // 左键 - 选中
    background.on('pointerdown', (e) => {
        if (e.button === 0) handleLeftClick(cell, statusText);
        if (e.button === 1) handleMiddleClick(cell, statusText);
    });

    // 右键 - 移动/攻击
    background.on('rightclick', () => {
        handleRightClick(cell, statusText);
    });
}

/**
 * 左键点击 - 选中单位
 */
function handleLeftClick(cell: CellData, statusText: Text): void {
    clearHighlights();

    if (cell.entity && cell.entity.team === 'player') {
        // 选中己方单位
        selectedCell = cell;
        cell.background.tint = 0xffd700;
        highlightRanges(cell);

        const e = cell.entity;
        statusText.text = `已选中: ${e.name} | HP: ${e.hp}/${e.maxHp} | ATK: ${e.attack} | 移动: ${e.moveRange} | 攻击: ${e.attackRange}`;
        statusText.style.fill = 0x42a5f5;
    } else if (cell.entity && cell.entity.team === 'enemy') {
        // 查看敌方单位
        const e = cell.entity;
        statusText.text = `敌方: ${e.name} | HP: ${e.hp}/${e.maxHp} | ATK: ${e.attack}`;
        statusText.style.fill = 0xef5350;
        selectedCell = null;
    } else {
        // 取消选中
        statusText.text = `空格子 [${cell.row}, ${cell.col}]`;
        statusText.style.fill = 0x888888;
        selectedCell = null;
    }
}

/**
 * 右键点击 - 移动或攻击
 */
function handleRightClick(cell: CellData, statusText: Text): void {
    if (!selectedCell || !selectedCell.entity) {
        statusText.text = '请先选中一个己方单位';
        statusText.style.fill = 0xffa726;
        return;
    }

    const distance = getDistance(selectedCell.row, selectedCell.col, cell.row, cell.col);
    const entity = selectedCell.entity;

    if (cell.entity) {
        // 目标有单位
        if (cell.entity.team === 'enemy') {
            // 攻击敌人
            if (distance <= entity.attackRange) {
                const damage = entity.attack;
                cell.entity.hp -= damage;
                statusText.text = `${entity.name} 对 ${cell.entity.name} 造成 ${damage} 伤害！`;
                statusText.style.fill = 0xef5350;

                updateHpBar(cell);

                if (cell.entity.hp <= 0) {
                    statusText.text += ` ${cell.entity.name} 被击败！`;
                    removeEntityFromCell(cell);
                }

                clearHighlights();
                selectedCell = null;
            } else {
                statusText.text = `距离太远！需要 ${entity.attackRange}，当前 ${distance}`;
                statusText.style.fill = 0xffa726;
            }
        } else {
            statusText.text = '不能攻击己方单位';
            statusText.style.fill = 0xffa726;
        }
    } else {
        // 移动到空格
        if (distance <= entity.moveRange) {
            moveEntityBetweenCells(selectedCell, cell);
            statusText.text = `${entity.name} 移动到 [${cell.row}, ${cell.col}]`;
            statusText.style.fill = 0x66bb6a;

            clearHighlights();
            selectedCell = null;
        } else {
            statusText.text = `移动距离太远！需要 ${entity.moveRange}，当前 ${distance}`;
            statusText.style.fill = 0xffa726;
        }
    }
}

/**
 * 中键点击 - 生成单位
 */
async function handleMiddleClick(cell: CellData, statusText: Text): Promise<void> {
    if (cell.entity) {
        statusText.text = '该格子已有单位';
        statusText.style.fill = 0xffa726;
        return;
    }

    const unitType = getRandomUnitType();
    const team: Team = Math.random() > 0.5 ? 'player' : 'enemy';
    const unit = createUnit(unitType, team);

    await addEntityToCell(cell, unit);
    statusText.text = `在 [${cell.row}, ${cell.col}] 生成了 ${team === 'player' ? '我方' : '敌方'} ${unitType}`;
    statusText.style.fill = team === 'player' ? 0x42a5f5 : 0xef5350;
}

/**
 * 高亮移动和攻击范围
 */
function highlightRanges(cell: CellData): void {
    if (!cell.entity) return;

    const { moveRange, attackRange } = cell.entity;
    const { rows, cols } = GRID_CONFIG;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (r === cell.row && c === cell.col) continue;

            const dist = getDistance(cell.row, cell.col, r, c);
            const targetCell = grid[r][c];

            if (dist <= moveRange && !targetCell.entity) {
                targetCell.background.tint = 0x66bb6a;
                highlightedCells.push(targetCell);
            } else if (dist <= attackRange && targetCell.entity?.team === 'enemy') {
                targetCell.background.tint = 0xef5350;
                highlightedCells.push(targetCell);
            }
        }
    }
}

/**
 * 清除所有高亮
 */
function clearHighlights(): void {
    for (const cell of highlightedCells) {
        cell.background.tint = 0xffffff;
    }
    highlightedCells = [];
    if (selectedCell) {
        selectedCell.background.tint = 0xffffff;
    }
}

/**
 * 检查格子是否被高亮
 */
function isHighlighted(cell: CellData): boolean {
    return highlightedCells.includes(cell) || cell === selectedCell;
}
