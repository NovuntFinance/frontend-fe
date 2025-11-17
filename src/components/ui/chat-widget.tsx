'use client';

import { useEffect, useRef, useState } from 'react';

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
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const TELEGRAM_LINK = 'https://t.me/NovuntAssistantBot';

  async function sendToApi(text: string) {
    setLoading(true);
    try {
      // Use same API base URL logic as main API client
      const apiBaseURL = process.env.NEXT_PUBLIC_API_URL || 
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
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('🚫 CORS or network error in chat widget:', error);
      }
      console.error('Novunt chat widget failed to reach API', error);
      // fallback message suggesting Telegram
      const id = String(Date.now());
      setMessages((s) => [...s, { id, from: 'bot', text: 'Chat service unavailable — open Telegram @NovuntAssistantBot' }]);
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
    <div className="fixed right-3 bottom-3 sm:right-4 sm:bottom-4 lg:right-6 lg:bottom-6 z-50">
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle chat"
          className="relative inline-flex items-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-white font-semibold shadow-lg"
        >
          Chat
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 inline-flex items-center justify-center rounded-full bg-rose-500 text-white text-xs w-5 h-5">{unread}</span>
          )}
        </button>

        {open && (
          <div className="fixed sm:absolute bottom-16 right-0 sm:bottom-auto sm:right-auto sm:mt-3 w-[calc(100vw-1.5rem)] sm:w-80 max-w-md rounded-t-2xl sm:rounded-2xl bg-white/10 backdrop-blur-lg p-3 sm:p-4 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm sm:text-base font-semibold">Novunt Chat</div>
              <a className="text-xs sm:text-sm text-indigo-200 hover:text-indigo-100 hover:underline transition-colors" href={TELEGRAM_LINK} target="_blank" rel="noreferrer">Open in Telegram</a>
            </div>

            <div className="mt-2 sm:mt-3 max-h-60 sm:max-h-72 overflow-auto text-sm space-y-2 scroll-smooth">
              {messages.length === 0 && <div className="text-xs sm:text-sm text-indigo-200 p-2">Say hi — ask about staking, pools, or NXP/NLP.</div>}
              {messages.map((m) => (
                <div key={m.id} className={`p-2 sm:p-2.5 rounded-lg ${m.from === 'user' ? 'bg-white/10 self-end text-right ml-8' : 'bg-white/5 mr-8'}`}>
                  <div className="text-xs sm:text-sm break-words">{m.text}</div>
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
                className="flex-1 rounded-full bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
              />
              <button onClick={handleSend} disabled={loading} className="rounded-full bg-indigo-500 hover:bg-indigo-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed px-3 sm:px-4 py-2 sm:py-2.5 text-white text-xs sm:text-sm font-medium transition-all min-w-[60px]">
                {loading ? '…' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
