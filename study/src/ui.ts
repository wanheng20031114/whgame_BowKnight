/**
 * UI 组件
 */

import { Text, Container, Graphics } from 'pixi.js';

/**
 * 创建标题
 */
export function createTitle(text: string, x: number, y: number): Text {
    const title = new Text({
        text,
        style: { fontSize: 28, fill: 0xffffff }
    });
    title.anchor.set(0.5, 0);
    title.position.set(x, y);
    return title;
}

/**
 * 创建状态文本
 */
export function createStatusText(x: number, y: number): Text {
    const statusText = new Text({
        text: '选择一个单位...',
        style: { fontSize: 18, fill: 0xaaaaaa }
    });
    statusText.anchor.set(0.5, 0);
    statusText.position.set(x, y);
    return statusText;
}

/**
 * 创建提示文本
 */
export function createTipText(text: string, x: number, y: number): Text {
    const tipText = new Text({
        text,
        style: { fontSize: 16, fill: 0x888888 }
    });
    tipText.anchor.set(0.5, 0);
    tipText.position.set(x, y);
    return tipText;
}

/**
 * 创建图例
 */
export function createLegend(x: number, y: number): Container {
    const container = new Container();
    container.position.set(x, y);

    // 标题
    const title = new Text({ text: '图例:', style: { fontSize: 16, fill: 0xaaaaaa } });
    container.addChild(title);

    // 我方单位
    container.addChild(new Graphics().circle(15, 35, 10).fill(0x42a5f5));
    const playerText = new Text({ text: '我方单位', style: { fontSize: 14, fill: 0x42a5f5 } });
    playerText.position.set(30, 25);
    container.addChild(playerText);

    // 敌方单位
    container.addChild(new Graphics().circle(15, 65, 10).fill(0xef5350));
    const enemyText = new Text({ text: '敌方单位', style: { fontSize: 14, fill: 0xef5350 } });
    enemyText.position.set(30, 55);
    container.addChild(enemyText);

    // 可移动
    const moveRect = new Graphics().rect(5, 80, 20, 20).fill(0x66bb6a);
    moveRect.alpha = 0.5;
    container.addChild(moveRect);
    const moveText = new Text({ text: '可移动', style: { fontSize: 14, fill: 0x66bb6a } });
    moveText.position.set(30, 80);
    container.addChild(moveText);

    // 可攻击
    const attackRect = new Graphics().rect(5, 110, 20, 20).fill(0xef5350);
    attackRect.alpha = 0.5;
    container.addChild(attackRect);
    const attackText = new Text({ text: '可攻击', style: { fontSize: 14, fill: 0xef5350 } });
    attackText.position.set(30, 110);
    container.addChild(attackText);

    return container;
}
