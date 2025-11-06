// Quick test script for Gemini API
const axios = require('axios');
require('dotenv').config();

// Load API key from environment variable
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Validate API key
if (!GEMINI_API_KEY) {
  console.error('❌ ERROR: GEMINI_API_KEY environment variable is not set');
  console.log('\n💡 Please add GEMINI_API_KEY to your .env file');
  process.exit(1);
}

async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API...\n');

  try {
    const testMessage = 'Hello! Tell me about FarmChain in one sentence.';
    console.log(`📤 Sending: "${testMessage}"\n`);

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: testMessage
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
          responseModalities: ["TEXT"],
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const aiResponse = response.data.candidates[0].content.parts[0].text;
      console.log('✅ Gemini API Response:');
      console.log('─'.repeat(50));
      console.log(aiResponse);
      console.log('─'.repeat(50));
      console.log('\n✨ Success! Gemini API is working correctly.\n');
    } else {
      console.log('❌ Unexpected response format');
      console.log(JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error testing Gemini API:');
    console.error('Message:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
    console.log('\n💡 Troubleshooting:');
    console.log('1. Check your internet connection');
    console.log('2. Verify the API key is correct');
    console.log('3. Ensure Gemini API is enabled in Google Cloud Console');
  }
}

// Run the test
testGeminiAPI();
