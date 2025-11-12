// Simple test script to verify API endpoints
const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
  try {
    console.log('Testing API endpoints...\n');

    // Test Registration
    console.log('1. Testing Registration...');
    const registerResponse = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
    });
    const registerData = await registerResponse.json();
    console.log('Register Response:', registerData);

    if (registerData.token) {
      const token = registerData.token;

      // Test Add Customer
      console.log('\n2. Testing Add Customer...');
      const customerResponse = await fetch(`${BASE_URL}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890'
        })
      });
      const customerData = await customerResponse.json();
      console.log('Customer Response:', customerData);

      if (customerData._id) {
        // Test Add Test
        console.log('\n3. Testing Add Test...');
        const testResponse = await fetch(`${BASE_URL}/tests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            testName: 'Blood Test',
            testType: 'Laboratory',
            result: 'Normal',
            customerId: customerData._id
          })
        });
        const testData = await testResponse.json();
        console.log('Test Response:', testData);
      }

      // Get All Customers
      console.log('\n4. Getting All Customers...');
      const allCustomersResponse = await fetch(`${BASE_URL}/customers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const allCustomers = await allCustomersResponse.json();
      console.log('All Customers:', allCustomers);

      // Get All Tests
      console.log('\n5. Getting All Tests...');
      const allTestsResponse = await fetch(`${BASE_URL}/tests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const allTests = await allTestsResponse.json();
      console.log('All Tests:', allTests);
    }

  } catch (error) {
    console.error('Error testing API:', error);
  }
}

// Run test after a delay to ensure server is running
setTimeout(testAPI, 2000);