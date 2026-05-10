import { GoogleGenAI, Modality } from '@google/genai';
import { useRef, useState, useCallback, useEffect } from 'react';

const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

export function useLiveAPI() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const outAudioContextRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef(0);
  
  const [micLevel, setMicLevel] = useState(0);

  const disconnect = useCallback(() => {
    if (sessionRef.current) {
        // Can't close properly, but can release references.
        sessionRef.current = null;
    }
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
    }
    if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
    }
    if (outAudioContextRef.current) {
        outAudioContextRef.current.close().catch(console.error);
        outAudioContextRef.current = null;
    }
    setIsConnected(false);
    setIsSpeaking(false);
  }, []);

  const connect = useCallback(async () => {
    try {
      setError(null);
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext({ sampleRate: INPUT_SAMPLE_RATE });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      const outAudioCtx = new AudioContext({ sampleRate: OUTPUT_SAMPLE_RATE });
      outAudioContextRef.current = outAudioCtx;
      nextPlayTimeRef.current = 0;

      const sessionPromise = ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
          },
          systemInstruction: "You are Zahra, an AI assistant for Fany Louis-Mondésir (Marketing Assistant based in Paris). You speak English and French completely bilingual. Be professional and concise. When the conversation starts, introduce yourself exactly with: 'I am Fany’s assistant, how can I help you?' or the French equivalent 'Je suis l'assistante de Fany, comment puis-je vous aider ?'",
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);

            // Trigger the initial greeting
            sessionPromise.then(session => {
                session.send({
                    clientContent: {
                        turns: [{ role: "user", parts: [{ text: "Hello, please introduce yourself to start the conversation." }] }],
                        turnComplete: true,
                    }
                });
            }).catch(console.error);
            
            processor.onaudioprocess = (e) => {
              if (!sessionRef.current) return;
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Calculate rough mic level for visualizing
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) {
                sum += Math.abs(inputData[i]);
              }
              setMicLevel((sum / inputData.length) * 10); // scale up

              // Convert Float32 to Int16
              const pcm16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                const s = Math.max(-1, Math.min(1, inputData[i]));
                pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
              }

              // Int16 to Base64
              const buffer = new Uint8Array(pcm16.buffer);
              let binary = '';
              for (let i = 0; i < buffer.byteLength; i++) {
                binary += String.fromCharCode(buffer[i]);
              }
              const base64 = btoa(binary);

              sessionPromise.then(session => {
                  session.sendRealtimeInput({
                      audio: { data: base64, mimeType: 'audio/pcm;rate=16000' }
                  });
              }).catch(console.error);
            };

            source.connect(processor);
            processor.connect(audioCtx.destination); // Required for Safari/some browsers
          },
          onmessage: async (message: any) => {
             const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
             if (base64Audio && outAudioContextRef.current) {
                setIsSpeaking(true);
                
                const binary = atob(base64Audio);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                    bytes[i] = binary.charCodeAt(i);
                }
                const int16Array = new Int16Array(bytes.buffer);
                const float32Array = new Float32Array(int16Array.length);
                for(let i=0; i < int16Array.length; i++) {
                    float32Array[i] = int16Array[i] / 0x8000;
                }
                
                const outCtx = outAudioContextRef.current;
                const audioBuffer = outCtx.createBuffer(1, float32Array.length, OUTPUT_SAMPLE_RATE);
                audioBuffer.getChannelData(0).set(float32Array);
                
                const playSource = outCtx.createBufferSource();
                playSource.buffer = audioBuffer;
                playSource.connect(outCtx.destination);
                
                const currentTime = outCtx.currentTime;
                if (nextPlayTimeRef.current < currentTime) {
                    nextPlayTimeRef.current = currentTime;
                }
                playSource.start(nextPlayTimeRef.current);
                nextPlayTimeRef.current += audioBuffer.duration;

                playSource.onended = () => {
                    const latestTime = outAudioContextRef.current?.currentTime || 0;
                    if (latestTime >= nextPlayTimeRef.current - 0.1) {
                         setIsSpeaking(false);
                    }
                }
             }

             if (message.serverContent?.interrupted) {
                 if (outAudioContextRef.current) {
                     outAudioContextRef.current.close().catch(console.error);
                     outAudioContextRef.current = new AudioContext({ sampleRate: OUTPUT_SAMPLE_RATE });
                     nextPlayTimeRef.current = 0;
                 }
                 setIsSpeaking(false);
             }
          },
          onerror: (err: any) => {
              console.error(err);
              setError("An error occurred");
              disconnect();
          },
          onclose: () => {
              disconnect();
          }
        }
      });
      
      sessionRef.current = await sessionPromise;
      
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      disconnect();
    }
  }, [disconnect]);

  useEffect(() => {
     return () => {
         disconnect();
     }
  }, [disconnect]);

  return { connect, disconnect, isConnected, isSpeaking, error, micLevel };
}
