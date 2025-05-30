document.addEventListener('DOMContentLoaded', () => {
  const askAbzBtn = document.getElementById('askAbzBtn');
  const askContainer = document.getElementById('askContainer');
  const chatLog = document.getElementById('chatLog');
  const userInput = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');

  // Show the chat input area when button clicked
  askAbzBtn.addEventListener('click', () => {
    askContainer.style.display = 'flex';
    userInput.focus();
  });

  // Append a message to chat log with white text color
  function appendMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.textContent = text;
    // Override text color to white for both user and AI messages
    messageDiv.style.color = '#ffffff';
    chatLog.appendChild(messageDiv);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  // Fake AI response for demonstration purposes
  function getAIResponse(userText) {
    // Replace this with real AI or bot logic
    return `Abz says: You asked "${userText}"? Interesting!`;
  }

  // Send user input and get AI response
  function sendMessage() {
    const text = userInput.value.trim();
    if (text === '') return;

    appendMessage(text, 'user'); // User message
    userInput.value = '';
    
    // Simulate AI response after a delay
    setTimeout(() => {
      const aiReply = getAIResponse(text);
      appendMessage(aiReply, 'abz'); // AI message
    }, 700);
  }

  // Send message on button click
  sendBtn.addEventListener('click', sendMessage);

  // Send message on Enter key press
  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });
});
