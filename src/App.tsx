/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Waveform from './components/Waveform';
import ProfileCard from './components/ProfileCard';
import MicButton from './components/MicButton';
import { useLiveAPI } from './hooks/useLiveAPI';
import { useState } from 'react';

export default function App() {
  const { isConnected, isSpeaking, error, micLevel, isRecording, toggleRecording } = useLiveAPI();
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');

  const handleMicClick = () => {
    // If not running in AI Studio, no VITE key is set, and no key is stored, ask for it
    if (!process.env.GEMINI_API_KEY && !import.meta.env.VITE_GEMINI_API_KEY && !localStorage.getItem('gemini_api_key')) {
        setShowApiKeyModal(true);
        return;
    }
    
    const keyToUse = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || undefined;
    toggleRecording(keyToUse);
  };

  const handleSaveApiKey = () => {
      if (apiKeyInput.trim()) {
          localStorage.setItem('gemini_api_key', apiKeyInput.trim());
          setShowApiKeyModal(false);
          toggleRecording(apiKeyInput.trim());
      }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background text-slate-100 font-sans selection:bg-primary/20 flex flex-col items-center">
      {/* Ambient Background Lights */}
      <div className={`fixed top-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none -z-10 transition-colors duration-1000 ${isRecording ? 'bg-primary/20' : 'bg-primary/10'}`}></div>
      <div className={`fixed bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full blur-[140px] pointer-events-none -z-10 transition-colors duration-1000 ${isSpeaking ? 'bg-tertiary/20' : 'bg-tertiary/10'}`}></div>
      
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 glass-panel border-b border-x-0 border-t-0 rounded-none bg-background/50">
        <div className="flex items-center justify-center px-6 h-16 w-full">
          <span className="text-white font-medium text-lg tracking-wide">Zahra</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-6 pb-6 flex flex-col items-center max-w-md w-full mx-auto min-h-screen relative z-10 flex-1">
        <Waveform isRecording={isRecording} isSpeaking={isSpeaking} micLevel={micLevel} />

        <div className="text-center space-y-8 w-full mt-4">
          <h2 className="text-slate-300 text-lg font-medium leading-relaxed">
            I am Fany's assistant, how can I help you?
          </h2>
          <ProfileCard />
        </div>

        <MicButton isRecording={isRecording} isSpeaking={isSpeaking} onClick={handleMicClick} error={error} />
      </main>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass-panel p-6 rounded-2xl w-full max-w-sm flex flex-col gap-4 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4">
                <button onClick={() => setShowApiKeyModal(false)} className="text-slate-400 hover:text-white transition-colors">
                  &times;
                </button>
             </div>
             <h3 className="text-xl font-medium text-white mb-2">API Key Required</h3>
             <p className="text-sm text-slate-300 leading-relaxed mb-4">
               To use Zahra outside of AI Studio, please provide an active Gemini API key. It will be stored safely in your browser.
             </p>
             <input 
                type="password"
                placeholder="AIza..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
             />
             <button 
                onClick={handleSaveApiKey}
                disabled={!apiKeyInput.trim()}
                className="w-full py-3 mt-2 rounded-lg bg-primary/20 text-primary font-medium hover:bg-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
               Save & Continue
             </button>
          </div>
        </div>
      )}
    </div>
  );
}


