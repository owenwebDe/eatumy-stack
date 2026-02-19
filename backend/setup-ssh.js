const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
const config = {
  host: '192.210.239.211',
  port: 22,
  username: 'admins',
  password: 'UselessPassword4U!123'
};

// Start 
console.log('Reading public key...');
const publicKeyPath = 'C:\\Users\\Admin\\.ssh\\id_rsa.pub';
let publicKey;

try {
    publicKey = fs.readFileSync(publicKeyPath, 'utf8').trim();
    console.log('Public key read successfully.');
} catch (e) {
    console.error('Failed to read public key:', e.message);
    process.exit(1);
}

conn.on('ready', () => {
  console.log('SSH Connection :: Ready');
  
  const cmd = `mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo "${publicKey}" >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo "Key added successfully"`;
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
       if (code === 0) {
          console.log('SUCCESS: SSH Key authentication set up.');
      } else {
          console.error('FAILURE: Could not set up keys.');
      }
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).on('error', (err) => {
    console.error('Connection Error:', err);
}).connect(config);
