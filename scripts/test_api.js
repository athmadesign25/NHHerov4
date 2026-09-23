const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

// Test 1: check what the proxy would send
const upstream = new URL('https://172.19.1.11:9870/api/healthcare-search-projections/data');
upstream.searchParams.set('query', 'knee pain near me');
upstream.searchParams.set('type', '4');
console.log('Proxy URL:', upstream.toString());

// Test 2: fetch search.html to inspect its API call
https.get('https://172.19.1.11:9870/search.html', { agent }, (res) => {
  let body = '';
  res.on('data', c => (body += c));
  res.on('end', () => {
    const pathMatches = body.match(/healthcare-search[^\s'"]+/g);
    console.log('\nsearch.html API paths:', pathMatches);
    const typeMatches = body.match(/[?&]type=\d+/g) || body.match(/type\s*[:=]\s*['"]\d+['"]/g);
    console.log('search.html type params:', typeMatches);
    // Also look for fetch/axios/XHR calls
    const fetchCalls = body.match(/fetch\([^)]{0,100}/g);
    if (fetchCalls) console.log('fetch calls (first 3):', fetchCalls.slice(0, 3));
  });
}).on('error', e => console.error('search.html fetch error:', e.message));

// Test 3: compare type=4 vs no type
const urlNoType = 'https://172.19.1.11:9870/api/healthcare-search-projections/data?query=knee+pain+near+me';
https.get(urlNoType, { agent }, (res) => {
  let b = '';
  res.on('data', c => (b += c));
  res.on('end', () => {
    try {
      const d = JSON.parse(b);
      console.log('\nNo-type param response keys:', Object.keys(d));
      console.log('doctors:', d.doctors ? d.doctors.length : 0);
    } catch(e) { console.log('no-type raw:', b.slice(0, 200)); }
  });
}).on('error', e => console.error('no-type error:', e.message));
