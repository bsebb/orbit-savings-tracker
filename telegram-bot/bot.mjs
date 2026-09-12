/**
 * Orbit Telegram Mini App Bot
 *
 * Requirements:
 * 1. Create a bot via @BotFather on Telegram (get your BOT_TOKEN)
 * 2. Set your deployed Orbit URL (e.g. Vercel, Netlify, Cloudflare, or ngrok)
 *
 * Run:
 *   BOT_TOKEN="your_token_here" WEBAPP_URL="https://your-orbit-url.vercel.app" node telegram-bot/bot.mjs
 */

const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://orbit-savings-tracker.vercel.app';

if (BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
  console.log(`
=====================================================
  ORBIT TELEGRAM BOT SETUP INSTRUCTIONS
=====================================================

1. Open Telegram and search for @BotFather.
2. Send /newbot and choose a name (e.g., "My Orbit Finance").
3. Copy the HTTP API token provided by BotFather.
4. Deploy your Orbit web app (e.g. push to Vercel/Netlify for a free HTTPS link).
5. Set Menu Button in @BotFather:
   - Send /mybots -> Choose your bot -> "Bot Settings" -> "Menu Button"
   - Enter your Orbit HTTPS URL.
   - Now anyone opening your bot sees an "Open Orbit" button in the bottom left!

To run this standalone polling bot:
   $env:BOT_TOKEN="123456:ABC-DEF..."
   $env:WEBAPP_URL="https://your-deployed-orbit.vercel.app"
   node telegram-bot/bot.mjs
=====================================================
`);
  process.exit(0);
}

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function sendMessage(chatId, text, replyMarkup) {
  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error('Error sending message:', err);
  }
}

async function getUpdates(offset) {
  try {
    const res = await fetch(`${TELEGRAM_API}/getUpdates?timeout=30&offset=${offset}`);
    const data = await res.json();
    return data.result || [];
  } catch (err) {
    return [];
  }
}

console.log('🚀 Orbit Telegram Bot polling started...');
let offset = 0;

async function poll() {
  while (true) {
    const updates = await getUpdates(offset);
    for (const update of updates) {
      offset = update.update_id + 1;
      const message = update.message;
      if (!message || !message.text) continue;

      const chatId = message.chat.id;
      const text = message.text.trim();

      if (text.startsWith('/start') || text.startsWith('/orbit') || text.startsWith('/budget')) {
        const welcomeText = `<b>Welcome to Orbit — Financial Operating System</b> 🪐\n\nTrack your guaranteed savings, zero-based envelope budgets, recurring subscriptions, and 4-year wealth runway directly inside Telegram.\n\nTap the button below to launch:`;

        const keyboard = {
          inline_keyboard: [
            [
              {
                text: 'Launch Orbit App 🚀',
                web_app: { url: WEBAPP_URL },
              },
            ],
          ],
        };

        await sendMessage(chatId, welcomeText, keyboard);
      }
    }
  }
}

poll();
