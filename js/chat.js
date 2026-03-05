(function () {
  var chatWindow = document.getElementById('chat-window');
  var chatForm = document.getElementById('chat-form');
  var userInput = document.getElementById('user-input');
  var sendButton = document.querySelector('.chat-send');

  if (!chatWindow || !chatForm || !userInput || !sendButton) {
    return;
  }

  var systemPrompt = [
    'You are SolarSavingsAI, a concise and friendly assistant for residential solar and clean-energy decisions.',
    'Help with rebates, incentives, quote comparisons, financing basics, batteries, and utility-bill reduction.',
    'Do not provide legal, tax, or financial advice; recommend speaking with licensed professionals for final decisions.',
    'Avoid guaranteed outcomes and clearly state uncertainty when details vary by state or utility.'
  ].join(' ');

  var conversation = [{ role: 'system', content: systemPrompt }];

  appendMessage(
    'assistant',
    'Hi. Ask anything about solar rebates, incentives, quotes, batteries, or financing and this assistant will help.'
  );

  chatForm.addEventListener('submit', function (event) {
    event.preventDefault();
    handleSend();
  });

  userInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  });

  function appendMessage(role, text) {
    var bubble = document.createElement('div');
    bubble.className = 'message ' + role;
    bubble.innerHTML = linkify(escapeHtml(text));
    chatWindow.appendChild(bubble);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function setSending(isSending) {
    sendButton.disabled = isSending;
    userInput.disabled = isSending;
  }

  async function handleSend() {
    var text = userInput.value.trim();
    if (!text) {
      return;
    }

    userInput.value = '';
    appendMessage('user', text);
    conversation.push({ role: 'user', content: text });
    setSending(true);

    try {
      var response = await fetch('/.netlify/functions/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversation })
      });

      if (!response.ok) {
        throw new Error('AI request failed with status ' + response.status);
      }

      var payload = await response.json();
      var reply = payload && payload.reply
        ? payload.reply
        : 'No response was generated. Please try again.';

      conversation.push({ role: 'assistant', content: reply });
      appendMessage('assistant', reply);
    } catch (error) {
      console.error('Chat request error', error);
      appendMessage(
        'assistant',
        'The assistant is temporarily unavailable. Please try again in a moment.'
      );
    } finally {
      setSending(false);
      userInput.focus();
    }
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function linkify(text) {
    var urlPattern = /(https?:\/\/[^\s<]+)/g;
    return text.replace(urlPattern, function (url) {
      return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + url + '</a>';
    });
  }
})();
