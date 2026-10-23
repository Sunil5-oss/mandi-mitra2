import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChatMessage } from '../types';
import {
  MessageSquare,
  Send,
  RotateCcw,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Sparkles,
  Bot,
  User,
  Scale,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const AIChatAssistant: React.FC = () => {
  const {
    language,
    farmerProfile,
    selectedCrop,
    cropQuantity,
    calculatedResults,
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text:
        language === 'hi'
          ? `नमस्ते ${farmerProfile.name} जी! 🙏 मैं हूँ आपका **मंडी मित्र AI**।\n\nमैं आपकी फसलों की देखरेख, सही मंडी व भाव चुनने, शुद्ध मुनाफा (Net In-Hand Return) की सटीक गणना करने, तथा सरकारी व कंपनी वारंटी योजनाओं में मदद कर सकता हूँ।\n\nआज आप क्या जानना चाहते हैं?`
          : `Hello ${farmerProfile.name}! 🙏 I am **Mandi Mitra AI**, your personalized agricultural and mandi market advisor.\n\nI can help you calculate real net profits across different mandis, advise on IPM disease management, fertilizer split doses, and official crop assurance programs.\n\nHow can I help your farm today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        'मेरे पास 40 क्विंटल सरसों है, नीमच या कोटा कहाँ ज्यादा बचेगा?',
        'गेहूं में प्रथम सिंचाई और यूरिया की सही खुराक क्या है?',
        'सिंजेंटा और बायर की बीज अंकुरण गारंटी के नियम क्या हैं?',
        'पीएम किसान 17वीं किस्त या फसल बीमा क्लेम कैसे करें?',
      ],
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputQuery((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [language]);

  const toggleVoiceInput = () => {
    if (!speechSupported || !recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Speech recognition start failed', err);
        setIsListening(false);
      }
    }
  };

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Strip markdown formatting for cleaner audio
    const cleanText = text.replace(/[*_#`[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const q = (textToSend || inputQuery).trim();
    if (!q || isLoading) return;

    // Stop speaking if speaking
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'farmer',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Build context of current active calculation
      const bestOpt = calculatedResults[0];
      const context = {
        farmerName: farmerProfile.name,
        state: farmerProfile.state,
        district: farmerProfile.district,
        crop: selectedCrop,
        quantity: cropQuantity,
        bestOption: bestOpt ? bestOpt.option.name : undefined,
        bestNetReturn: bestOpt ? bestOpt.estimatedNetReturn : undefined,
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          history: messages.slice(-6),
          context,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned error ${res.status}`);
      }

      const data = await res.json();
      const aiReplyText = data.reply || 'क्षमा करें, प्रतिक्रिया प्राप्त नहीं हो सकी।';

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      // Graceful agricultural fallback
      const fallbackReply =
        language === 'hi'
          ? `किसान भाई, नेटवर्क या सर्वर में अस्थायी समस्या आई है। \n\nयदि आप अपनी फसल (${selectedCrop}, ${cropQuantity} क्विंटल) के शुद्ध मुनाफे के बारे में पूछ रहे हैं, तो हमारे **शुद्ध मुनाफा कैलकुलेटर** टैब पर जाकर सीधे विभिन्न मंडियों के भाड़ा और आढ़त खर्च जोड़कर तुलना देख सकते हैं।`
          : `Dear farmer, there was a temporary connectivity issue with the AI backend. You can verify your net in-hand return directly using the Net Return Advisor tab.`;

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text:
          language === 'hi'
            ? 'नयी बातचीत शुरू की गई। कृपया अपना कृषि या मंडी संबंधित प्रश्न पूछें।'
            : 'New conversation started. Ask any agriculture, mandi price, or crop protection question.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-bold text-lg shadow-sm">
            🤖
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-extrabold text-emerald-950">
                {language === 'hi' ? 'कृषि मित्र AI सहायक' : 'Agri AI Assistant'}
              </h1>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Gemini 3.8-Flash
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {language === 'hi'
                ? 'शुद्ध मुनाफा गणना • फसल सलाह • रोग पहचान • बीज वारंटी'
                : 'Mandi Net Returns • Agronomy • Pest Management • Assurance'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isSpeaking && (
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                }
              }}
              className="flex items-center space-x-1 px-3 py-1.5 bg-amber-100 text-amber-900 rounded-lg text-xs font-bold animate-pulse"
            >
              <VolumeX className="w-4 h-4" />
              <span>आवाज बंद करें</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleResetChat}
            className="flex items-center space-x-1 px-3 py-1.5 border border-gray-200 text-gray-600 hover:text-emerald-900 hover:bg-gray-50 rounded-lg text-xs font-semibold transition-colors"
            title="नयी बातचीत"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === 'hi' ? 'नयी चैट' : 'New Chat'}</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50/70 rounded-2xl p-4 sm:p-6 border border-emerald-100/70 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'farmer';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                  isUser ? 'bg-amber-500 text-emerald-950' : 'bg-emerald-800 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-amber-300" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-[75%] space-y-1`}>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                    isUser
                      ? 'bg-emerald-800 text-white rounded-tr-none'
                      : 'bg-white text-gray-900 border border-emerald-100 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Footer Bar: Timestamp & Audio Speak button */}
                <div
                  className={`flex items-center space-x-2 text-[10px] text-gray-400 px-1 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => speakText(msg.text)}
                      className="text-gray-400 hover:text-emerald-700 transition-colors p-0.5"
                      title="आवाज में सुनें"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Suggested Chips if available on initial message */}
                {msg.suggestedActions && (
                  <div className="pt-2 space-y-1.5">
                    <span className="text-[11px] font-bold text-gray-500 block">
                      {language === 'hi' ? 'सुझाए गए प्रश्न:' : 'Suggested questions:'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((action, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSendMessage(action)}
                          className="text-xs bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-200 px-2.5 py-1.5 rounded-lg font-medium transition-colors text-left"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-amber-300" />
            </div>
            <div className="bg-white p-3.5 rounded-2xl rounded-tl-none border border-emerald-100 shadow-xs flex items-center space-x-2 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
              <span>
                {language === 'hi'
                  ? 'मंडी मित्र AI विचार कर रहा है...'
                  : 'Mandi Mitra AI is thinking...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box & Voice Controls */}
      <div className="bg-white p-3 rounded-2xl border border-emerald-100 shadow-sm shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          {/* Voice Input Button */}
          {speechSupported && (
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse border-red-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
              }`}
              title={isListening ? 'माइक बंद करें' : 'बोलकर पूछें (Voice input)'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}

          {/* Text Input Field */}
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={
              isListening
                ? 'सुन रहा हूँ... बोलिए...'
                : language === 'hi'
                ? 'फसल, खाद, मंडी भाव या बिक्री मुनाफे के बारे में पूछें...'
                : 'Ask about crop care, fertilizer dosage, or selling net returns...'
            }
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5"
          >
            <span>{language === 'hi' ? 'भेजें' : 'Send'}</span>
            <Send className="w-4 h-4 text-amber-300" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChatAssistant;
