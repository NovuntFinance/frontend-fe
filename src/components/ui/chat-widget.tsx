'use client';

import { useEffect, useRef, useState } from 'react';
import { Mail } from 'lucide-react';

type Message = { id: string; from: 'user' | 'bot'; text: string };

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  useEffect(() => {
    // scroll to bottom on new messages
    if (bottomRef.current)
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const TELEGRAM_LINK = 'https://t.me/NovuntAssistantBot';

  async function sendToApi(text: string) {
    setLoading(true);
    try {
      // Use same API base URL logic as main API client
      const apiBaseURL =
        process.env.NEXT_PUBLIC_API_URL ||
        (process.env.NODE_ENV === 'development'
          ? 'http://localhost:5000/api/v1'
          : 'https://novunt-backend-uw3z.onrender.com/api/v1');

      const res = await fetch(`${apiBaseURL}/chatbot/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error('Network');
      const json = await res.json();
      const reply = json?.data?.message ?? 'Sorry, I could not get a response.';
      const id = String(Date.now());
      setMessages((s) => [...s, { id, from: 'bot', text: reply }]);
      if (!open) setUnread((u) => u + 1);
    } catch (error) {
      // Detect CORS/network errors
      if (
        error instanceof TypeError &&
        error.message.includes('Failed to fetch')
      ) {
        console.error('🚫 CORS or network error in chat widget:', error);
      }
      console.error('Novunt chat widget failed to reach API', error);
      // fallback message suggesting Telegram
      const id = String(Date.now());
      setMessages((s) => [
        ...s,
        {
          id,
          from: 'bot',
          text: 'Chat service unavailable — open Telegram @NovuntAssistantBot',
        },
      ]);
      if (!open) setUnread((u) => u + 1);
    } finally {
      setLoading(false);
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    const id = String(Date.now());
    setMessages((s) => [...s, { id, from: 'user', text }]);
    setInput('');
    await sendToApi(text);
  };

  return (
    <div className="fixed bottom-20 left-3 z-40 sm:bottom-24 sm:left-4 lg:bottom-28 lg:left-6">
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle chat"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-all hover:bg-indigo-700 active:scale-95 sm:h-12 sm:w-12"
        >
          <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs text-white">
              {unread}
            </span>
          )}
        </button>

        {open && (
          <div className="fixed bottom-14 left-0 w-[calc(100vw-1.5rem)] max-w-md rounded-2xl border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur-lg sm:absolute sm:bottom-auto sm:left-0 sm:mb-3 sm:w-80 sm:p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold sm:text-base">
                Novunt Chat
              </div>
              <a
                className="text-xs text-indigo-200 transition-colors hover:text-indigo-100 hover:underline sm:text-sm"
                href={TELEGRAM_LINK}
                target="_blank"
                rel="noreferrer"
              >
                Open in Telegram
              </a>
            </div>

            <div className="mt-2 max-h-60 space-y-2 overflow-auto scroll-smooth text-sm sm:mt-3 sm:max-h-72">
              {messages.length === 0 && (
                <div className="p-2 text-xs text-indigo-200 sm:text-sm">
                  Say hi — ask about staking, pools, or NXP/NLP.
                </div>
              )}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-lg p-2 sm:p-2.5 ${m.from === 'user' ? 'ml-8 self-end bg-white/10 text-right' : 'mr-8 bg-white/5'}`}
                >
                  <div className="text-xs break-words sm:text-sm">{m.text}</div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="mt-3 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a question..."
                className="flex-1 rounded-full bg-white/5 px-3 py-2 text-xs transition-all outline-none focus:ring-2 focus:ring-indigo-400 sm:px-4 sm:py-2.5 sm:text-sm"
              />
              <button
                onClick={handleSend}
                disabled={loading}
                className="min-w-[60px] rounded-full bg-indigo-500 px-3 py-2 text-xs font-medium text-white transition-all hover:bg-indigo-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2.5 sm:text-sm"
              >
                {loading ? '…' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
