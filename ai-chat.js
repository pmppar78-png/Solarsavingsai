const https = require("https");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reply:
          "The AI service is not configured correctly yet. Please try again later while the site owner finishes setup.",
      }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (err) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];

  const requestData = JSON.stringify({
    model: "gpt-4.1-mini",
    temperature: 0.9,
    max_tokens: 600,
    messages,
  });

  const options = {
    hostname: "api.openai.com",
    path: "/v1/chat/completions",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
  };

  const apiResponse = await new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(
            new Error(`OpenAI API error: ${res.statusCode} - ${data}`)
          );
        }
        resolve(data);
      });
    });

    req.on("error", (err) => reject(err));
    req.write(requestData);
    req.end();
  }).catch((err) => {
    console.error("Error calling OpenAI API:", err);
    return null;
  });

  if (!apiResponse) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reply:
          "The AI service is currently unavailable. Please try again in a little while.",
      }),
    };
  }

  let content = "";
  try {
    const parsed = JSON.parse(apiResponse);
    content =
      parsed.choices?.[0]?.message?.content?.trim() ||
      "I'm sorry — I couldn't generate a response right now.";
  } catch (err) {
    console.error("Error parsing OpenAI API response:", err);
    content =
      "I'm sorry — I had trouble reading a response from the AI service. Please try again.";
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reply: content }),
  };
};