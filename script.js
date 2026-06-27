const home = document.getElementById('home');
const chat = document.getElementById('chat');
const homeForm = document.getElementById('homeForm');
const homeInput = document.getElementById('homeInput');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const messages = document.getElementById('messages');
const recordBtn = document.getElementById('recordBtn');
const homeRecordBtn = document.getElementById('homeRecordBtn');

let CONFIG = null;

let historico = [];

async function carregarConfiguracao() {
  const resposta = await fetch('keys.json');

  if (!resposta.ok) {
    throw new Error('Erro ao carregar keys.json');
  }

  CONFIG = await resposta.json();

  historico = [
    {
      role: 'system',
      content: CONFIG.bot.systemPrompt
    }
  ];
}

carregarConfiguracao().catch((erro) => {
  console.error(erro);
  alert('Erro ao carregar configurações do chatbot.');
});

function abrirChat(textoInicial = '') {
  home.classList.remove('active');
  chat.classList.add('active');
  chatInput.focus();

  if (textoInicial.trim()) {
    enviarMensagem(textoInicial.trim());
  }
}

function adicionarMensagemUsuario(texto) {
  const div = document.createElement('div');
  div.className = 'user-message';
  div.textContent = texto;
  messages.appendChild(div);
  rolarFim();
}

function adicionarMensagemBot(texto) {
  const div = document.createElement('div');
  div.className = 'bot-message';
  div.textContent = texto;
  messages.appendChild(div);
  rolarFim();
  falarTexto(texto);
}

function adicionarDigitando() {
  const div = document.createElement('div');
  div.className = 'bot-message typing';
  div.textContent = CONFIG?.bot?.typingText || 'SelvaBot está digitando...';
  messages.appendChild(div);
  rolarFim();
  return div;
}

function adicionarAudioUsuario(texto) {
  const audio = document.createElement('div');
  audio.className = 'audio-message';
  audio.innerHTML = `
    <button class="play-btn" type="button">▶</button>
    <div class="wave">▌▌▌▌▌▌▌▌▌▌</div>
    <span>áudio</span>
  `;

  audio.querySelector('.play-btn').addEventListener('click', () => {
    falarTexto(texto);
  });

  messages.appendChild(audio);
  rolarFim();
}

function rolarFim() {
  messages.scrollTop = messages.scrollHeight;
}

async function enviarMensagem(texto, veioDeAudio = false) {
  if (!texto) return;

  if (!CONFIG) {
    adicionarMensagemBot('Configuração ainda não carregada. Tente novamente.');
    return;
  }

  if (veioDeAudio) {
    adicionarAudioUsuario(texto);
  } else {
    adicionarMensagemUsuario(texto);
  }

  historico.push({
    role: 'user',
    content: texto
  });

  const digitando = adicionarDigitando();

  try {
    const resposta = await chamarAzureOpenAI();

    digitando.remove();

    historico.push({
      role: 'assistant',
      content: resposta
    });

    adicionarMensagemBot(resposta);
  } catch (erro) {
    digitando.remove();

    const respostaFallback = respostaLocal(texto);

    historico.push({
      role: 'assistant',
      content: respostaFallback
    });

    adicionarMensagemBot(respostaFallback);
    console.error(erro);
  }
}

async function chamarAzureOpenAI() {
  if (!CONFIG.azure.endpoint || !CONFIG.azure.apiKey || !CONFIG.azure.model) {
    throw new Error('Configuração Azure incompleta.');
  }

  const resposta = await fetch(CONFIG.azure.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + CONFIG.azure.apiKey
    },
    body: JSON.stringify({
      model: CONFIG.azure.model,
      messages: historico,
      max_completion_tokens: CONFIG.request.maxCompletionTokens,
      reasoning_effort: CONFIG.request.reasoningEffort
    })
  });

  if (!resposta.ok) {
    throw new Error('Erro Azure: ' + await resposta.text());
  }

  const dados = await resposta.json();

  return dados.choices?.[0]?.message?.content || CONFIG.bot.fallbackText;
}

function respostaLocal(texto) {
  const mensagem = texto.toLowerCase();

  if (mensagem.includes('agendar') || mensagem.includes('consulta') || mensagem === '1') {
    return 'Para agendar uma consulta, informe o nome do tutor, nome do pet, espécie e melhor dia para atendimento.';
  }

  if (mensagem.includes('vacina') || mensagem === '2') {
    return 'Para vacinas, informe a espécie, idade do animal e se ele já possui carteira de vacinação.';
  }

  if (mensagem.includes('banho') || mensagem.includes('tosa') || mensagem === '3') {
    return 'Para banho e tosa, informe o porte do animal e o melhor dia para atendimento.';
  }

  if (mensagem.includes('emerg') || mensagem === '4') {
    return 'Em caso de emergência, procure atendimento veterinário imediatamente. Informe o que aconteceu e há quanto tempo.';
  }

  if (mensagem.includes('atendente') || mensagem === '5') {
    return 'Certo! Vou direcionar você para um atendente. Por favor, aguarde um momento.';
  }

  return `Olá! Como posso ajudar?

Você pode escolher:
1 Agendar consulta
2 Vacinas
3 Banho e tosa
4 Emergência
5 Falar com um atendente.`;
}

function iniciarReconhecimento(campoDestino) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert('Seu navegador não suporta reconhecimento de voz. Use Chrome ou Edge.');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = (event) => {
    const texto = event.results[0][0].transcript;
    campoDestino.value = texto;

    if (campoDestino === chatInput) {
      enviarMensagem(texto, true);
      campoDestino.value = '';
    } else {
      abrirChat(texto);
      campoDestino.value = '';
    }
  };

  recognition.onerror = () => {
    alert('Não foi possível capturar o áudio. Tente novamente.');
  };
}

function falarTexto(texto) {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();

  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = 'pt-BR';
  fala.rate = 1;

  window.speechSynthesis.speak(fala);
}

homeForm.addEventListener('submit', (event) => {
  event.preventDefault();

  abrirChat(homeInput.value);
  homeInput.value = '';
});

chatForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const texto = chatInput.value.trim();

  if (!texto) return;

  chatInput.value = '';
  enviarMensagem(texto);
});

recordBtn.addEventListener('click', () => {
  iniciarReconhecimento(chatInput);
});

homeRecordBtn.addEventListener('click', () => {
  iniciarReconhecimento(homeInput);
});