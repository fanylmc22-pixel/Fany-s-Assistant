/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Waveform from './components/Waveform';
import ProfileCard from './components/ProfileCard';
import MicButton from './components/MicButton';
import { useLiveAPI } from './hooks/useLiveAPI';

export default function App() {
  const { isConnected, isSpeaking, error, micLevel, isRecording, toggleRecording } = useLiveAPI();

  const handleMicClick = () => {
    toggleRecording();
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
    </div>
  );
}


