const esbuild = require('esbuild');

try {
    esbuild.buildSync({
        entryPoints: ['scripts/seed-contracts.ts'],
        bundle: true,
        platform: 'node',
        packages: 'external',
        outfile: 'scripts/seed-contracts.js',
    });
    console.log('Build successful');
} catch (e) {
    console.error('Build failed', e);
    process.exit(1);
}
