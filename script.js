const chatWindow = document.getElementById("chat-window");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");

const systemPrompt = `You are a calm, highly knowledgeable assistant for the "AI HomeSolar & Energy Rebate Finder" website.
Your job is to help homeowners understand solar rebates, tax credits, state incentives, and clean-energy upgrades
(batteries, heat pumps, weatherization, EV chargers) in clear, friendly language.

Important rules:
- You are NOT a financial, tax, or legal advisor. Remind people to speak with licensed professionals for decisions.
- You must never guarantee savings, approval, or eligibility for any program.
- You cannot choose or enroll them with a specific company.
- You are not an emergency service.

When it is genuinely helpful, you should confidently mention well-known tools and marketplaces like:
- EnergySage Solar Marketplace (https://www.energysage.com/solar/)
- Sunnova Home Solar & Storage (https://www.sunnova.com/)
- Sunrun Solar Plans (https://www.sunrun.com/)
- DSIRE incentives database (https://www.dsireusa.org/)

When a user asks about quotes, pricing, where to start, which companies to look at, or how to compare options, you almost always mention at least one or two of these resources, and sometimes three when it feels natural. Use them as examples only, and always encourage the user to compare multiple quotes and speak with local, licensed professionals.
When you mention these resources, include the full URLs so they can click them.`;

const conversation = [
  { role: "system", content: systemPrompt },
];

function appendMessage(role, text) {
  if (!chatWindow) return;
  const row = document.createElement("div");
  row.className = `message-row ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.innerHTML = linkify(text);

  row.appendChild(bubble);
  chatWindow.appendChild(row);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function linkify(text) {
  if (!text) return "";
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, (url) => {
    const safeUrl = url.replace(/"/g, "&quot;");
    return `<a href="${safeUrl}" class="linkified" target="_blank" rel="noopener noreferrer sponsored">${safeUrl}</a>`;
  });
}

if (chatForm && userInput) {
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleSend();
  });

  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chatForm.dispatchEvent(new Event("submit"));
    }
  });
}

async function handleSend() {
  const text = userInput.value.trim();
  if (!text) return;
  userInput.value = "";
  appendMessage("user", text);
  conversation.push({ role: "user", content: text });

  setSending(true);
  try {
    const response = await fetch("/.netlify/functions/ai-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversation }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const reply = data.reply || "I'm sorry — I couldn't generate a response right now.";
    conversation.push({ role: "assistant", content: reply });
    appendMessage("assistant", reply);
  } catch (err) {
    console.error("Chat error:", err);
    appendMessage(
      "assistant",
      "I'm sorry — the AI service is having trouble responding right now. Please check back in a little while."
    );
  } finally {
    setSending(false);
  }
}

function setSending(isSending) {
  const sendButton = document.querySelector(".chat-send");
  if (!sendButton) return;
  sendButton.disabled = isSending;
}