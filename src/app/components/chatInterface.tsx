import { useState, useRef, useEffect } from 'react';
import { askAI } from '../backend/aiManager';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

interface ChatInterfaceProps {
  onDataChanged?: () => void; // Call this when data (like flights) changes
}

export default function ChatInterface({ onDataChanged }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // For OpenAI, keep a parallel array of {role, content} for context
  const getOpenAIMessages = () =>
    messages.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }));

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg: ChatMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const aiText = await askAI(userMsg.text, getOpenAIMessages(), onDataChanged);
      setMessages((prev) => [...prev, { sender: 'ai', text: aiText }]);
    } catch {
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Sorry, there was an error contacting the AI.' }]);
    }
    setLoading(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex flex-col h-full max-h-full bg-white border border-gray-200 rounded-xl shadow-md">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white rounded-t-xl">
        {messages.length === 0 && (
          <div className="text-gray-400 text-center">Ask the AI assistant about your flight schedule!</div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} transition-all duration-200`}
          >
            <span
              className={
                msg.sender === 'user'
                  ? 'inline-block bg-blue-600 text-white px-4 py-2 rounded-2xl mb-1 max-w-xs text-base shadow-md'
                  : 'inline-block bg-gray-100 text-gray-900 px-4 py-2 rounded-2xl mb-1 max-w-xs text-base shadow'
              }
              style={{ wordBreak: 'break-word', lineHeight: '1.5' }}
            >
              {msg.text}
            </span>
          </div>
        ))}
        {loading && (
          <div className="text-gray-400 text-center">AI is typing...</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={sendMessage}
        className="flex items-center border-t p-3 bg-white rounded-b-xl shadow-inner"
        style={{ position: 'relative' }}
      >
        <input
          type="text"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200 text-base bg-gray-50"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="ml-3 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow"
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}
