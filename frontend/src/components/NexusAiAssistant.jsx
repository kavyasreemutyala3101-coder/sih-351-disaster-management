import React, { useState } from 'react';
import { Bot, Send, User, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function NexusAiAssistant() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am NEXUS AI, your Earth Intelligence Assistant. Ask me anything about rainfall-drainage coupling, time-to-flood onset, overloaded drains, or What-If scenario predictions for Vijayawada pilot wards.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText) => {
    const text = queryText || input;
    if (!text.trim()) return;

    const userMsg = { sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text })
      });
      const json = await res.json();
      setMessages(prev => [...prev, { sender: 'bot', text: json.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error querying NEXUS AI backend.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="glass-panel p-4 rounded-2xl border-purple-500/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-heading">NEXUS AI Assistant</h2>
            <p className="text-[11px] text-purple-300">Grounded in live hydrometric backend telemetry & ML models</p>
          </div>
        </div>
        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded bg-purple-950 text-purple-300 border border-purple-800">
          ZERO HALLUCINATION
        </span>
      </div>

      {/* Messages Container */}
      <div className="flex-1 glass-card p-4 rounded-2xl overflow-y-auto space-y-4 text-xs">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.sender === 'bot' && (
              <div className="w-7 h-7 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div className={`p-3.5 rounded-2xl max-w-xl leading-relaxed whitespace-pre-wrap ${
              m.sender === 'user'
                ? 'bg-cyan-600 text-slate-950 font-medium rounded-tr-none'
                : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 bg-slate-900/90 rounded-2xl text-slate-400 text-xs italic">
              Querying backend hydrological models...
            </div>
          </div>
        )}
      </div>

      {/* Quick Question Chips */}
      <div className="flex flex-wrap gap-2 shrink-0">
        <Chip label="Why is risk high?" onClick={() => handleSend('Why is this area at high flood risk?')} />
        <Chip label="When will flooding begin?" onClick={() => handleSend('When could flooding begin?')} />
        <Chip label="Which roads to avoid?" onClick={() => handleSend('Which roads should I avoid?')} />
        <Chip label="What if rain increases 30%?" onClick={() => handleSend('What happens if rainfall increases by 30%?')} />
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2 shrink-0">
        <input
          type="text" value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Ask NEXUS AI a question about rainfall, drainage stress, or road risk..."
          className="flex-1 bg-slate-900 border border-purple-900/50 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
        />
        <button
          type="submit"
          className="px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-md shadow-purple-900/40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

function Chip({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 rounded-lg bg-slate-900/80 hover:bg-purple-950/80 border border-purple-900/40 text-purple-300 text-[11px] font-medium transition-all"
    >
      {label}
    </button>
  );
}
