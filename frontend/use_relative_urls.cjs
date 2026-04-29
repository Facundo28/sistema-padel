const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(filePath));
        } else {
            if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
                results.push(filePath);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));
let totalReplaced = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace `http://${window.location.hostname}:5000/api/...` with `/api/...`
    // And `http://${window.location.hostname}:5000${var}` with `${var}`
    // And `http://${window.location.hostname}:5000/uploads/...` with `/uploads/...`

    // Specifically search for 'http://${window.location.hostname}:5000' and remove it
    const searchStr = 'http://${window.location.hostname}:5000';
    
    if (content.includes(searchStr)) {
        // Just replacing the host string globally inside the content
        // e.g. `http://${window.location.hostname}:5000/api/sedes` -> `/api/sedes`
        content = content.split(searchStr).join('');
        totalReplaced++;
    }

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log('Reverted to relative paths in ' + file);
    }
});

console.log(`Finished converting ${totalReplaced} files.`);
