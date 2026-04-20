import fs from 'fs';
import path from 'path';

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': 'AI-Studio-Agent' }});
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${url}`);
  const arrayBuffer = await res.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(arrayBuffer));
  console.log(`Downloaded ${dest} (${arrayBuffer.byteLength} bytes)`);
}

async function run() {
  const repos = [
    'https://api.github.com/repos/davidcaparrosgarcia-alt/Websoybienestar/git/trees/main?recursive=1',
    'https://api.github.com/repos/davidcaparrosgarcia-alt/Websoybienestar/git/trees/master?recursive=1'
  ];
  
  let tree = [];
  let branch = 'main';
  for (const url of repos) {
    const res = await fetch(url, { headers: { 'User-Agent': 'AI-Studio-Agent' }});
    if (res.ok) {
      const data = await res.json();
      tree = data.tree;
      branch = url.includes('main') ? 'main' : 'master';
      break;
    }
  }

  if (!tree || tree.length === 0) {
    console.log("Could not fetch repo tree or tree is empty.");
    return;
  }

  const filesPaths = tree.filter(t => [
    'fondo-zen.jpg',
    'fondo-faro.jpg',
    'info-ansiedad.jpg',
    'info-estres.jpg',
    'info-insomnio.jpg',
    'info-procrastinacion.jpg',
    'info-rumiacion.jpg',
    'info-emociones.jpg',
    'info-alimentacion.jpg',
    'logo-soybienestar.svg'
  ].some(name => t.path.includes(name))).map(t => t.path);
  
  if (!fs.existsSync('public/images')) {
    fs.mkdirSync('public/images', { recursive: true });
  }

  for (const filePath of filesPaths) {
     const rawUrl = `https://raw.githubusercontent.com/davidcaparrosgarcia-alt/Websoybienestar/${branch}/${filePath}`;
     const fileName = path.basename(filePath);
     await download(rawUrl, `public/images/${fileName}`);
  }
}

run().catch(console.error);
