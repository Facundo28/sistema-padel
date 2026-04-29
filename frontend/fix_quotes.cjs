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
            if (filePath.endsWith('.jsx')) {
                results.push(filePath);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // We replace instances like: `http://${window.location.hostname}:5000/api/sedes')
    // With: `http://${window.location.hostname}:5000/api/sedes`)
    // We match `http://${window.location.hostname}:5000... then any characters until we see ' or "
    // Note: since the string is a template literal now, we need to end it with a backtick instead of ' or "
    
    // So if the string begins with `http://${window.location.hostname}:5000
    // We want to safely convert the ' or " that closes the ORIGINAL URL string into a `
    
    // A reliable way: Replace `http://${window.location.hostname}:5000[anything not containing \n, ', `, or "] with the same text, but changing the following quotes
    
    content = content.replace(/(`http:\/\/\$\{window\.location\.hostname\}:5000[^\n'"`]*)['"]/g, "$1`");

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log('Fixed ' + file);
    }
});
