// Netlify Function: ghost-subscribe
// Proxies email signups to Ghost's members API server-to-server,
// bypassing the CORS restriction that blocks browser → Ghost requests.

exports.handler = async function (event) {
  // Only allow POST
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
    const res = await fetch('https://connected-circles.ghost.io/members/api/send-magic-link/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email, emailType: 'signup', requestSrc: 'subscribe-form' }),
    });

    if (res.ok || res.status === 201) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true }),
      };
    }

    // Ghost returned an error — pass it through
    let msg = 'Something went wrong. Please try again.';
    try {
      const data = await res.json();
      if (data && data.errors && data.errors[0] && data.errors[0].message) {
        msg = data.errors[0].message;
      }
    } catch { /* ignore parse errors */ }

    return {
      statusCode: res.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: msg }),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Could not reach the subscription service. Please try again.' }),
    };
  }
};
