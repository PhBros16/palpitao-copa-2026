# 🏆 Palpitão Copa 2026

> O bolão de Copa do Mundo mais completo que você já viu.

**[▶ Acessar o app](https://palpitao-copa-mundo.vercel.app)**

---

## O que é

O Palpitão Copa 2026 é um app web de bolão para a Copa do Mundo 2026, feito para grupos de amigos. Cada participante palpita no placar de cada jogo, acumula pontos, sobe no ranking e desbloqueia conquistas ao longo do campeonato.

Tudo roda em tempo real, sem precisar criar conta — basta entrar com seu nome (e PIN, se configurado) e começar a palpitar.

---

## Funcionalidades

### ⚽ Palpites
- Palpite no placar exato de cada jogo
- Prazo automático por data/hora: o **primeiro jogo de cada dia** trava no apito; os **demais** travam 30 minutos antes
- Alerta visual quando falta menos de 1 hora para o travamento
- Pontuação simulada em tempo real ao preencher o palpite ("se esse for o resultado: +X pts")
- Extras configuráveis por jogo: **Quem Avança** e **Pênaltis**

### 📊 Ranking & Pontuação
- Ranking em tempo real com desempate por **cravadas → vencedor → saldo**
- Parcial da rodada com placar ao vivo
- Tabela de pontos rodada a rodada com heatmap de cores
- Gráfico de evolução de pontos por participante (janela configurável)
- Projeção percentual de campeão baseada na média recente (janela configurável)
- Pódio animado (top 3 geral)
- Sequência narrativa automática: ex. "3 rodadas liderando — dominando sem dó 👑"

### 📈 Estatísticas Pessoais
- % de placar exato, vencedor e saldo de gols acumulados
- Heatmap de performance por rodada (clicável para detalhes jogo a jogo)
- Comparativo frente a frente contra qualquer participante (por rodada ou histórico completo)
- Pizza de distribuição de palpites por jogo
- Melhor palpite da última rodada finalizada

### 🏆 Conquistas
39 troféus organizados em 4 tiers, desbloqueados automaticamente. Notificação visual ao entrar no app quando uma nova conquista é desbloqueada.

| Tier | Raridade | Qtd | Exemplos |
|------|----------|-----|---------|
| 🟢 | Qualquer um tem, até você | 16 | Veterano, Galinha, Dormiu no Ponto, Zero a Zero |
| 🔵 | Rapaz, esse aqui é bom | 13 | Hat-trick, Sangue Frio, Fênix, O Analista |
| 🌟 | Levanta que essa é só sua! | 9 | Perfeição, Relâmpago, O Predador, Vidente |
| 👑 | Épico | 1 | CAMPEÃO! — o maior pontuador de toda a competição |

### 💬 Social
- Chat por rodada com reações via emojis (🤣👍🤬🤡🖕)
- Seção "Pior Palpiteiro" com foto, nome e texto editável pelo admin
- Compartilhamento de ranking e parcial diretamente no WhatsApp
- Novidades/changelog via pop-up ao entrar no app

### 🔐 Segurança & Personalização
- PIN de acesso individual por participante
- Avatar personalizado (emoji livre) visível no ranking e no chat
- Log de ações administrativas (últimas 50 entradas)

### 🎵 Experiência
- Playlist de 8 músicas com player completo (play/pause, próxima, anterior, modo loop e playlist)
- Música padrão da intro configurável pelo admin
- Notificações push via OneSignal (nova rodada, prazo, resultado)
- PWA instalável na tela inicial (Android e iPhone)
- Dark mode nativo
- Intro animada com contagem regressiva e reveal do título

### ⚙️ Painel Admin
- Criação e edição de rodadas com jogos, horários e escudos
- Lançamento de resultados e cálculo automático de pontos
- Correção manual de pontos por jogo e por participante
- Configuração de fases de pontuação e multiplicadores
- Gestão de PINs, avatares, pior palpiteiro e novidades
- Envio de notificações push para todos os participantes
- Controle do gráfico de evolução e da projeção de campeão
- Compartilhamento de ranking/parcial via WhatsApp

---

## Sistema de pontuação

| Acerto | Pontos base |
|--------|-------------|
| Placar exato (cravada) | 5 pts |
| Saldo de gols correto | 3 pts |
| Vencedor correto | 1 pt |

**Multiplicadores por fase** (configuráveis pelo admin):

| Fase | Multiplicador |
|------|--------------|
| Fase de Grupos | ×1 |
| Dezesseis avos | ×2 |
| Oitavas de Final | ×3 |
| Quartas de Final | ×4 |
| Semifinal | ×5 |
| 3º Lugar / Final | ×6 |

**Extras por jogo:**
- Quem Avança: bônus × multiplicador da fase
- Pênaltis: bônus fixo de pontos

---

## Travamento de palpites

A lógica de travamento é por dia, não por posição no array:

- **Primeiro jogo do dia**: trava exatamente no horário de início
- **Demais jogos do dia**: travam 30 minutos antes do horário marcado

Isso garante que em rodadas com jogos em dias diferentes, cada dia tenha seu próprio jogo que trava no apito.

---

## Stack

- **Next.js 15** (App Router, single-page)
- **TypeScript**
- **Supabase** — estado global via JSONB + tabela de chat
- **OneSignal** — notificações push
- **Vercel** — deploy contínuo

---

## Banco de dados (Supabase)

| Tabela | Descrição |
|--------|-----------|
| `app_state` | Estado global (rodada, palpites, resultados, histórico, configurações) em JSONB |
| `chat_messages` | Mensagens do chat por rodada com reações |

---

## Rodando localmente

```bash
git clone https://github.com/PhBros16/palpitao-copa-2026.git
cd palpitao-copa-2026
npm install
cp .env.example .env.local  # configure suas credenciais Supabase
npm run dev
```

Acesse `http://localhost:3000`.

---

## Variáveis de ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## Estrutura do projeto

```
app/
  api/
    chat/         # Mensagens e reações do chat
    cron/         # Jobs agendados (travamento automático, alertas)
    notify/       # Notificações push via OneSignal
    state/        # Leitura e escrita do estado global
  layout.tsx      # Metadata, PWA manifest, OneSignal init
  manifest.ts     # PWA manifest
  page.tsx        # App principal (~4600 linhas, componente único)
lib/
  supabase.ts     # Cliente Supabase
public/
  logos/          # Escudos de 60+ seleções da Copa do Mundo
  *.mp3           # Playlist de músicas tema
```

---

## Deploy

Deploy automático na Vercel a cada push na branch `main`.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/PhBros16/palpitao-copa-2026)

---

## Licença

MIT — use, modifique e distribua à vontade.

---

Feito por **Pedro Henrique** para a Copa do Mundo 2026. Divirtam-se ! :)
