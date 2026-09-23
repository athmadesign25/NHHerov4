const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

https.get('https://172.19.1.11:9870/search.html', { agent }, (res) => {
  let body = '';
  res.on('data', c => (body += c));
  res.on('end', () => {
    // Find all calls to search() function
    const searchCalls = body.match(/search\([^)]*\)/g);
    console.log('search() calls:', [...new Set(searchCalls)]);

    // Also check what type=4 means
    const type4 = body.match(/type.*4[^;]{0,100}/g);
    console.log('type=4 context:', type4 ? type4.slice(0,5) : 'none');
  });
}).on('error', e => console.error(e.message));
