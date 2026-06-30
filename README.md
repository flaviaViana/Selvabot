# SelvaBot

SelvaBot é um chatbot interativo para atendimento de clínicas veterinárias, desenvolvido para ajudar no agendamento de consultas, informações sobre vacinas, banho e tosa, emergências e dúvidas básicas veterinárias. O bot responde com simpatia e objetividade, alertando sobre a importância de atendimento presencial em casos de emergência.

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

## Estrutura do projeto

### `index.html`

Arquivo principal que contém a estrutura da interface. Divide a aplicação em duas telas:

- Tela inicial, com logo e input de texto com botão para gravação de áudio.
- Tela de chat, onde aparecem as mensagens trocadas com o bot.

---

### `keys.json`

Arquivo de configuração contendo:

- Endereço, chave e modelo da API Azure OpenAI.
- Configurações de requisição (tokens máximos, esforço de raciocínio).
- Informações do bot, como nome, textos de digitação, respostas fallback e prompt do sistema.

---

### `script.js`

Lógica principal da aplicação, responsável por:

- Carregar configuração do `keys.json`.
- Gerenciar troca entre tela inicial e chat.
- Enviar mensagens e receber respostas da API Azure OpenAI.
- Reconhecer voz do usuário para entrada de áudio.
- Sintetizar voz da resposta do chatbot.
- Exibir mensagens do usuário e do bot com estilos distintos.
- Tratar erros e responder localmente quando necessário.

---

### `style.css`

Estilos para:

- Layout responsivo para desktop, tablet e celular.
- Estilização de balões de chat para usuário e bot.
- Barra de input com botões de gravação e envio.
- Animações suaves para mensagens.
- Personalização visual usando tons de verde para o tema veterinário.

---

## Como usar

1. Abra o `index.html` em um navegador moderno (recomenda-se Chrome ou Edge para suporte total a voz).
2. Na tela inicial, digite sua mensagem ou use o botão de áudio para ditar.
3. A conversa se abrirá na tela de chat, onde você poderá continuar interagindo com o SelvaBot.
4. O bot responderá via texto e áudio.
5. Em caso de falha na API, respostas padrões locais serão exibidas para garantir o atendimento.

---

## Requisitos

- Navegador com suporte a Web Speech API (reconhecimento e síntese de voz).
- Conexão com internet para chamadas à API Azure OpenAI.
- Arquivos `index.html`, `style.css`, `script.js` e `keys.json` disponíveis na mesma pasta.

---

## Observações importantes

- O SelvaBot atua como assistente virtual e não substitui o atendimento veterinário presencial.
- Em emergências, o bot orienta imediatamente a buscar atendimento humano.
- A chave da API no `keys.json` deve ser protegida para evitar uso indevido.

---

## Licença

Este projeto é disponibilizado conforme políticas do desenvolvedor. Ajuste e uso pessoal são livres, mas não compartilhe a chave da API pública para proteger seus custos e segurança.

---

## Contato

Para dúvidas ou suporte, entre em contato com o responsável pelo SelvaBot.
