const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const conversation = [];
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  conversation.push({ role: 'user', text: userMessage });
  input.value = '';

  // Show a thinking indicator
  const thinkingMessage = appendMessage('bot', 'Gemini is thinking...');

  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversation }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong with the request.');
    }

    const { data: botResponseText, success } = await response.json();

    // Remove "Gemini is thinking..." and update with the actual response
    thinkingMessage.textContent = botResponseText;

    if (success) {
      conversation.push({ role: 'model', text: botResponseText });
    } else {
      // If the API call was not successful but didn't throw an error
      thinkingMessage.textContent = 'Sorry, I had trouble getting a response.';
    }
  } catch (error) {
    console.error('Error:', error);
    thinkingMessage.textContent = `Error: ${error.message}`;
  } finally {
    // Ensure the chat box scrolls to the latest message
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg; // Return the message element to allow for modification
}
