import { useEffect, useRef, useState } from 'react';
import { nexus } from '../lib/nexus.js';

// Conversational interface to a Nexus n8n "agent" workflow. Sends the user's
// message + recent history to /webhook/nexus/chat, expects { reply, actions }.
// History persists in localStorage so refreshes don't lose context.
//
// The n8n workflow that backs this is not yet built — see README §6 for the
// contract. Until then, the chat will surface a clear "not configured" error
// on send so the UI can still be developed against.

const STORAGE_KEY = 'nexus_chat_history_v1';
const MAX_MESSAGES = 50;

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(-MAX_MESSAGES) : [];
  } catch {
    return [];
  }
}

function saveHistory(messages) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_MESSAGES)));
  } catch { /* quota errors are fine */ }
}

export default function ChatBox() {
  const [messages, setMessages] = useState(() => loadHistory());
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [messages, sending]);

  useEffect(() => { saveHistory(messages); }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    const userMsg = { role: 'user', content: text, ts: Date.now() };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setSending(true);

    try {
      const recent = nextHistory.slice(-10).map(({ role, content }) => ({ role, content }));
      const res = await nexus.chat({ message: text, history: recent });
      const reply = res?.reply ?? 'No reply returned.';
      const actions = res?.actions ?? null;
      setMessages((prev) => [...prev, { role: 'assistant', content: reply, actions, ts: Date.now() }]);
    } catch (err) {
      const detail = err?.payload?.message || err?.message || 'Unknown error';
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: `⚠️ Couldn't reach Nexus. ${detail}\n\n(The /webhook/nexus/chat n8n workflow may not be wired yet — see README §6.)`,
        error: true,
        ts: Date.now(),
      }]);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  function onKeyDown(e) {
    // Enter sends, Shift+Enter inserts newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function clear() {
    if (!confirm('Clear chat history?')) return;
    setMessages([]);
    saveHistory([]);
  }

  return (
    <div className="flex flex-col h-80 sm:h-96">
      <div
        ref={scrollerRef}
        className="flex-1 overflow-y-auto pr-1 space-y-3 mb-3"
      >
        {messages.length === 0 && !sending && (
          <div className="text-sm text-muted h-full flex items-center justify-center text-center px-4">
            Ask Nexus to do things — <em>"email the hot sellers from this week"</em>,{' '}
            <em>"pull comps for 123 Main St"</em>, <em>"draft outreach for seller_abc"</em>.
          </div>
        )}
        {messages.map((m, i) => <Bubble key={i} msg={m} />)}
        {sending && (
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Nexus is thinking…
          </div>
        )}
      </div>

      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Tell Nexus what to do…"
          className="flex-1 resize-none bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent/60 min-h-[40px] max-h-32"
          disabled={sending}
        />
        <button
          type="button"
          onClick={send}
          disabled={sending || !input.trim()}
          className="bg-accent text-bg font-semibold rounded-lg px-3 py-2 text-sm hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
      {messages.length > 0 && (
        <button onClick={clear} className="text-xs text-muted/60 hover:text-muted mt-2 self-start">
          Clear history
        </button>
      )}
    </div>
  );
}

function Bubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap break-words
          ${isUser ? 'bg-accent/15 text-text border border-accent/30' :
            msg.error ? 'bg-danger/10 text-danger border border-danger/30' :
            'bg-surface-2 text-text border border-border'}`}
      >
        {msg.content}
        {msg.actions && Array.isArray(msg.actions) && msg.actions.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <div className="text-xs text-muted mb-1">Actions taken:</div>
            <ul className="text-xs text-muted space-y-0.5">
              {msg.actions.map((a, i) => (
                <li key={i}>• {typeof a === 'string' ? a : a.label ?? JSON.stringify(a)}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
