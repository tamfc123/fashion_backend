import fetch from 'node-fetch';

const URL = 'http://localhost:5005/graphql';

async function run() {
    const randStr = Math.random().toString(36).substring(7);
    const loginRes = await fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `
        mutation {
          register(input: { email: "${randStr}@test.com", password: "123", name: "Test" }) {
            token
          }
        }
      `
        })
    });
    const loginData = await loginRes.json();
    const token = loginData.data?.register?.token;
    if (!token) return console.log("Login failed", loginData);

    const prodRes = await fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `
        query {
          getProducts {
            data {
              id
              variants {
                id
              }
            }
          }
        }
      `
        })
    });
    const prodData = await prodRes.json();
    const product = prodData.data.getProducts.data[0];
    const variantId = product.variants[0].id;

    await fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
            query: `
        mutation {
          addToCart(input: { productId: "${product.id}", variantId: "${variantId}", quantity: 1 }) {
            id
          }
        }
      `
        })
    });

    const checkoutRes = await fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
            query: `
        mutation {
          checkout(input: { shippingAddress: "123 Test", phone: "099999999", paymentMethod: "VNPAY" }) {
            id
            userId
            shippingAddress
            phone
            items {
              productId
              variantId
              productName
              size
              color
              quantity
              priceAtPurchase
            }
            totalAmount
            status
            paymentMethod
            paymentStatus
            paymentUrl
            createdAt
            updatedAt
          }
        }
      `
        })
    });
    console.log(JSON.stringify(await checkoutRes.json(), null, 2));
}
run();
