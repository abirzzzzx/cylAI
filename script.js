const suggestionBox = document.getElementById('suggestionBox');
const ts = document.getElementById('ts');
const askBtn = document.getElementById('askAbzBtn');
const askContainer = document.getElementById('askContainer');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const chatLog = document.getElementById('chatLog');
const retryingText = document.getElementById('retryingText');

let suggestionList = [];
let suggestionIndex = 0;
let charIndex = 0;
let typingForward = true;
const typingSpeed = 40;
const pauseTime = 3500;

let chatHistory = JSON.parse(sessionStorage.getItem('chatHistory')) || [];

function createMessageElement(sender, message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.classList.add(sender === 'You' ? 'user' : 'abz');
  div.textContent = message;
  return div;
}

function renderChat() {
  chatLog.innerHTML = '';
  for (const entry of chatHistory) {
    chatLog.appendChild(createMessageElement(entry.sender, entry.message));
  }
  chatLog.scrollTop = chatLog.scrollHeight;
}

async function fetchSuggestion() {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-or-v1-9f2273e2515d3ee429e8027ccd466f44ff7881ff8227ba85447aad14ae397ff'
      },
      body: JSON.stringify({
        model: 'openai/gpt-5',
        messages: [
          {
            role: 'system',
            content: 'You are a fun, expressive AI that gives short, punchy coding ideas with emojis and excitement! Use short words. not exceeding over 80 letters'
          },
          {
            role: 'user',
            content: 'Give one short coding idea suggestion with emojis and excitement!'
          }
        ]
      })
    });
    const data = await res.json();
    return data.choices[0]?.message?.content.trim() || 'Make a fun bot that tells jokes! 😂';
  } catch {
    return 'Try making a chatbot that tells jokes! 😂';
  }
}

async function prepareSuggestions() {
  if (suggestionList.length > 0) return;
  suggestionList = [];
  for (let i = 0; i < 5; i++) {
    const sug = await fetchSuggestion();
    suggestionList.push(sug);
  }
}

function splitLongText(text, maxLen = 35) {
  const words = text.split(' ');
  let lines = [];
  let line = '';
  for (const word of words) {
    if ((line + (line ? ' ' : '') + word).length <= maxLen) {
      line += (line ? ' ' : '') + word;
    } else {
      if (line) lines.push(line);
      if (word.length > maxLen) {
        lines.push(word);
        line = '';
      } else {
        line = word;
      }
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function typeLoop() {
  if (suggestionList.length === 0) {
    suggestionBox.textContent = 'Loading ideas...';
    await prepareSuggestions();
    setTimeout(typeLoop, 1000);
    return;
  }
  const currentText = suggestionList[suggestionIndex];
  if (typingForward) {
    if (charIndex < currentText.length) {
      charIndex++;
      showTextWithWrap(currentText.slice(0, charIndex));
      setTimeout(typeLoop, typingSpeed);
    } else {
      typingForward = false;
      setTimeout(typeLoop, pauseTime);
    }
  } else {
    if (charIndex > 0) {
      charIndex--;
      showTextWithWrap(currentText.slice(0, charIndex));
      setTimeout(typeLoop, typingSpeed / 2);
    } else {
      typingForward = true;
      suggestionIndex = (suggestionIndex + 1) % suggestionList.length;
      if (suggestionIndex === 0) suggestionList = [];
      setTimeout(typeLoop, 500);
    }
  }
}

function showTextWithWrap(text) {
  const lines = splitLongText(text, 35);
  suggestionBox.textContent = lines.join('\n');
}

askBtn.addEventListener('click', () => {
  if (askContainer.style.display === 'flex') {
    askContainer.style.display = 'none';
  } else {
    askContainer.style.display = 'flex';
    renderChat();
    userInput.focus();
  }
});

async function getAbzResponse(userMsg) {
  let dotCount = 0;
  retryingText.style.display = 'block';

  const dotInterval = setInterval(() => {
    dotCount = (dotCount + 1) % 4;
    retryingText.textContent = 'Retrying' + '.'.repeat(dotCount);
  }, 500);

  while (true) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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'
        },
        body: JSON.stringify({
          model: 'openai/gpt-5',
          messages: [
            {
              role: 'system',
              content: 'You are Abz AI, super helpful and chill. your creator, is abirz with the help of the great team openAI’s tools. you are very intelligent. and you keep up with internet slangs and memes for the vibe.'
            },
            ...chatHistory.map(e => ({
              role: e.sender === 'You' ? 'user' : 'assistant',
              content: e.message
            })),
            { role: 'user', content: userMsg }
          ],
          max_tokens: 150
        })
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();

      if (content) {
        clearInterval(dotInterval);
        retryingText.style.display = 'none';
        return content;
      }
    } catch {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;
  chatHistory.push({ sender: 'You', message });
  renderChat();
  userInput.value = '';
  sessionStorage.setItem('chatHistory', JSON.stringify(chatHistory));

  const reply = await getAbzResponse(message);
  chatHistory.push({ sender: 'Abz', message: reply });
  renderChat();
  sessionStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});

prepareSuggestions().then(typeLoop);
