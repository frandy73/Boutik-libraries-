import React, { useRef, useEffect } from 'react';
import { Message } from '../types';
import { Send, Bot, User, Sparkles, BookOpen, Info } from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
}

const SUGGESTIONS = [
  "Livre Père Riche Père Pauvre",
  "Romans haïtiens ?",
  "Livres sur le business",
  "L'Alchimiste Paulo Coelho",
  "Développement personnel"
];

// Placeholder for missing images inside chat
const BOOK_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 19.5A2.5 2.5 0 0 1 6.5 17H20'/%3E%3Cpath d='M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'/%3E%3C/svg%3E";

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading, onSendMessage }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = React.useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 space-y-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-indigo-500">
              <BookOpen size={32} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-700">Bienvenue à BOUTIK PAW !</h3>
              <p className="max-w-xs mx-auto text-sm mt-1">
                Je suis votre libraire virtuel. Cherchez-vous un roman, un guide pratique ou un classique ?
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-sm">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(s)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col w-full ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`flex max-w-[85%] sm:max-w-[70%] gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-200' : 'bg-indigo-600'}`}>
                {msg.role === 'user' ? <User size={16} className="text-slate-600" /> : <Bot size={16} className="text-white" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-white text-slate-800 rounded-tr-none border border-slate-100' 
                  : 'bg-indigo-600 text-white rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </div>

            {/* PRODUCT CARDS (Summary & Details) displayed BELOW the message */}
            {msg.relatedProducts && msg.relatedProducts.length > 0 && (
              <div className={`mt-3 space-y-3 w-full max-w-[85%] sm:max-w-[70%] ${msg.role === 'user' ? 'mr-10' : 'ml-10'}`}>
                {msg.relatedProducts.map(product => (
                  <div key={product.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                    {/* Thumbnail */}
                    <div className="w-14 h-20 bg-slate-50 rounded-lg flex-shrink-0 overflow-hidden border border-slate-100 flex items-center justify-center">
                      <img 
                        src={product.imageUrl || BOOK_PLACEHOLDER} 
                        alt={product.description}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = BOOK_PLACEHOLDER; }}
                      />
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-800 text-sm line-clamp-2 leading-tight">
                          {product.description}
                        </h4>
                      </div>
                      <div className="text-xs text-indigo-600 font-semibold mt-1">
                         {product.price > 0 ? `${product.price.toLocaleString('fr-HT')} HTG` : 'Sur Devis'}
                      </div>
                      
                      {/* SUMMARY SECTION */}
                      {product.summary && (
                        <div className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                          <span className="font-semibold not-italic text-slate-400 text-[10px] uppercase block mb-0.5">Résumé</span>
                          {product.summary}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex w-full justify-start">
            <div className="flex max-w-[80%] gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSubmit} className="flex gap-2 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Titre, auteur, ou genre..."
            className="flex-1 bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`p-3 rounded-xl flex items-center justify-center transition-all ${
              !inputText.trim() || isLoading
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md active:scale-95'
            }`}
          >
            {isLoading ? <Sparkles size={20} className="animate-pulse" /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;