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
            if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
                results.push(filePath);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let lines = content.split('\n');
    let changed = false;

    const PREFIX = '`http://${window.location.hostname}:5000';

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.includes(PREFIX)) {
            // Find the index of the prefix
            let idx = line.indexOf(PREFIX);
            // Move forward until we find ' or " or `
            let endIdx = -1;
            let endQuote = '';
            for (let j = idx + PREFIX.length; j < line.length; j++) {
                if (line[j] === "'" || line[j] === '"' || line[j] === '`') {
                    endIdx = j;
                    endQuote = line[j];
                    break;
                }
            }

            if (endIdx !== -1 && (endQuote === "'" || endQuote === '"')) {
                // We found a mismatched quote ending! Let's replace it with `
                let newLine = line.substring(0, endIdx) + '`' + line.substring(endIdx + 1);
                lines[i] = newLine;
                changed = true;
                console.log('Fixed line in ' + file + ' -> ' + newLine.trim());
            }
        }
    }

    if (changed) {
        fs.writeFileSync(file, lines.join('\n'));
    }
});
