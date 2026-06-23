const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'js/data/concepts.js');
let content = fs.readFileSync(filePath, 'utf8');

// 策略：找到第二个 "  id: \"against_method\"" 的位置，然后删除从它之前的注释开始到对象结束的部分
const marker = '  // ═══════════════════════════════════════════════════════════\n  // 27. 反对方法(Against Method) — 费耶阿本德';
const idx = content.indexOf(marker);

if (idx === -1) {
  console.log('未找到重复段标记，可能已修复或结构不同');
  process.exit(0);
}

console.log('找到重复段起始位置:', idx);

// 找到重复段中概念对象的结束位置（下一个 "  }," 或 "];"）
// 第二个 against_method 对象结束后，应该有一个 "  }," 然后跟着下一个概念的注释
const afterDupStart = content.indexOf('  },\n  // ═══════════════════════════════════════════════════════════', idx + marker.length);
if (afterDupStart === -1) {
  console.log('未找到重复段结束位置');
  process.exit(1);
}

const dupEnd = afterDupStart + '  },\n'.length;
console.log('重复段结束位置:', dupEnd);

// 保留重复段之前的内容 + 重复段结束之后的内容
const before = content.substring(0, idx);
const after = content.substring(dupEnd);
const fixed = before + after;

// 验证修复后的内容没有语法错误
try {
  new Function(fixed.replace(/^export\s+/gm, 'var '));
  console.log('语法检查通过');
} catch (e) {
  console.error('语法错误:', e.message);
  process.exit(1);
}

// 写入修复后的文件
fs.writeFileSync(filePath, fixed, 'utf8');
console.log('已修复 concepts.js');
