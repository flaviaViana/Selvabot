# SelvaBot

SelvaBot é um chatbot interativo para atendimento de clínicas veterinárias, desenvolvido para conclusão do curso de Inteligências artificias generativas aplicada a programação- ChatGPT.
O chat tem como objetivo ajudar no agendamento de consultas, informações sobre vacinas, banho e tosa, emergências e dúvidas básicas veterinárias. O bot responde com simpatia e objetividade, alertando sobre a importância de atendimento presencial em casos de emergência.

---

## Funcionalidades principais

- Interface web simples e responsiva.
- Envio de mensagens via texto.
- Reconhecimento de voz para envio de mensagens faladas.
- Respostas automáticas usando o serviço Azure OpenAI.
- Fala sintetizada para respostas do chatbot.
- Histórico de conversa mantido enquanto o usuário interage.
- Mensagens fallback locais para problemas na API remota.

---

## Como Executar

1. Abra o arquivo `index.html` em um navegador moderno (Chrome ou Edge recomendados).
2. Digite sua mensagem ou clique no microfone para falar.
3. O SelvaBot responderá automaticamente, com texto e áudio.

---

## Configuração (`keys.json`)

Para usar o chatbot, crie um arquivo `keys.json` na raiz do projeto com o seguinte formato:

```json
{
  "azure": {
    "endpoint": "https://SEU_ENDPOINT.azure.com/openai/v1/chat/completions",
    "apiKey": "SUA_CHAVE_API_AZURE",
    "model": "NOME_DO_MODELO"
  },
  "request": {
    "maxCompletionTokens": 4096,
    "reasoningEffort": "medium"
  },
  "bot": {
    "name": "SelvaBot",
    "typingText": "SelvaBot está digitando...",
    "fallbackText": "Não encontrei uma resposta.",
    "systemPrompt": "Você é o SelvaBot, uma IA para atendimento veterinário em português do Brasil."
  }
}

```

# Licença

Este código foi criado para conclusão de curso. Para utilizá-lo, é necessário inserir suas próprias credenciais no arquivo `keys.json`.

