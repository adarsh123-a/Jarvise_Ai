import { useState, useRef, useEffect } from "react";

function User() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("en-IN"); // Default to English
  const isVoiceRef = useRef(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom when chat updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    setIsLoading(true);
    isVoiceRef.current = false;
    const newChat = [...chat, { user: message }];
    setChat(newChat);
    setMessage("");

    try {
      const res = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      setChat([...newChat, { bot: data.reply }]);
      speak(data.reply);
    } catch (error) {
      console.error("Error:", error);
      setChat([...newChat, { bot: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    isVoiceRef.current = true;

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = language; // Use selected language
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      handleAutoSend(text);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      isVoiceRef.current = false;
    };

    recognition.start();
  };

  const handleAutoSend = async (text) => {
    if (!text) return;
    
    setIsLoading(true);
    const newChat = [...chat, { user: text }];
    setChat(newChat);
    
    try {
      const res = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      setChat((prev) => [...prev, { bot: data.reply }]);
      if (isVoiceRef.current) {
        speak(data.reply);
        isVoiceRef.current = false;
      }
    } catch (error) {
      console.error("Error:", error);
      setChat((prev) => [...prev, { bot: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = language; // Use selected language for speech
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === "en-IN" ? "hi-IN" : "en-IN");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-black/40 via-purple-900/30 to-black/40 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center justify-center gap-4 flex-1">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl animate-pulse-glow animate-gradient">
                🤖
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                Jarvis AI
              </h1>
            </div>
            
            {/* Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              className="px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white/20 whitespace-nowrap"
            >
              <span className="flex items-center gap-2 text-sm md:text-base">
                <span className="text-lg">{language === "en-IN" ? "🇬🇧" : "🇮🇳"}</span>
                <span className="hidden md:inline">{language === "en-IN" ? "English" : "हिंदी"}</span>
              </span>
            </button>
          </div>
          <p className="text-center text-gray-300 mt-4 text-base md:text-lg lg:text-xl font-light tracking-wide">
            Your intelligent voice-enabled assistant
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="bg-gradient-to-br  via-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Messages Area */}
          <div className="h-[calc(100vh-380px)] md:h-[calc(100vh-400px)]  p-6 md:p-8 space-y-6">
            {chat.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-fade-in">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-5xl animate-float animate-pulse-glow">
                  💬
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                    Welcome to Jarvis AI
                  </h2>
                  <p className="text-gray-300 text-base md:text-lg max-w-md mx-auto leading-relaxed">
                    Type a message or click the microphone to start speaking with your AI assistant
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 justify-center mt-4">
                  <div className="px-4 py-2 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-full text-blue-300 text-sm">
                    ✨ Smart Responses
                  </div>
                  <div className="px-4 py-2 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full text-purple-300 text-sm">
                    🎤 Voice Enabled
                  </div>
                  <div className="px-4 py-2 bg-pink-500/20 backdrop-blur-sm border border-pink-500/30 rounded-full text-pink-300 text-sm">
                    ⚡ Real-time Chat
                  </div>
                </div>
              </div>
            ) : (
              chat.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.user ? "justify-end animate-slide-right" : "justify-start animate-slide-left"}`}
                >
                  <div
                    className={`max-w-[90%] md:max-w-[80%] lg:max-w-[70%] rounded-2xl px-6 py-4 shadow-xl transform hover:scale-[1.02] transition-all duration-300 ${
                      msg.user
                        ? "bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white rounded-br-md border border-blue-400/30"
                        : "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm text-gray-100 border border-white/30 rounded-bl-md"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{msg.user ? "👤" : "🤖"}</span>
                      <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                        {msg.user ? "You" : "Jarvis"}
                      </span>
                      <span className="text-xs opacity-60">
                        {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm md:text-base lg:text-lg leading-relaxed whitespace-pre-wrap">
                      {msg.user ? msg.user : msg.bot}
                    </p>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl rounded-bl-md px-6 py-4 border border-white/30 shadow-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🤖</span>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                    <span className="text-sm text-gray-300 ml-2">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

        </div>
          {/* Input Area */}
          <div className="border-t mt-4 border-white/20 bg-gradient-to-r from-black/30 via-purple-900/20 to-black/30 backdrop-blur-xl p-6 md:p-8">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    disabled={isLoading}
                    className="w-full px-6 py-4 md:px-8 md:py-5 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 disabled:opacity-50 text-sm md:text-base lg:text-lg shadow-inner"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm hidden md:block">
                    Press Enter ↵
                  </div>
                </div>
                <div className="flex gap-3 md:gap-4">
                  <button
                    onClick={startListening}
                    disabled={isLoading}
                    className="flex-1 md:flex-none px-6 py-4 md:px-8 md:py-5 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm md:text-base lg:text-lg border border-green-400/30"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="text-xl">🎤</span>
                      <span className="hidden md:inline">Speak</span>
                    </span>
                  </button>
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !message.trim()}
                    className="flex-1 md:flex-none px-6 py-4 md:px-8 md:py-5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm md:text-base lg:text-lg border border-purple-400/30 animate-gradient"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span>Send</span>
                      <span className="text-xl">➤</span>
                    </span>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs md:text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  AI Ready
                </span>
                <span>•</span>
                <span>Voice Enabled</span>
                <span>•</span>
                <span>Real-time Response</span>
              </div>
            </div>
          </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-gray-400 text-sm md:text-base font-light tracking-wide">
            Powered by AI • Voice Enabled • Built with React & Tailwind CSS
          </p>
          <div className="flex justify-center gap-3 text-xs text-gray-500">
            <span className="px-3 py-1 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
              🚀 Fast
            </span>
            <span className="px-3 py-1 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
              💬 Smart
            </span>
            <span className="px-3 py-1 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
              🎯 Accurate
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default User;