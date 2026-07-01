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
let gravando = false;

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

  const spanTexto = document.createElement('span');
  spanTexto.textContent = texto;

  const btnOuvir = document.createElement('button');
  btnOuvir.type = 'button';
  btnOuvir.className = 'play-btn';
  btnOuvir.title = 'Ouvir mensagem';
  btnOuvir.textContent = '🔊';
  btnOuvir.style.marginLeft = '8px';

  btnOuvir.addEventListener('click', () => {
    falarTextoAzureREST(texto);
  });

  div.appendChild(spanTexto);
  div.appendChild(btnOuvir);
  messages.appendChild(div);
  rolarFim();
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
    falarTextoAzureREST(texto);
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
    throw new Error('Erro Azure OpenAI: ' + await resposta.text());
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

async function iniciarReconhecimento(campoDestino) {
  if (!CONFIG) {
    alert('Configuração ainda não carregada.');
    return;
  }

  if (gravando) return;

  gravando = true;

  try {
    campoDestino.placeholder = 'Gravando... fale agora';

    const wavBlob = await gravarAudioWav(
      CONFIG.speech.recordingTimeMs || 5000
    );

    campoDestino.placeholder = '';

    const texto = await transcreverAudioAzureREST(wavBlob);

    if (!texto) {
      alert('Não foi possível reconhecer o áudio.');
      return;
    }

    campoDestino.value = texto;

    if (campoDestino === chatInput) {
      enviarMensagem(texto, true);
      campoDestino.value = '';
    } else {
      abrirChat(texto);
      campoDestino.value = '';
    }

  } catch (erro) {
    console.error(erro);
    alert('Erro ao gravar ou transcrever áudio.');
  } finally {
    gravando = false;
    campoDestino.placeholder = '';
  }
}

async function gravarAudioWav(tempoMs) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);

  const processor = audioContext.createScriptProcessor(4096, 1, 1);

  const audioData = [];

  processor.onaudioprocess = (event) => {
    const canal = event.inputBuffer.getChannelData(0);
    audioData.push(new Float32Array(canal));
  };

  source.connect(processor);
  processor.connect(audioContext.destination);

  await esperar(tempoMs);

  processor.disconnect();
  source.disconnect();

  stream.getTracks().forEach(track => track.stop());

  const sampleRateOriginal = audioContext.sampleRate;

  await audioContext.close();

  const audioFloat32 = juntarBuffers(audioData);
  const audio16k = converterSampleRate(audioFloat32, sampleRateOriginal, 16000);

  return criarWavBlob(audio16k, 16000);
}

function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function juntarBuffers(buffers) {
  let tamanhoTotal = 0;

  buffers.forEach(buffer => {
    tamanhoTotal += buffer.length;
  });

  const resultado = new Float32Array(tamanhoTotal);

  let offset = 0;

  buffers.forEach(buffer => {
    resultado.set(buffer, offset);
    offset += buffer.length;
  });

  return resultado;
}

function converterSampleRate(buffer, sampleRateOriginal, sampleRateDestino) {
  if (sampleRateOriginal === sampleRateDestino) {
    return buffer;
  }

  const proporcao = sampleRateOriginal / sampleRateDestino;
  const novoTamanho = Math.round(buffer.length / proporcao);
  const resultado = new Float32Array(novoTamanho);

  let offsetResultado = 0;
  let offsetBuffer = 0;

  while (offsetResultado < resultado.length) {
    const proximoOffsetBuffer = Math.round((offsetResultado + 1) * proporcao);

    let soma = 0;
    let contador = 0;

    for (let i = offsetBuffer; i < proximoOffsetBuffer && i < buffer.length; i++) {
      soma += buffer[i];
      contador++;
    }

    resultado[offsetResultado] = soma / contador;

    offsetResultado++;
    offsetBuffer = proximoOffsetBuffer;
  }

  return resultado;
}

function criarWavBlob(samples, sampleRate) {
  const bytesPorSample = 2;
  const quantidadeCanais = 1;
  const tamanhoBuffer = 44 + samples.length * bytesPorSample;

  const arrayBuffer = new ArrayBuffer(tamanhoBuffer);
  const view = new DataView(arrayBuffer);

  escreverTexto(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * bytesPorSample, true);
  escreverTexto(view, 8, 'WAVE');

  escreverTexto(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, quantidadeCanais, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * quantidadeCanais * bytesPorSample, true);
  view.setUint16(32, quantidadeCanais * bytesPorSample, true);
  view.setUint16(34, 16, true);

  escreverTexto(view, 36, 'data');
  view.setUint32(40, samples.length * bytesPorSample, true);

  let offset = 44;

  for (let i = 0; i < samples.length; i++) {
    let sample = Math.max(-1, Math.min(1, samples[i]));
    sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    view.setInt16(offset, sample, true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

function escreverTexto(view, offset, texto) {
  for (let i = 0; i < texto.length; i++) {
    view.setUint8(offset + i, texto.charCodeAt(i));
  }
}

async function transcreverAudioAzureREST(audioBlob) {
  const region = CONFIG.speech.region;
  const key = CONFIG.speech.subscriptionKey1;
  const language = CONFIG.speech.recognitionLanguage || 'pt-BR';

  const endpoint =
    `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${language}`;

  const resposta = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
      'Accept': 'application/json'
    },
    body: audioBlob
  });

  if (!resposta.ok) {
    throw new Error('Erro Speech to Text REST: ' + await resposta.text());
  }

  const dados = await resposta.json();

  return dados.DisplayText || '';
}

async function falarTextoAzureREST(texto) {
  if (!CONFIG) {
    alert('Configuração ainda não carregada.');
    return;
  }

  const region = CONFIG.speech.region;
  const key = CONFIG.speech.subscriptionKey1;
  const voiceName = CONFIG.speech.voiceName || 'pt-BR-FranciscaNeural';

  const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

  const ssml = `
    <speak version="1.0" xml:lang="pt-BR">
      <voice xml:lang="pt-BR" name="${voiceName}">
        ${escaparXML(texto)}
      </voice>
    </speak>
  `;

  try {
    const resposta = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3'
      },
      body: ssml
    });

    if (!resposta.ok) {
      throw new Error('Erro Text to Speech REST: ' + await resposta.text());
    }

    const audioBlob = await resposta.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    audio.play();

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };

  } catch (erro) {
    console.error(erro);
    alert('Erro ao gerar fala pela API REST do Azure Speech.');
  }
}

function escaparXML(texto) {
  return texto
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
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