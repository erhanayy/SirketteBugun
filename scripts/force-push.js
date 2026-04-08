const { spawn } = require('child_process');

const child = spawn('cmd', ['/c', 'npx drizzle-kit push'], {
  stdio: ['pipe', 'pipe', 'pipe'] // pipe stdio
});

child.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(`STDOUT: ${output}`);
  
  // Check for prompts
  if (output.includes('created or renamed') || output.includes('❯')) {
      console.log('Detected prompt, sending newline...');
      child.stdin.write('\n');
  }
});

child.stderr.on('data', (data) => {
  console.error(`STDERR: ${data}`);
});

child.on('close', (code) => {
  console.log(`Child process exited with code ${code}`);
});
