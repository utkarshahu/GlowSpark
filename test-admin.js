async function testAdmin() {
  try {
    console.log("Logging in...");
    let loginRes = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@glowspark.com', password: 'admin123' })
    });
    
    if (!loginRes.ok) {
        throw new Error(`Login failed: ${loginRes.status}`);
    }
    
    const cookies = loginRes.headers.get('set-cookie');
    console.log("Cookies:", cookies);
    
    console.log("Fetching orders...");
    let ordersRes = await fetch('http://localhost:8080/api/admin/orders', {
      headers: { 'Cookie': cookies }
    });
    let ordersData = await ordersRes.json();
    console.log("Orders count:", ordersData.orders?.length);

    console.log("Fetching users...");
    let usersRes = await fetch('http://localhost:8080/api/admin/users', {
      headers: { 'Cookie': cookies }
    });
    let usersData = await usersRes.json();
    console.log("Users count:", usersData.users?.length);

    console.log("All tests passed!");
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testAdmin();
