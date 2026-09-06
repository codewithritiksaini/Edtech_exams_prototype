import React, { useState } from 'react';
import { 
  X, 
  Radio, 
  Send, 
  Users, 
  Hand, 
  Smile, 
  Volume2, 
  Maximize2, 
  MessageSquare,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function LiveSessionModal({ isOpen, onClose, session }) {
  if (!isOpen || !session) return null;

  const [chatMessages, setChatMessages] = useState([
    { sender: 'Dr. Priya M.', text: 'Good evening Dr. Siddharth! Excited for this case drill.', time: '8:01 PM' },
    { sender: 'Dr. Rohan K.', text: 'Sir, what if patient is in acute cardiogenic shock?', time: '8:03 PM' },
    { sender: 'Moderator', text: 'Please post questions in the Q&A tab. Slides will be available after the session.', time: '8:04 PM', isMod: true }
  ]);
  const [inputText, setInputText] = useState('');
  const [handRaised, setHandRaised] = useState(false);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setChatMessages([
      ...chatMessages,
      { sender: 'Dr. Ritik Saini (You)', text: inputText.trim(), time: 'Just now', isUser: true }
    ]);
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-[85vh] max-h-[720px] overflow-hidden shadow-2xl flex flex-col text-white relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/90 text-white text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              LIVE BROADCAST
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-100 truncate max-w-xs sm:max-w-md">
              {session.title}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg">
              <Users className="w-3.5 h-3.5 text-brand-400" />
              <span>{session.attendeesCount + 1} Doctors Online</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Content: Video Stream (Left) + Interactive Chat (Right) */}
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* Main Video Stream */}
          <div className="lg:col-span-8 bg-slate-950 flex flex-col justify-between p-4 relative overflow-hidden">
            
            {/* Faculty Video Simulation Screen */}
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex flex-col justify-between p-5">
              <img
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&auto=format&fit=crop&q=80"
                alt="Faculty Stream"
                className="absolute inset-0 w-full h-full object-cover opacity-25"
              />

              {/* Top info badge inside stream */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white">{session.faculty}</span>
                </div>
                <span className="text-[11px] bg-black/60 px-2 py-1 rounded text-slate-300">1080p 60fps</span>
              </div>

              {/* Center Clinical Case Slide Overlay */}
              <div className="relative z-10 max-w-md mx-auto text-center bg-slate-950/80 p-5 rounded-2xl border border-slate-800/90 backdrop-blur-sm space-y-2">
                <span className="text-[10px] font-extrabold text-brand-400 uppercase tracking-wider">
                  Clinical Vignette Demonstration #04
                </span>
                <h4 className="text-sm font-bold text-white leading-snug">
                  58-year-old male with 2-hour crushing substernal chest pain. 
                  ST-elevations &gt; 2mm in V1–V4.
                </h4>
                <div className="flex justify-center gap-2 text-[11px] text-slate-300 pt-1">
                  <span className="px-2 py-0.5 bg-red-950 text-red-300 rounded border border-red-800/50">Anterior Wall STEMI</span>
                  <span className="px-2 py-0.5 bg-blue-950 text-blue-300 rounded border border-blue-800/50">LAD Occlusion</span>
                </div>
              </div>

              {/* Bottom Stream Controls Bar */}
              <div className="relative z-10 flex items-center justify-between bg-black/70 backdrop-blur-md p-3 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setHandRaised(!handRaised)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                      handRaised ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    <Hand className="w-3.5 h-3.5" />
                    <span>{handRaised ? 'Hand Raised ✋' : 'Raise Hand'}</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Audio: HD Stereo</span>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Live Chat & Q&A Stream */}
          <div className="lg:col-span-4 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between h-full">
            
            <div className="p-3 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <MessageSquare className="w-4 h-4 text-brand-400" />
                <span>Live Student Chat</span>
              </div>
              <span className="text-[10px] text-slate-400">Slow mode (5s)</span>
            </div>

            {/* Messages Scroll Area */}
            <div className="p-4 space-y-3 overflow-y-auto flex-grow max-h-72 lg:max-h-none text-xs">
              {chatMessages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`p-2.5 rounded-xl space-y-0.5 ${
                    msg.isUser 
                      ? 'bg-brand-950/70 border border-brand-800/60 ml-3' 
                      : msg.isMod 
                        ? 'bg-amber-950/50 border border-amber-800/40' 
                        : 'bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${msg.isUser ? 'text-brand-300' : msg.isMod ? 'text-amber-400 font-black' : 'text-slate-300'}`}>
                      {msg.sender}
                    </span>
                    <span className="text-[9px] text-slate-500">{msg.time}</span>
                  </div>
                  <p className="text-slate-200 leading-snug">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask faculty or discuss with peers..."
                className="flex-grow px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                className="p-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>

        </div>

      </div>
    </div>
  );
}
