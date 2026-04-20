import fs from 'fs';

const path = 'public/images/logo-soybienestar.svg';
let svg = fs.readFileSync(path, 'utf8');

// Replace the specific background rectangle with an empty string
// Using string replacement or regex
svg = svg.replace(/<path d="M0,0h281\.71828v300h-281\.71828z" fill="#ffffff"\/>/g, '');

fs.writeFileSync(path, svg);
console.log('SVG fixed');
