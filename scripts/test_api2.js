const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

https.get('https://172.19.1.11:9870/search.html', { agent }, (res) => {
  let body = '';
  res.on('data', c => (body += c));
  res.on('end', () => {
    // Find the search API call section
    const idx = body.indexOf('healthcare-search-projections/data');
    if (idx > -1) {
      // Print 2000 chars around the API call
      console.log('=== API call context ===');
      console.log(body.slice(Math.max(0, idx - 500), idx + 1500));
    }
  });
}).on('error', e => console.error(e.message));
