const fs = require('fs');
const path = require('path');

/**
 * Loads environment-specific configuration
 * Priority order: CLI argument > NODE_ENV > default (.env)
 */
function loadEnvironmentConfig() {
  // Get environment from command line argument or NODE_ENV
  const envArg = process.argv.find(arg => arg.startsWith('--env='));
  const environment = envArg 
    ? envArg.split('=')[1] 
    : process.env.NODE_ENV || 'development';
  
  console.log(`🌍 Loading configuration for environment: ${environment}`);
  
  // Determine which .env file to load
  let envFile;
  const envFiles = {
    'development': '.env.dev',
    'dev': '.env.dev',
    'qa': '.env.qa',
    'stage': '.env.stage',
    'staging': '.env.stage',
    'production': '.env.prod',
    'prod': '.env.prod'
  };
  
  envFile = envFiles[environment.toLowerCase()];
  
  // Fallback to default .env if specific environment file not found
  if (!envFile) {
    console.log(`⚠️  Unknown environment '${environment}', falling back to default .env file`);
    envFile = '.env';
  }
  
  const envPath = path.join(__dirname, envFile);
  
  // Check if the environment file exists
  if (!fs.existsSync(envPath)) {
    console.error(`❌ Environment file not found: ${envFile}`);
    console.log('Available environment files:');
    
    // List available .env files
    const files = fs.readdirSync(__dirname)
      .filter(file => file.startsWith('.env'))
      .sort();
    
    files.forEach(file => {
      const env = file === '.env' ? 'default' : file.replace('.env.', '');
      console.log(`   ${file} (${env})`);
    });
    
    process.exit(1);
  }
  
  // Load the environment file
  require('dotenv').config({ path: envPath });
  
  console.log(`✅ Loaded configuration from: ${envFile}`);
  console.log(`🏷️  Environment: ${process.env.NODE_ENV || 'not set'}`);
  
  return {
    environment,
    envFile,
    nodeEnv: process.env.NODE_ENV
  };
}

module.exports = { loadEnvironmentConfig };
