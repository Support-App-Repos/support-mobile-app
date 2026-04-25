/**
 * Converts src/assets/images/svgs/amenties/*.svg to TSX components in
 * src/components/common/amenities/
 */
const fs = require('fs');
const path = require('path');

const SVG_DIR = path.join(__dirname, '../src/assets/images/svgs/amenties');
const OUT_DIR = path.join(__dirname, '../src/components/common/amenities');

function stemToComponentName(stem) {
  const parts = stem.split('_').map((p) => p.charAt(0).toUpperCase() + p.slice(1));
  return `Amenity${parts.join('')}Icon`;
}

function kebabAttrsToJsx(s) {
  const map = {
    'clip-path': 'clipPath',
    'stroke-width': 'strokeWidth',
    'stroke-linecap': 'strokeLinecap',
    'stroke-linejoin': 'strokeLinejoin',
    'stroke-miterlimit': 'strokeMiterlimit',
    'fill-rule': 'fillRule',
    'fill-opacity': 'fillOpacity',
    'stroke-opacity': 'strokeOpacity',
    'mask-type': 'maskType',
  };
  let out = s;
  for (const [k, v] of Object.entries(map)) {
    out = out.split(k + '=').join(v + '=');
  }
  return out;
}

function renameIds(inner, prefix) {
  const ids = new Set();
  const re = /\bid="([^"]+)"/g;
  let m;
  while ((m = re.exec(inner))) ids.add(m[1]);
  let s = inner;
  for (const oldId of ids) {
    const neu = `${prefix}_${oldId.replace(/[^a-zA-Z0-9_]/g, '_')}`;
    s = s.split(`id="${oldId}"`).join(`id="${neu}"`);
    s = s.split(`url(#${oldId})`).join(`url(#${neu})`);
  }
  return s;
}

function swapBrandColors(s) {
  return s
    .replace(/fill="#D13A3F"/g, 'fill={color}')
    .replace(/stroke="#D13A3F"/g, 'stroke={color}');
}

function tagsToPascal(s) {
  const tags = ['path', 'rect', 'g', 'mask', 'defs', 'clipPath'];
  for (const t of tags) {
    const T = t === 'clipPath' ? 'ClipPath' : t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
    const reOpen = new RegExp(`<${t}(\\s|/|>)`, 'gi');
    s = s.replace(reOpen, `<${T}$1`);
    const reClose = new RegExp(`</${t}>`, 'gi');
    s = s.replace(reClose, `</${T}>`);
  }
  return s;
}

function extractSvgParts(fileContent) {
  const vbMatch = fileContent.match(/viewBox="([^"]+)"/);
  const viewBox = vbMatch ? vbMatch[1] : '0 0 24 24';
  const innerMatch = fileContent.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
  if (!innerMatch) throw new Error('No svg root');
  let inner = innerMatch[1].trim();
  return { viewBox, inner };
}

function svgImportsForInner(inner) {
  const set = new Set(['Svg']);
  if (inner.includes('<Path')) set.add('Path');
  if (inner.includes('<Rect')) set.add('Rect');
  if (inner.includes('<G')) set.add('G');
  if (inner.includes('<Mask')) set.add('Mask');
  if (inner.includes('<Defs')) set.add('Defs');
  if (inner.includes('<ClipPath')) set.add('ClipPath');
  const named = [...set].filter((x) => x !== 'Svg').sort();
  if (named.length === 0) named.push('Path');
  return `import Svg, { ${named.join(', ')} } from 'react-native-svg';`;
}

function generateFile(stem, fileContent) {
  const { viewBox, inner: rawInner } = extractSvgParts(fileContent);
  const idPrefix = `amenity_${stem.replace(/[^a-zA-Z0-9]/g, '_')}`;
  let inner = renameIds(rawInner, idPrefix);
  inner = kebabAttrsToJsx(inner);
  inner = swapBrandColors(inner);
  inner = tagsToPascal(inner);

  const componentName = stemToComponentName(stem);
  const importLine = svgImportsForInner(inner);

  const tsx = `import React from 'react';
${importLine}
import { ViewStyle } from 'react-native';

export interface ${componentName}Props {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const ${componentName}: React.FC<${componentName}Props> = ({
  size = 24,
  color = '#D13A3F',
  style,
}) => (
  <Svg width={size} height={size} viewBox="${viewBox}" fill="none" style={style}>
${inner
  .split('\n')
  .map((line) => '    ' + line)
  .join('\n')}
  </Svg>
);
`;
  return tsx;
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const files = fs.readdirSync(SVG_DIR).filter((f) => f.endsWith('.svg'));
const iconExports = [];

for (const f of files) {
  const stem = f.replace(/\.svg$/i, '');
  const content = fs.readFileSync(path.join(SVG_DIR, f), 'utf8');
  const componentName = stemToComponentName(stem);
  const tsx = generateFile(stem, content);
  const outPath = path.join(OUT_DIR, `${componentName}.tsx`);
  fs.writeFileSync(outPath, tsx, 'utf8');
  iconExports.push({ stem, componentName });
}

// index.ts barrel
const barrel = `/**
 * Property amenity glyphs (inlined SVG, themeable via color)
 */

${iconExports.map((e) => `export { ${e.componentName} } from './${e.componentName}';`).join('\n')}
`;
fs.writeFileSync(path.join(OUT_DIR, 'index.ts'), barrel, 'utf8');

console.log(`Wrote ${iconExports.length} icons to ${OUT_DIR}`);
