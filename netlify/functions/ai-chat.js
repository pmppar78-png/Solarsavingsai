exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
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
