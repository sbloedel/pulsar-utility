const Pulsar = require('pulsar-client');
require('dotenv').config();

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

  try {
    // Create a consumer
    const consumer = await client.subscribe({
      topic: process.env.PULSAR_TOPIC,
      subscription: process.env.PULSAR_SUBSCRIPTION,
      subscriptionType: 'Shared', // Options: 'Exclusive', 'Shared', 'Failover', 'KeyShared'
      subscriptionInitialPosition: 'Latest', // Options: 'Latest', 'Earliest'
    });

    console.log('Pulsar consumer created successfully');
    console.log('Topic:', process.env.PULSAR_TOPIC);
    console.log('Subscription:', process.env.PULSAR_SUBSCRIPTION);
    console.log('Listening for messages...');

    // Start consuming messages
    while (true) {
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
        console.error('Error receiving message:', error);
        // Wait a bit before trying again
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  } catch (error) {
    console.error('Error creating consumer:', error);
  } finally {
    // Clean up resources
    await client.close();
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start the consumer
createConsumer().catch(console.error);
