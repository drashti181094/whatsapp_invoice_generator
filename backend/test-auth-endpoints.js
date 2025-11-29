const http = require('http');

async function testAuth() {
  const registerData = JSON.stringify({
    name: 'Test User',
    email: 'test' + Date.now() + '@example.com',
    password: 'password123'
  });

  const loginData = (email) => JSON.stringify({
    email: email,
    password: 'password123'
  });

  const request = (path, method, data) => {
    return new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/auth/' + path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      }, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  };

  try {
    console.log('Testing Register...');
    const regRes = await request('register', 'POST', registerData);
    console.log('Register Status:', regRes.status);
    console.log('Register Body:', regRes.body);

    if (regRes.status === 201) {
      console.log('Testing Login...');
      const email = JSON.parse(registerData).email;
      const loginRes = await request('login', 'POST', loginData(email));
      console.log('Login Status:', loginRes.status);
      console.log('Login Body:', loginRes.body);
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

// Wait for server to start
setTimeout(testAuth, 5000);
