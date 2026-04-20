#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env');

console.log('🚀 Sauce Labs Setup for Mux Background Video');
console.log('============================================\n');

console.log('To run tests on Sauce Labs mobile devices, you need to:');
console.log('1. Sign up for a Sauce Labs account at https://saucelabs.com/');
console.log('2. Get your username and access key from your account settings');
console.log('3. Set up environment variables\n');

const readline = createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('Enter your Sauce Labs username: ', (username) => {
  readline.question('Enter your Sauce Labs access key: ', (accessKey) => {
    readline.close();
    
    const envContent = `# Sauce Labs Configuration
# Get these from your Sauce Labs account: https://app.saucelabs.com/user-settings
SAUCELABS_USERNAME=${username}
SAUCELABS_ACCESS_KEY=${accessKey}
`;

    try {
      fs.writeFileSync(envPath, envContent);
      console.log('\n✅ Sauce Labs configuration saved to .env file');
      console.log('\nYou can now run mobile tests with:');
      console.log('npm run test:saucelabs');
      console.log('\nNote: The .env file is already added to .gitignore for security');
    } catch (error) {
      console.error('\n❌ Error saving configuration:', error.message);
      console.log('\nPlease create a .env file manually with:');
      console.log('SAUCELABS_USERNAME=your_username');
      console.log('SAUCELABS_ACCESS_KEY=your_access_key');
    }
  });
});
