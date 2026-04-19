const fs = require('fs');
const path = require('path');

const dirs = ['src/pages', 'src/components'];
let imageUrls = new Set();
let fileMappings = {};

dirs.forEach(dir => {
    fs.readdirSync(dir).forEach(file => {
        if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            const filePath = path.join(dir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const regex = /https:\/\/lh3.googleusercontent.com\/[-a-zA-Z0-9@:%_\+.~#?&//=]+/g;
            let match;
            while ((match = regex.exec(content)) !== null) {
                imageUrls.add(match[0]);
                if (!fileMappings[filePath]) fileMappings[filePath] = [];
                fileMappings[filePath].push(match[0]);
            }
        }
    });
});

console.log('Found urls: ', imageUrls.size);
if (!fs.existsSync('public/images')) {
   fs.mkdirSync('public/images', { recursive: true });
}

let count = 0;
Array.from(imageUrls).forEach((url, i) => {
    let filename = `img_${i}.jpg`;
    let localPath = path.join('public/images', filename);
    let relativePath = `/images/${filename}`;
    
    for (let file in fileMappings) {
        if (fileMappings[file].includes(url)) {
            let content = fs.readFileSync(file, 'utf8');
            content = content.split(url).join(relativePath);
            fs.writeFileSync(file, content);
        }
    }
    
    require('child_process').execSync('curl -sL "' + url + '" -o "' + localPath + '"');
    count++;
});
console.log('Done replacing and downloading.');
