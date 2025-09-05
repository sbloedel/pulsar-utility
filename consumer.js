const Pulsar = require('pulsar-client');
require('dotenv').config();

// Global references for cleanup
let globalConsumer = null;
let globalClient = null;
let shouldExit = false;

async function cleanupResources() {
  console.log('🧹 Cleaning up Pulsar resources...');
  
  try {
    if (globalConsumer) {
      console.log('📦 Unsubscribing consumer...');
      await globalConsumer.unsubscribe();
      await globalConsumer.close();
      console.log('✅ Consumer unsubscribed successfully');
      globalConsumer = null;
    }
    
    if (globalClient) {
      console.log('🔌 Closing Pulsar client...');
      await globalClient.close();
      console.log('✅ Pulsar client closed successfully');
      globalClient = null;
    }
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

async function createConsumer() {
  // Check for required environment variables
  const requiredEnvVars = [
    'OAUTH2_ISSUER_URL', 
    'OAUTH2_CLIENT_ID', 
    'OAUTH2_CLIENT_SECRET', 
    'OAUTH2_AUDIENCE',
    'PULSAR_SERVICE_URL',
    'PULSAR_TOPIC',
    'PULSAR_SUBSCRIPTION'
  ];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars.join(', '));
    console.error('Please check your .env file and ensure all required variables are set.');
    process.exit(1);
  }

  // OAuth2 configuration
  const oauth2Config = {
    type: 'client_credentials', // Grant type
    issuer_url: process.env.OAUTH2_ISSUER_URL,
    client_id: process.env.OAUTH2_CLIENT_ID,
    client_secret: process.env.OAUTH2_CLIENT_SECRET,
    audience: process.env.OAUTH2_AUDIENCE,
    scope: process.env.OAUTH2_SCOPE, // Optional
  };

  console.log('Initializing Pulsar client with OAuth2 authentication...');
  console.log('Issuer URL:', oauth2Config.issuer_url);
  console.log('Client ID:', oauth2Config.client_id);
  console.log('Audience:', oauth2Config.audience);

  // Create a Pulsar client with OAuth2 authentication
  const client = new Pulsar.Client({
    serviceUrl: process.env.PULSAR_SERVICE_URL,
    authentication: new Pulsar.AuthenticationOauth2(oauth2Config),
    tlsAllowInsecureConnection: false, // Set to true only for development/testing
    tlsValidateHostname: true, // Set to false only for development/testing
  });

  // Store global reference for cleanup
  globalClient = client;

  try {
    // Create a consumer
    const consumer = await client.subscribe({
      topic: process.env.PULSAR_TOPIC,
      subscription: process.env.PULSAR_SUBSCRIPTION,
      subscriptionType: 'Shared', // Options: 'Exclusive', 'Shared', 'Failover', 'KeyShared'
      subscriptionInitialPosition: 'Latest', // Options: 'Latest', 'Earliest'
    });

    // Store global reference for cleanup
    globalConsumer = consumer;

    console.log('Pulsar consumer created successfully');
    console.log('Topic:', process.env.PULSAR_TOPIC);
    console.log('Subscription:', process.env.PULSAR_SUBSCRIPTION);
    console.log('Listening for messages...');

    // Start consuming messages
    while (!shouldExit) {
      try {
        const message = await consumer.receive();
        
        // Get message payload and convert to string
        const payload = message.getData().toString();
        
        // Write message payload to console
        console.log('Received message:');
        console.log('  Topic:', message.getTopicName());
        console.log('  Payload:', payload);
        console.log('  Message ID:', message.getMessageId().toString());
        console.log('  Publish Time:', new Date(message.getPublishTimestamp()));
        console.log('---');

        // Acknowledge the message
        await consumer.acknowledge(message);
        
      } catch (error) {
        if (!shouldExit) {
          console.error('Error receiving message:', error);
          // Wait a bit before trying again
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
  } catch (error) {
    console.error('Error creating consumer:', error);
  } finally {
    // Clean up resources
    await cleanupResources();
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  shouldExit = true;
  await cleanupResources();
  console.log('👋 Shutdown complete');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  shouldExit = true;
  await cleanupResources();
  console.log('👋 Shutdown complete');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('💥 Uncaught Exception:', error);
  shouldExit = true;
  await cleanupResources();
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', async (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  shouldExit = true;
  await cleanupResources();
  process.exit(1);
});

// Start the consumer
createConsumer().catch(console.error);
