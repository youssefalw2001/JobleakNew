import fs from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), 'src/components');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const replacements = [
  { search: /text-slate-600/g, replace: 'text-slate-300' },
  { search: /text-slate-500/g, replace: 'text-slate-400' },
  { search: /text-slate-700/g, replace: 'text-slate-200' },
  { search: /text-slate-800/g, replace: 'text-slate-100' },
  { search: /text-slate-900/g, replace: 'text-white' },
  { search: /text-slate-950/g, replace: 'text-white' },
  { search: /bg-white/g, replace: 'bg-slate-900' },
  { search: /bg-slate-50/g, replace: 'bg-slate-900\/50' },
  { search: /border-slate-200/g, replace: 'border-slate-700' },
  { search: /border-slate-300/g, replace: 'border-slate-600' }
];

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;
  
  for (const { search, replace } of replacements) {
    content = content.replace(search, replace);
  }

  // Also replace some font weights that look too thin
  content = content.replace(/font-light/g, 'font-normal');
  content = content.replace(/text-xs/g, 'text-sm');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
}
