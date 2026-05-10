/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Waveform from './components/Waveform';
import ProfileCard from './components/ProfileCard';
import MicButton from './components/MicButton';

export default function App() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background text-slate-100 font-sans selection:bg-primary/20 flex flex-col items-center">
      {/* Ambient Background Lights */}
      <div className="fixed top-[-15%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-tertiary/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 glass-panel border-b border-x-0 border-t-0 rounded-none bg-background/50">
        <div className="flex items-center justify-center px-6 h-16 w-full">
          <span className="text-white font-medium text-lg tracking-wide">Zahra</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-6 pb-6 flex flex-col items-center max-w-md w-full mx-auto min-h-screen relative z-10 flex-1">
        <Waveform />

        <div className="text-center space-y-8 w-full mt-4">
          <h2 className="text-slate-300 text-lg font-medium leading-relaxed">
            I am Zahra's assistant, how can I help you?
          </h2>
          <ProfileCard />
        </div>

        <MicButton />
      </main>
    </div>
  );
}

