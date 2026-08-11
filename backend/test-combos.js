const http = require('http');

http.get('http://localhost:4000/api/v1/combos', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`BODY: ${data}`);
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
