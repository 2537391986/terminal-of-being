// fix-concepts.mjs - 修复 concepts.js 中的重复段
import { readFileSync, writeFileSync } from 'fs';

const filePath = new URL('./js/data/concepts.js', import.meta.url).pathname;
let content = readFileSync(filePath, 'utf8');

// 找到重复段的标记：第二个 "  // 27. 反对方法" 出现的位置
const marker = '  // ═══════════════════════════════════════════════════════════\n  // 27. 反对方法';
const firstIdx = content.indexOf(marker);

if (firstIdx === -1) {
  console.log('未找到重复段标记');
  process.exit(0);
}

// 从第一个标记之后，找第二个标记（重复段的开始）
const secondIdx = content.indexOf(marker, firstIdx + marker.length);

if (secondIdx === -1) {
  console.log('未找到第二个重复段标记，可能已修复');
  process.exit(0);
}

console.log(`找到重复段：位置 ${secondIdx}`);

// 找到重复段中概念对象的结束位置（下一个 "  },\n  // ══" 或 "];"）
const afterDup = content.indexOf('  },\n  // ═══════════════════════════════════════════════════════════', secondIdx);
if (afterDup === -1) {
  console.log('未找到重复段结束位置');
  process.exit(1);
}

const dupEnd = afterDup + '  },\n'.length;
console.log(`重复段结束位置：${dupEnd}`);

// 修复：删除重复段
const fixed = content.substring(0, secondIdx) + content.substring(dupEnd);
writeFileSync(filePath, fixed, 'utf8');
console.log('已修复 concepts.js');
