# SelvaBot

SelvaBot é um chatbot interativo para atendimento de clínicas veterinárias, desenvolvido para conclusão do curso de Inteligências artificias generativas aplicada a programação- ChatGPT.
O chat tem como objetivo ajudar no agendamento de consultas, informações sobre vacinas, banho e tosa, emergências e dúvidas básicas veterinárias. O bot responde com simpatia e objetividade, alertando sobre a importância de atendimento presencial em casos de emergência.

---

## Funcionalidades

* Tela inicial para iniciar a conversa.
* Interface de chat responsiva.
* Envio de mensagens por texto.
* Gravação de áudio pelo microfone.
* Conversão de fala em texto (Speech-to-Text).
* Conversão de texto em áudio (Text-to-Speech).
* Histórico da conversa enviado ao Azure OpenAI.
* Respostas automáticas locais em caso de indisponibilidade da IA.
* Reprodução da resposta do chatbot por áudio.

---

## Tecnologias utilizadas

* HTML5
* CSS3
* JavaScript (ES6)
* Azure OpenAI REST API
* Azure Speech REST API

---

## Estrutura do projeto

```text
SelvaBot/
│
├── index.html          # Interface do chatbot
├── style.css           # Estilos da aplicação
├── script.js           # Lógica da aplicação
├── keys.json           # Configurações do Azure
├── logo.png            # Logo do chatbot
└── README.md
```

---

## Pré-requisitos

* Navegador moderno (Google Chrome, Microsoft Edge ou Mozilla Firefox).
* Servidor HTTP local.
* Conta no Microsoft Azure.
* Recurso Azure OpenAI.
* Recurso Azure AI Speech.

---

## Configuração

Edite o arquivo `keys.json` com suas credenciais.

```json
{
  "azure": {
    "endpoint": "https://SEU-RECURSO.openai.azure.com/openai/v1/chat/completions",
    "apiKey": "SUA_CHAVE_OPENAI",
    "model": "gpt-5.4"
  },
  "speech": {
    "subscriptionKey1": "SUA_CHAVE_SPEECH",
    "region": "brazilsouth",
    "voiceName": "pt-BR-FranciscaNeural",
    "recognitionLanguage": "pt-BR",
    "recordingTimeMs": 5000
  }
}
```

> **Importante:** nunca publique suas chaves de acesso em repositórios públicos.

---

## Como executar

1. Abra o arquivo `index.html` em um navegador moderno (Chrome ou Edge recomendados).
2. Digite sua mensagem ou clique no microfone para falar.
3. O SelvaBot responderá automaticamente, com texto e áudio.

---

## Fluxo da aplicação

1. O usuário acessa a tela inicial.
2. Digita uma mensagem ou grava um áudio.
3. O áudio é convertido em texto pela Azure Speech REST API.
4. A mensagem é adicionada ao histórico da conversa.
5. O histórico é enviado ao Azure OpenAI.
6. A resposta é exibida na interface.
7. O usuário pode ouvir a resposta utilizando Text-to-Speech.
8. Caso a IA não esteja disponível, o sistema utiliza respostas locais pré-definidas.

---

## Funcionalidades implementadas

* Tela inicial.
* Tela de conversação.
* Histórico de mensagens.
* Rolagem automática.
* Indicador "digitando".
* Botão para ouvir as respostas.
* Captura de áudio.
* Reconhecimento de voz.
* Síntese de voz.
* Integração com Azure OpenAI.
* Respostas locais de contingência.

---

# Licença

Este código foi criado para conclusão de curso. Para utilizá-lo, é necessário inserir suas próprias credenciais no arquivo `keys.json`.

