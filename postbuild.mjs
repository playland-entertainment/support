import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import prettier from 'prettier';

const distDir = join(fileURLToPath(import.meta.url), '..', 'dist');

function findHtmlFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...findHtmlFiles(full));
    } else if (entry.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

for (const filePath of findHtmlFiles(distDir)) {
  const rel = relative(distDir, filePath);
  const depth = rel.split('/').length - 1;
  const prefix = depth === 0 ? './' : '../'.repeat(depth);

  let content = readFileSync(filePath, 'utf-8');
  content = content.replace(/((?:href|src|action)=")\/(?!\/)/g, `$1${prefix}`);
  content = await prettier.format(content, { parser: 'html', printWidth: 120 });
  writeFileSync(filePath, content, 'utf-8');
  console.log(`  ${rel}`);
}

console.log('Done.');
