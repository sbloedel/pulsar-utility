const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🔍 Environment Configuration Checker');
console.log('=====================================\n');

const requiredVars = [
  'OAUTH2_ISSUER_URL',
  'OAUTH2_CLIENT_ID', 
  'OAUTH2_CLIENT_SECRET',
  'OAUTH2_AUDIENCE',
  'PULSAR_SERVICE_URL',
  'PULSAR_TOPIC',
  'PULSAR_SUBSCRIPTION'
];

const optionalVars = [
  'OAUTH2_SCOPE'
];

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  console.log('   Please create a .env file using .env.example as a template.');
  process.exit(1);
} else {
  console.log('✅ .env file found');
}

console.log('\n📋 Required Environment Variables:');
console.log('==================================');

let allPresent = true;
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mask sensitive values
    const displayValue = varName.includes('SECRET') || varName.includes('CLIENT_ID') 
      ? `${value.substring(0, 8)}...` 
      : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`❌ ${varName}: Not set`);
    allPresent = false;
  }
});

console.log('\n📋 Optional Environment Variables:');
console.log('=================================');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value}`);
  } else {
    console.log(`⚪ ${varName}: Not set (optional)`);
  }
});

console.log('\n📊 Summary:');
console.log('===========');
if (allPresent) {
  console.log('✅ All required environment variables are configured!');
  console.log('🚀 You can now start the Pulsar consumer with: npm start');
} else {
  console.log('❌ Some required environment variables are missing.');
  console.log('   Please update your .env file and try again.');
  process.exit(1);
}
