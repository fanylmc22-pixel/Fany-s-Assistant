import { GoogleGenAI, Modality } from '@google/genai';
import { useRef, useState, useCallback, useEffect } from 'react';

const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

export function useLiveAPI() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const outAudioContextRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef(0);
  
  const [micLevel, setMicLevel] = useState(0);

  const isRecordingRef = useRef(false);

  useEffect(() => {
     isRecordingRef.current = isRecording;
  }, [isRecording]);

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
    setIsRecording(false);
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
          systemInstruction: "You are Zahra, an AI assistant for Fany Louis-Mondésir (Marketing Assistant based in Paris). You are completely bilingual in English and French. Carefully detect the language of the user's input, and ALWAYS respond in the exact same language they used. If they speak French, reply in French. If they speak English, reply in English. Be professional and concise. When replying for the first time in the conversation, make sure your first sentence introduces yourself as: 'I am Fany\\'s assistant, how can I help you?' or the French equivalent 'Je suis l\\'assistante de Fany, comment puis-je vous aider ?'. CRITICAL INSTRUCTION: You MUST ONLY answer questions related to Fany Louis-Mondésir and her CV/professional background. If a user asks about anything else (e.g., general knowledge, coding, weather, math), politely refuse and guide the conversation back to Fany's profile. Here is the complete information from Fany's CV. Name: Fany Louis-Mondésir. Title: Marketing Assistant. Contact: +33 6 73 12 37 25 | flouismondesir@hotmail.com | Paris, Île-de-France. About Her: Graduate with a Master's degree in International Consumer Marketing, passionate about digital marketing and strategic communication. Seeking a Marketing Assistant position to leverage her skills within innovative teams and contribute to high-value-added projects in a dynamic/international environment. Education: 1) International Business Bachelor at ESCE (La Défense, Courbevoie) | Sep 2024 - Present (Gained solid foundations in international business, market analysis, and global commercial strategy). 2) Master of International Consumer Marketing at ESCE (La Défense, Courbevoie) | 2021-2023 (Developed strong expertise in consumer behavior, digital marketing strategy, and international brand management). Experience: 1) LexisNexis | Go-to-Market Assistant for Continental Europe and French-Speaking Africa | Feb 2025 - Present. (Deployment of multichannel campaigns like events/nurturing/prospecting, creation/localization of marketing and sales materials, management/optimization of LinkedIn editorial calendar, development of automated nurturing workflows in Pardot, updating LexisNexis web pages via OpenText, and regular LinkedIn performance analysis). 2) Medef International | CRM Assistant | Feb 2023 - July 2023. (Database updates/administration, proactive follow-ups by phone/email with partners/prospects, event preparation/coordination including logistics, invitation management, and onboarding emails). 3) Glam&Cosy | Digital Marketing and Communication Assistant | July 2022 - Aug 2022. (Created product sheets, managed Shopify site, produced photo edits/flyers/thank-you cards via Canva, managed social media platforms). Skills: Visual content creation, Data Analysis, Social media management. Tools: CRM (HubSpot, Salesforce Pardot), Canva, Microsoft Office Suite, Opentext. Languages: French (Native), English (Professional).",
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            
            processor.onaudioprocess = (e) => {
              if (!sessionRef.current || !isRecordingRef.current) {
                  setMicLevel(0);
                  return;
              }
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
             console.log("LiveAPI message:", message);
             
             if (message.serverContent?.modelTurn?.parts) {
                 for (const part of message.serverContent.modelTurn.parts) {
                     if (part.inlineData && part.inlineData.data) {
                         const base64Audio = part.inlineData.data;
                         if (outAudioContextRef.current) {
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

  const toggleRecording = useCallback(async () => {
      if (isRecording) {
          setIsRecording(false);
          if (sessionRef.current) {
              sessionRef.current.sendClientContent({ turnComplete: true });
          }
      } else {
          if (!isConnected) {
              await connect();
          }
          
          if (outAudioContextRef.current) {
              outAudioContextRef.current.close().catch(console.error);
              outAudioContextRef.current = new AudioContext({ sampleRate: OUTPUT_SAMPLE_RATE });
              nextPlayTimeRef.current = 0;
          }
          setIsSpeaking(false);
          setIsRecording(true);
      }
  }, [isRecording, isConnected, connect, isSpeaking]);

  return { connect, disconnect, isConnected, isSpeaking, error, micLevel, isRecording, toggleRecording };
}
