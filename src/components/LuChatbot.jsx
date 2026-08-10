import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, Shield, ChevronRight, RefreshCw } from 'lucide-react';
import { chatApi } from '../services/api';

const LuChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [isWavingAnimation, setIsWavingAnimation] = useState(false);
  const messagesEndRef = useRef(null);

  // Initial greeting logic
  useEffect(() => {
    const greeted = sessionStorage.getItem('motoluv_lu_greeted');
    if (!greeted) {
      // Prepared initial welcome
      setMessages([
        {
          id: 'welcome_1',
          sender: 'lu',
          text: '¡Hola! Soy Lu, tu asistente oficial de Motoluv. ¿En qué puedo ayudarte hoy?',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } else {
      setHasGreeted(true);
      setMessages([
        {
          id: 'welcome_prev',
          sender: 'lu',
          text: '¡Hola de nuevo! 🏍️ ¿Tienes alguna duda sobre nuestras motos, tienda o la red de aliados?',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isWavingAnimation]);

  const toggleChat = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState && !hasGreeted) {
      // Trigger waving animation on first contact
      setIsWavingAnimation(true);
      sessionStorage.setItem('motoluv_lu_greeted', 'true');
      setHasGreeted(true);
      setTimeout(() => {
        setIsWavingAnimation(false);
      }, 3500);
    }
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const historyFormatted = messages
        .filter((m) => m.id !== 'welcome_1' && m.id !== 'welcome_prev')
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          content: m.text,
        }));

      const res = await chatApi.send(query, historyFormatted);
      const replyText = res?.reply || '¡Hola! Estoy aquí para ayudarte en Motoluv.';

      const luMsg = {
        id: `lu_${Date.now()}`,
        sender: 'lu',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, luMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `lu_err_${Date.now()}`,
          sender: 'lu',
          text: '¡Ocurrió un pequeño inconveniente en la línea ⚡! Pero puedes explorar nuestras motos en el catálogo.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    '🏍️ Ver motos en catálogo',
    '🛡️ Tienda de accesorios',
    '🤝 Súmate a nuestra red',
    '🔒 ¿Cómo funciona la garantía?',
  ];

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* First Contact Greeting Speech Bubble when closed */}
      {!isOpen && isWavingAnimation && (
        <div className="mb-3 p-3 bg-[#111112] border border-[#E10600]/60 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce max-w-xs text-white text-xs">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#E10600] flex-shrink-0">
            <img src="/lu-avatar.jpg" alt="Lu" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="font-bold text-[#E10600]">¡Hola! Soy Lu 🐾</div>
            <div className="text-zinc-300">¡Haz clic aquí para chatear conmigo! 👋</div>
          </div>
        </div>
      )}

      {/* Floating Trigger Button (Avatar only) */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="group relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#E10600] bg-black shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none ring-2 ring-black/50"
          aria-label="Abrir chat con Lu"
        >
          <img src="/lu-avatar.jpg" alt="Lu" className="w-full h-full object-cover" />
          <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-black rounded-full" />
        </button>
      )}

      {/* Chat Window Widget */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-[#0d0d0e] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-[#111112] border-b border-white/10 flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              <div className={`relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#E10600] bg-black ${isWavingAnimation ? 'animate-bounce' : ''}`}>
                <img src="/lu-avatar.jpg" alt="Lu" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-black rounded-full" />
              </div>
              <div>
                <div className="text-white text-sm font-bold font-display uppercase tracking-wider flex items-center gap-1.5">
                  Lu
                </div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isWavingAnimation ? '¡Saludando! 👋' : 'En línea'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleChat}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                aria-label="Cerrar chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* First-Contact Waving Banner inside Chat Header */}
          {isWavingAnimation && (
            <div className="bg-[#E10600]/15 border-b border-[#E10600]/30 px-4 py-2 flex items-center justify-between text-xs text-white animate-pulse">
              <span className="flex items-center gap-2">
                🐾 ¡Lu te saluda e inicia la conversación!
              </span>
              <span className="text-sm">👋</span>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 custom-scrollbar bg-[#0a0a0a]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 max-w-[85%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {m.sender === 'lu' && (
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-[#E10600] flex-shrink-0 mt-0.5">
                    <img src="/lu-avatar.jpg" alt="Lu" className="w-full h-full object-cover" />
                  </div>
                )}

                <div>
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-[#E10600] text-white rounded-tr-none'
                        : 'bg-[#161618] border border-white/10 text-zinc-200 rounded-tl-none whitespace-pre-wrap'
                    }`}
                  >
                    {m.text}
                  </div>
                  <div className={`text-[9px] text-zinc-500 mt-1 ${m.sender === 'user' ? 'text-right pr-1' : 'pl-1'}`}>
                    {m.time}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 max-w-[85%] items-center">
                <div className="w-7 h-7 rounded-full overflow-hidden border border-[#E10600] flex-shrink-0">
                  <img src="/lu-avatar.jpg" alt="Lu" className="w-full h-full object-cover animate-spin" />
                </div>
                <div className="p-3 rounded-2xl bg-[#161618] border border-white/10 text-zinc-400 text-xs flex items-center gap-2">
                  <RefreshCw size={12} className="animate-spin text-[#E10600]" />
                  Lu está pensando...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-3 py-2 bg-[#0d0d0e] border-t border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s.replace(/^[^\wáéíóúñÁÉÍÓÚÑ]+/, ''))}
                disabled={loading}
                className="px-2.5 py-1 bg-[#161618] hover:bg-[#E10600]/20 border border-white/10 hover:border-[#E10600]/40 text-zinc-300 hover:text-white text-[10px] rounded-full whitespace-nowrap transition-colors flex-shrink-0"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#111112] border-t border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe a Lu..."
              disabled={loading}
              className="flex-1 bg-[#0a0a0a] border border-white/10 focus:border-[#E10600] text-white text-xs rounded-xl px-3.5 py-2.5 outline-none transition-colors placeholder:text-zinc-600"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-[#E10600] hover:bg-red-600 disabled:opacity-40 text-white flex items-center justify-center transition-colors flex-shrink-0 shadow-md"
              aria-label="Enviar mensaje"
            >
              <Send size={14} />
            </button>
          </form>

          {/* Footer Security Notice */}
          <div className="px-3 py-1 bg-[#0a0a0a] border-t border-white/5 text-[9px] text-zinc-500 text-center flex items-center justify-center gap-1">
            <Shield size={10} className="text-emerald-500" />
            Asistente Oficial Motoluv • Tu información está protegida
          </div>
        </div>
      )}
    </div>
  );
};

export default LuChatbot;
