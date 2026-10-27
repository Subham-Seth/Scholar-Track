import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Maximize2,
  ExternalLink,
  Bot,
  User as UserIcon,
} from 'lucide-react';
import { aiApi } from '../../services/api.js';
import { ChatMessage } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';

export const ScholarBotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hello! I am **ScholarBot**, your scholarship advisor. How can I help you find or prepare for scholarships today?",
      suggestedQuestions: [
        'Which scholarships match undergraduate students?',
        'What documents are needed for state schemes?',
        'How do I write an effective scholarship essay?',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await aiApi.chat({
        message: textToSend.trim(),
        history: historyPayload,
        profile: user
          ? {
              educationLevel: user.educationLevel,
              academicPercentage: user.academicPercentage,
              annualIncome: user.annualIncome,
              state: user.state,
              category: user.category,
              gender: user.gender,
            }
          : undefined,
      });

      const botReply: ChatMessage = {
        role: 'assistant',
        content: res.reply,
        suggestedQuestions: res.suggestedQuestions,
        groundedScholarships: res.groundedScholarships,
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "I'm sorry, I encountered an issue retrieving that information. Please try rephrasing your question or check the official directory.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:scale-105 group"
          aria-label="Open ScholarBot Assistant"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <span className="text-sm font-semibold tracking-wide pr-1">Ask ScholarBot</span>
        </button>
      )}

      {/* Slide-out Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-[92vw] sm:w-[400px] h-[550px] max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold flex items-center gap-1.5">
                  ScholarBot
                  <span className="text-[10px] bg-purple-900/80 text-purple-300 px-1.5 py-0.2 rounded border border-purple-700/50">
                    AI
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400">Scholarship Discovery Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                to="/scholarbot"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title="Expand full screen"
              >
                <Maximize2 className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/60 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="whitespace-pre-line leading-relaxed">{m.content}</div>

                  {/* Grounded Scholarships preview */}
                  {m.groundedScholarships && m.groundedScholarships.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">
                        Matched In Database:
                      </p>
                      {m.groundedScholarships.map((s) => (
                        <div
                          key={s.id}
                          className="bg-slate-50 p-1.5 rounded-lg border border-slate-200 text-[11px]"
                        >
                          <p className="font-semibold text-indigo-700 truncate">{s.title}</p>
                          <p className="text-slate-500 text-[10px]">{s.awardAmount}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Follow-up suggestions */}
                  {m.suggestedQuestions && m.suggestedQuestions.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                      {m.suggestedQuestions.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => handleSend(q)}
                          className="text-[10px] px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-md border border-purple-200 text-left transition"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {m.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-center text-slate-500 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span>ScholarBot is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about scholarships, criteria..."
              className="flex-1 text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
