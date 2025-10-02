import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function getTokenForTesting() {
  console.log('🔐 Auth0 Token Generator for Testing');
  console.log('=====================================');

  const auth0Domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_CLIENT_ID;
  const clientSecret = process.env.AUTH0_CLIENT_SECRET;
  const audience = process.env.AUTH0_AUDIENCE;

  console.log(`🌐 Auth0 Domain: ${auth0Domain}`);
  console.log(`🔑 Client ID: ${clientId}`);
  console.log(`🎯 Audience: ${audience}`);
  console.log(`🔒 Client Secret: ${clientSecret ? '***' + clientSecret.slice(-4) : 'NOT SET'}`);

  if (!auth0Domain || !clientId || !clientSecret || !audience) {
    console.error('❌ Missing required Auth0 environment variables:');
    console.error('   - AUTH0_DOMAIN');
    console.error('   - AUTH0_CLIENT_ID');
    console.error('   - AUTH0_CLIENT_SECRET');
    console.error('   - AUTH0_AUDIENCE');
    process.exit(1);
  }

  try {
    console.log('\n📡 Requesting token from Auth0...');

    const response = await fetch(`https://${auth0Domain}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        audience: audience,
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json() as { access_token: string; token_type: string; expires_in: number };

    console.log('\n✅ Token generated successfully!');
    console.log('=====================================');
    console.log('🎟️  ACCESS TOKEN:');
    console.log(data.access_token);
    console.log('\n📝 Token Info:');
    console.log(`   Type: ${data.token_type}`);
    console.log(`   Expires in: ${data.expires_in} seconds (${Math.round(data.expires_in / 60)} minutes)`);

    console.log('\n🧪 Test with curl:');
    console.log(`curl -H "Authorization: Bearer ${data.access_token}" http://localhost:3001/api/auth-test/protected`);

    console.log('\n📋 Or copy this token to use in your tests:');
    console.log(`Bearer ${data.access_token}`);

    return data.access_token;

  } catch (error) {
    console.error('\n❌ Failed to get token:');
    console.error(error);

    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('403')) {
        console.log('\n💡 Possible issues:');
        console.log('   - Check your AUTH0_CLIENT_SECRET is correct');
        console.log('   - Verify the client has access to the API');
        console.log('   - Ensure the audience matches your API identifier');
      } else if (error.message.includes('404')) {
        console.log('\n💡 Check your AUTH0_DOMAIN is correct');
      }
    }

    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  getTokenForTesting().catch(console.error);
}

export { getTokenForTesting };