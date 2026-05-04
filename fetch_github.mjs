import fs from 'fs';
import path from 'path';

async function download(url, dest) {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

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

  // Find all files in public/images, public/videos, and public/audios
  const filesPaths = tree.filter(t => 
    t.type === 'blob' && 
    (t.path.startsWith('public/images/') || 
     t.path.startsWith('public/videos/') || 
     t.path.startsWith('public/audios/'))
  ).map(t => t.path);
  
  for (const filePath of filesPaths) {
     const rawUrl = `https://raw.githubusercontent.com/davidcaparrosgarcia-alt/Websoybienestar/${branch}/${filePath}`;
     // Download maintaining file structure
     await download(rawUrl, filePath);
  }
}

run().catch(console.error);
