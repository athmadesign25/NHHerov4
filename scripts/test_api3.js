const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

https.get('https://172.19.1.11:9870/search.html', { agent }, (res) => {
  let body = '';
  res.on('data', c => (body += c));
  res.on('end', () => {
    // Find where params is built
    const idx = body.indexOf('params.append');
    if (idx > -1) {
      console.log('=== params building ===');
      console.log(body.slice(Math.max(0, idx - 1000), idx + 500));
    }
  });
}).on('error', e => console.error(e.message));
