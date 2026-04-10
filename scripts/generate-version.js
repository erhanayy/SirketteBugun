const fs = require('fs');
const path = require('path');

const versionFilePath = path.join(__dirname, '../app/version.json');
let buildNumber = 1;

if (fs.existsSync(versionFilePath)) {
    try {
        const currentData = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));
        buildNumber = (currentData.buildNumber || 0) + 1;
    } catch (e) {
        buildNumber = 1;
    }
}

// Generate Date Based version YY.MM.DD
const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '.');
const versionArray = dateStr.substring(2).split('.');
const versionStr = `v${versionArray.join('.')}-${buildNumber}`;

const output = {
    version: versionStr,
    buildNumber: buildNumber,
    timestamp: new Date().toISOString()
};

fs.writeFileSync(versionFilePath, JSON.stringify(output, null, 2));
console.log(`[Versioning] -> Successfully generated build version: ${output.version}`);
