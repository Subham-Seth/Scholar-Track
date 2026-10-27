import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User as UserIcon,
  HelpCircle,
  ShieldCheck,
  RotateCcw,
  BookOpen,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { aiApi } from '../services/api.js';
import { ChatMessage } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';

export const ScholarBotPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialPrompt = searchParams.get('prompt');
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `### 👋 Welcome to ScholarBot!

I am your intelligent scholarship advisor on **Scholar-Track**. I can assist you with:
- Finding scholarships that match your academic stream & family income
- Understanding mandatory document requirements (income certificates, bonafide letters)
- Drafting essays, Statements of Purpose (SOP), and application emails
- Checking eligibility criteria before you apply

How can I help you today? Choose one of the quick prompts below or type your question!`,
      suggestedQuestions: [
        'Which scholarships match undergraduate students with income < 5 LPA?',
        'What documents are needed for government scholarships?',
        'How do I write an effective scholarship Statement of Purpose?',
        'Tell me about the AICTE Pragati Scholarship for girls.',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [providerUsed, setProviderUsed] = useState<string>('Knowledge Engine');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle URL pre-filled prompt
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() !== '') {
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

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

      if (res.providerUsed) {
        setProviderUsed(
          res.providerUsed === 'gemini'
            ? 'Google Gemini AI'
            : res.providerUsed === 'openai'
            ? 'OpenAI'
            : 'Rule & Database Knowledge Engine'
        );
      }

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

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Conversation cleared. How else can I assist you?',
        suggestedQuestions: [
          'Which scholarships match undergraduate students?',
          'What documents are needed for government schemes?',
        ],
      },
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              ScholarBot AI Assistant
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Intelligent scholarship consultation grounded in real database criteria.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
            <span>Active: {providerUsed}</span>
          </div>

          <button
            onClick={handleClearChat}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Chat Stream Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
        {/* Messages list */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/50 text-sm">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3.5 ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-800'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed text-xs sm:text-sm prose prose-sm max-w-none">
                  {m.content}
                </div>

                {/* Grounded Scholarships List */}
                {m.groundedScholarships && m.groundedScholarships.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Referenced Verified Scholarships:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {m.groundedScholarships.map((s) => (
                        <div
                          key={s.id}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col justify-between"
                        >
                          <div>
                            <span className="font-bold text-indigo-700 block truncate">
                              {s.title}
                            </span>
                            <span className="text-[11px] text-emerald-700 font-semibold">
                              {s.awardAmount}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-[11px]">
                            <Link
                              to={`/scholarships/${s.id}`}
                              className="text-indigo-600 hover:underline font-semibold"
                            >
                              View Criteria
                            </Link>
                            {s.officialUrl && (
                              <a
                                href={s.officialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-slate-500 hover:text-slate-800"
                              >
                                Portal <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Follow-up Prompts */}
                {m.suggestedQuestions && m.suggestedQuestions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">
                      Suggested Follow-ups:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {m.suggestedQuestions.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => handleSend(q)}
                          className="text-xs px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg border border-purple-200 text-left transition flex items-center gap-1"
                        >
                          <span>{q}</span>
                          <ChevronRight className="w-3 h-3 text-purple-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0 mt-1 font-bold text-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2.5 text-slate-500 text-xs">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <span className="animate-pulse">ScholarBot is formulating guidance...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 bg-white border-t border-slate-200 flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask ScholarBot any question about eligibility, scholarships, or documents..."
            className="flex-1 text-xs sm:text-sm px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50/50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex items-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-xs sm:text-sm transition shadow-sm disabled:opacity-50"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Educational Disclaimer */}
      <div className="p-3 bg-slate-100/70 border border-slate-200 rounded-xl text-[11px] text-slate-500 text-center leading-normal">
        ScholarBot provides guidance and discovery assistance based on database records. It does not issue official scholarship grants or decisions.
      </div>
    </div>
  );
};
