// @ts-check
const axios = require('axios');

async function testRegistrationFlow() {
  const API_URL = 'http://localhost:3000/api/proxy';

  console.log('\n🧪 Testing Registration Flow\n');

  // Test 1: Valid Registration
  try {
    console.log('Test 1: Valid Registration');
    const response = await axios.post(`${API_URL}/better-auth/register`, {
      email: `test${Date.now()}@example.com`,
      password: 'Test@1234',
      confirmPassword: 'Test@1234',
      firstName: 'Test',
      lastName: 'User',
      username: `testuser${Date.now()}`,
    });
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }

  // Test 2: Duplicate Email
  try {
    console.log('\nTest 2: Duplicate Email');
    await axios.post(`${API_URL}/better-auth/register`, {
      email: 'test@example.com', // Already registered
      password: 'Test@1234',
      confirmPassword: 'Test@1234',
      firstName: 'Test',
      lastName: 'User',
      username: `testuser${Date.now()}`,
    });
  } catch (error) {
    console.log('✅ Expected Error:', error.response?.data || error.message);
  }

  // Test 3: Password Mismatch
  try {
    console.log('\nTest 3: Password Mismatch');
    await axios.post(`${API_URL}/better-auth/register`, {
      email: `test${Date.now()}@example.com`,
      password: 'Test@1234',
      confirmPassword: 'Test@12345', // Different password
      firstName: 'Test',
      lastName: 'User',
      username: `testuser${Date.now()}`,
    });
  } catch (error) {
    console.log('✅ Expected Error:', error.response?.data || error.message);
  }

  // Test 4: Invalid Email Format
  try {
    console.log('\nTest 4: Invalid Email Format');
    await axios.post(`${API_URL}/better-auth/register`, {
      email: 'invalid-email',
      password: 'Test@1234',
      confirmPassword: 'Test@1234',
      firstName: 'Test',
      lastName: 'User',
      username: `testuser${Date.now()}`,
    });
  } catch (error) {
    console.log('✅ Expected Error:', error.response?.data || error.message);
  }
}

testRegistrationFlow();
