// Only our own site (solarsavingsai.com) and its own Netlify deploys/previews may call this endpoint.
var ALLOWED_ORIGIN = /^https:\/\/((www\.)?solarsavingsai\.com|([a-z0-9-]+--)?solarsavingsai\.netlify\.app)$/;
function requestOrigin(headers) {
  var h = headers || {};
  var o = h.origin || h.Origin || '';
  if (o) return o;
  var ref = h.referer || h.Referer || '';
  try { return ref ? new URL(ref).origin : ''; } catch (e) { return ''; }
}

// Simple in-memory rate limit: 10 requests per minute per IP (per function instance).
var rateLimitMap = new Map();
function isRateLimited(ip) {
  var now = Date.now();
  var entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    return false;
  }
  if (entry.count >= 10) return true;
  entry.count++;
  return false;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  if (!ALLOWED_ORIGIN.test(requestOrigin(event.headers))) {
    return jsonResponse(403, { error: 'Forbidden' });
  }

  var h = event.headers || {};
  var clientIp = h['x-nf-client-connection-ip'] || (h['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (isRateLimited(clientIp)) {
    return jsonResponse(429, { reply: 'You are sending messages very quickly. Please wait a minute and try again.' });
  }

  var apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return jsonResponse(500, {
      reply: 'The AI service is not configured yet. Please try again later.'
    });
  }

  var payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (error) {
    return jsonResponse(400, { error: 'Invalid JSON request body' });
  }

  var incomingMessages = Array.isArray(payload.messages) ? payload.messages : [];
  var messages = incomingMessages
    .filter(function (message) {
      return message && typeof message.role === 'string' && typeof message.content === 'string';
    })
    .slice(-24)
    .map(function (message) {
      return { role: message.role, content: message.content.slice(0, 6000) };
    });

  if (messages.length === 0) {
    return jsonResponse(400, { error: 'At least one message is required' });
  }

  var baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com';
  var endpoint = baseUrl.replace(/\/+$/, '') + '/v1/chat/completions';

  try {
    var openAiResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: messages,
        temperature: 0.4,
        max_tokens: 700
      })
    });

    if (!openAiResponse.ok) {
      var errorText = await openAiResponse.text();
      console.error('OpenAI API error:', openAiResponse.status, errorText);
      return jsonResponse(502, {
        reply: 'The AI provider returned an error. Please try again shortly.'
      });
    }

    var result = await openAiResponse.json();
    var reply =
      result &&
      result.choices &&
      result.choices[0] &&
      result.choices[0].message &&
      result.choices[0].message.content
        ? result.choices[0].message.content.trim()
        : 'No response was generated. Please try again.';

    return jsonResponse(200, { reply: reply });
  } catch (error) {
    console.error('AI function runtime error:', error);
    return jsonResponse(500, {
      reply: 'The AI assistant is temporarily unavailable. Please try again.'
    });
  }
};

function jsonResponse(statusCode, payload) {
  return {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(payload)
  };
}
