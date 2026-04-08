// Netlify Function: ghost-subscribe
// Proxies email signups to Ghost server-to-server (no browser CORS).
// Spoofs Origin so Ghost treats it as a same-site request.

const https = require('https');

function ghostPost(email) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      email,
      emailType: 'subscribe',
      requestSrc: 'subscribe-form',
    });

    const options = {
      hostname: 'connected-circles.ghost.io',
      path: '/members/api/send-magic-link/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Accept': 'application/json',
        'Origin': 'https://connected-circles.ghost.io',
        'Referer': 'https://connected-circles.ghost.io/',
        'ghost-members-api-version': 'v3',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let email;
  try {
    const body = JSON.parse(event.body || '{}');
    email = (body.email || '').trim().toLowerCase();
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body.' }) };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Please enter a valid email address.' }) };
  }

  try {
    const { status, body } = await ghostPost(email);

    if (status === 201 || status === 200) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true }),
      };
    }

    // Parse Ghost's error message to return something useful
    let msg = 'Something went wrong. Please try again.';
    try {
      const data = JSON.parse(body);
      if (data?.errors?.[0]?.message) msg = data.errors[0].message;
    } catch { /* ignore */ }

    // Log raw response so you can debug in Netlify function logs
    console.error('Ghost API error', status, body);

    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: msg, _debug: body }),
    };
  } catch (err) {
    console.error('Ghost fetch failed', err);
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Could not reach the subscription service. Please try again.' }),
    };
  }
};
