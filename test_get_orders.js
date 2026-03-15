import fetch from 'node-fetch';

const URL = 'http://localhost:5005/graphql';

async function run() {
    // 1. Login to get token
    const loginRes = await fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `
        mutation {
          login(email: "tam@gmail.com", password: "123") {
            token
          }
        }
      `
        })
    });
    const loginData = await loginRes.json();
    const token = loginData.data?.login?.token;
    
    if (!token) {
      console.log("Login failed. Make sure tam@gmail.com exists with password 123.");
      return;
    }

    console.log("Login success, token found.");

    // 2. Fetch Orders
    const ordersRes = await fetch(URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            query: `
        query {
          getOrders {
            id
            totalAmount
            status
            paymentStatus
            createdAt
          }
        }
      `
        })
    });
    
    const result = await ordersRes.json();
    console.log("GetOrders Result:", JSON.stringify(result, null, 2));
}

run();
