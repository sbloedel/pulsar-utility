# Pulsar Consumer Utility

A basic Node.js consumer for Apache Pulsar with OAuth2 authentication that writes message payloads to the console.

## Prerequisites

- Node.js (version 12 or higher)
- Apache Pulsar broker running with OAuth2 authentication enabled
- OAuth2 credentials (client_id, client_secret, issuer_url)

## Installation

Install the dependencies:

```bash
npm install
```

## Configuration

### Environment Setup

1. The `.env` file has been created with your current configuration
2. Verify your environment configuration:
   ```bash
   npm run check-env
   ```
3. If needed, edit the `.env` file to update any values

### Environment Variables

All configuration is now handled through environment variables in the `.env` file:

```env
# OAuth2 Provider Configuration (Required)
OAUTH2_ISSUER_URL=your-issuer-url
OAUTH2_CLIENT_ID=your-client-id
OAUTH2_CLIENT_SECRET=your-client-secret
OAUTH2_AUDIENCE=your-audience

# Pulsar Configuration (Required)
PULSAR_SERVICE_URL=your-service-url
PULSAR_TOPIC=your-topic
PULSAR_SUBSCRIPTION=my-subscription

# Optional OAuth2 Configuration
OAUTH2_SCOPE=pulsar:read pulsar:write
```

### OAuth2 Configuration Parameters

- **OAUTH2_ISSUER_URL**: The OAuth2 provider's issuer URL (e.g., Keycloak, Auth0, etc.)
- **OAUTH2_CLIENT_ID**: Your OAuth2 client identifier
- **OAUTH2_CLIENT_SECRET**: Your OAuth2 client secret
- **OAUTH2_AUDIENCE**: (Optional) The intended audience for the token
- **OAUTH2_SCOPE**: (Optional) Space-separated list of requested scopes

### Supported OAuth2 Providers

This consumer supports OAuth2 providers that implement the Client Credentials flow, such as:
- Keycloak
- Auth0
- Okta
- Azure AD
- AWS Cognito
- Google Cloud Identity

## Usage

1. **Check your environment configuration** (recommended):
   ```bash
   npm run check-env
   ```

2. **Run the consumer**:
   ```bash
   npm start
   ```

   Or directly with Node.js:
   ```bash
   node consumer.js
   ```

## Features

- Connects to Pulsar broker using OAuth2 authentication
- Supports SSL/TLS connections
- Subscribes to a specified topic
- Continuously listens for messages
- Displays message details including:
  - Topic name
  - Message payload
  - Message ID
  - Publish timestamp
- Acknowledges messages after processing
- Graceful shutdown handling (Ctrl+C)
- Environment-based configuration

## Example Output

```
Initializing Pulsar client with OAuth2 authentication...
Issuer URL: https://your-oauth-provider.com
Client ID: your-client-id
Audience: pulsar
Pulsar consumer created successfully
Topic: your-topic
Subscription: my-subscription
Listening for messages...
Received message:
  Topic: persistent://public/default/your-topic
  Payload: {"id": "12345", "data": "Hello, Pulsar!"}
  Message ID: CAAQAw==
  Publish Time: Thu Sep 04 2025 10:30:45 GMT-0700 (PDT)
---
```

## Subscription Types

- **Exclusive**: Only one consumer can subscribe to the topic
- **Shared**: Multiple consumers can subscribe, messages are distributed
- **Failover**: Multiple consumers, but only one is active at a time
- **KeyShared**: Messages with the same key go to the same consumer

## Troubleshooting

### OAuth2 Authentication Issues

- **Invalid client credentials**: Verify `OAUTH2_CLIENT_ID` and `OAUTH2_CLIENT_SECRET` are correct
- **Invalid issuer URL**: Ensure `OAUTH2_ISSUER_URL` points to the correct OAuth2 provider endpoint
- **Token scope issues**: Check that the OAuth2 client has the necessary scopes for Pulsar access
- **Network connectivity**: Verify the client can reach both the OAuth2 issuer and Pulsar broker
- **SSL certificate issues**: For development, you may need to set `tlsAllowInsecureConnection: true`

### General Issues

- Ensure Pulsar broker is running and accessible
- Check that the topic exists or enable auto-creation
- Verify network connectivity to the Pulsar broker
- Check Pulsar broker logs for any authentication errors
- Ensure the OAuth2 provider is configured to allow the client credentials flow

### Common OAuth2 Errors

- **401 Unauthorized**: Check client credentials and ensure the client is registered with the OAuth2 provider
- **403 Forbidden**: Verify the client has the required permissions/scopes for the Pulsar resources
- **SSL Handshake errors**: Check certificate validity and network connectivity
