import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  Send,
  ShieldCheck,
  Trash2,
  AlertCircle,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  MessageSquare,
  Volume2,
  Loader2,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../services/apiClient';
import type { ChatMessage } from '../types/finance';
import { getCurrentMonthKey } from '../utilities/formatters';

const SUGGESTED_QUESTIONS = [
  'How much money did I spend this month and which category is highest?',
  'How can I manage my monthly household budget better?',
  'Explain SIP in simple language.',
  'What is the difference between FD and RD?',
  'How do I calculate EMI and reduce total loan interest?',
  'How can I create a 6-month emergency fund?',
  'Which Indian government schemes help with girl child education or pensions?',
];

type PersonaRole = 'coach' | 'schemes' | 'tutor';
type SpeedMode = 'general' | 'fast';
type VoiceName = 'Zephyr' | 'Kore' | 'Puck' | 'Charon' | 'Fenrir';

interface VoiceTranscriptItem {
  id: string;
  speaker: 'user' | 'assistant';
  text: string;
}

function floatTo16BitPCMBase64(input: Float32Array): string {
  const buffer = new ArrayBuffer(input.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64PCMToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const view = new DataView(bytes.buffer);
  const samples = new Float32Array(bytes.byteLength / 2);
  for (let i = 0; i < samples.length; i++) {
    samples[i] = view.getInt16(i * 2, true) / 32768;
  }
  return samples;
}

export const AIAssistantPage: React.FC = () => {
  const { store, profile, language, isOnline, t } = useApp();
  const [modeTab, setModeTab] = useState<'chat' | 'voice'>('chat');
  const [persona, setPersona] = useState<PersonaRole>('coach');
  const [speedMode, setSpeedMode] = useState<SpeedMode>('general');
  const [shareContext, setShareContext] = useState(true);

  // Multi-turn text chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! I am your Financial Literacy Assistant. Ask me to explain concepts like SIP, EMI, GST, FD vs RD, tap the microphone to dictate a question, or switch to Live Voice for a real-time spoken conversation.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Audio transcription state (gemini-3.5-transcribe)
  const [isRecordingDictation, setIsRecordingDictation] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const dictationStreamRef = useRef<MediaStream | null>(null);

  // Real-time Gemini Live voice state (gemini-3.8-live)
  const [voiceName, setVoiceName] = useState<VoiceName>('Zephyr');
  const [liveStatus, setLiveStatus] = useState<'idle' | 'connecting' | 'live' | 'error'>('idle');
  const [liveError, setLiveError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceTranscripts, setVoiceTranscripts] = useState<VoiceTranscriptItem[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const liveMicStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextStartTimeRef = useRef<number>(0);
  const isMutedRef = useRef<boolean>(false);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const authorizedSummary = useMemo(() => {
    const month = getCurrentMonthKey();
    const monthIncomes = store.incomes.filter((i) => i.date.startsWith(month));
    const monthExpenses = store.expenses.filter((e) => e.date.startsWith(month));
    const totalIncome = monthIncomes.reduce((s, i) => s + i.amount, 0);
    const totalExpenses = monthExpenses.reduce((s, e) => s + e.amount, 0);
    const categorySpend: Record<string, number> = {};
    for (const e of monthExpenses) {
      categorySpend[e.category] = (categorySpend[e.category] || 0) + e.amount;
    }
    const activeBudget = store.budgets.find((b) => b.month === month);
    return {
      month,
      currency: profile?.currency || 'INR',
      monthlyIncomeINR: totalIncome,
      monthlyExpensesINR: totalExpenses,
      monthlyNetSavingsINR: totalIncome - totalExpenses,
      savingsRatePercent: totalIncome > 0 ? Number((((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1)) : 0,
      expenseByCategoryINR: categorySpend,
      plannedMonthlyBudgetINR: activeBudget?.totalMonthlyBudget || null,
      goals: store.goals.map((g) => ({
        name: g.name,
        targetINR: g.targetAmount,
        savedINR: g.currentSaved,
        targetDate: g.targetDate,
      })),
      recentCalculatorResults: store.calculatorHistory.slice(0, 3).map((h) => ({
        calculator: h.calculatorName,
        result: `${h.primaryResultLabel}: ${h.primaryResultValue}`,
      })),
    };
  }, [profile?.currency, store.budgets, store.calculatorHistory, store.expenses, store.goals, store.incomes]);

  // Cleanup Live session & audio recorders on unmount
  const stopLiveVoiceSession = () => {
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'stop' }));
      }
      wsRef.current?.close();
    } catch {
      // ignore
    }
    wsRef.current = null;

    for (const src of activeSourcesRef.current) {
      try {
        src.stop();
      } catch {
        // ignore
      }
    }
    activeSourcesRef.current = [];
    nextStartTimeRef.current = 0;

    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch {
        // ignore
      }
      processorRef.current = null;
    }

    if (liveMicStreamRef.current) {
      liveMicStreamRef.current.getTracks().forEach((tr) => tr.stop());
      liveMicStreamRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }

    setLiveStatus('idle');
    setIsMuted(false);
  };

  useEffect(() => {
    return () => {
      stopLiveVoiceSession();
      if (dictationStreamRef.current) {
        dictationStreamRef.current.getTracks().forEach((tr) => tr.stop());
      }
    };
  }, []);

  // Multi-turn Gemini chat send
  const sendMessage = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    const priorValidHistory = messages.filter((m) => !m.error && m.id !== 'welcome');
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    if (!textOverride) setInput('');

    if (!isOnline) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'You are currently offline. Reconnect to the internet to ask the AI Financial Assistant.',
          timestamp: new Date().toISOString(),
          error: true,
        },
      ]);
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.askAiAssistant({
        message: text,
        history: priorValidHistory.map((m) => ({ role: m.role, content: m.content })),
        language,
        financialContext: shareContext ? authorizedSummary : undefined,
        speedMode,
        persona,
      });
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: res.reply,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: err instanceof Error ? err.message : 'Unable to reach AI Assistant.',
          timestamp: new Date().toISOString(),
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Microphone transcription using gemini-3.5-transcribe
  const toggleDictationRecording = async () => {
    setTranscriptionError(null);

    if (isRecordingDictation && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecordingDictation(false);
      return;
    }

    if (!isOnline) {
      setTranscriptionError('Audio transcription requires an internet connection.');
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setTranscriptionError('Microphone recording is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      dictationStreamRef.current = stream;
      recordedChunksRef.current = [];

      const preferredMime = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';
      const recorder = preferredMime ? new MediaRecorder(stream, { mimeType: preferredMime }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((tr) => tr.stop());
        dictationStreamRef.current = null;
        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        if (blob.size < 400) {
          setTranscriptionError('Recording was too short. Tap mic, speak clearly, then tap again to stop.');
          return;
        }

        setIsTranscribing(true);
        try {
          const arrayBuffer = await blob.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          let binary = '';
          const chunkSize = 0x8000;
          for (let i = 0; i < bytes.length; i += chunkSize) {
            binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
          }
          const audioBase64 = btoa(binary);
          const { transcript } = await apiClient.transcribeAudio({
            audioBase64,
            mimeType,
            language,
          });
          setInput((prev) => (prev.trim() ? `${prev.trim()} ${transcript}` : transcript));
        } catch (err) {
          setTranscriptionError(err instanceof Error ? err.message : 'Unable to transcribe audio.');
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.start();
      setIsRecordingDictation(true);
    } catch (err) {
      setTranscriptionError(
        err instanceof Error ? err.message : 'Microphone permission denied. Please allow mic access.'
      );
      setIsRecordingDictation(false);
    }
  };

  // Real-time Gemini Live voice session (gemini-3.8-live)
  const playOutputAudioChunk = (ctx: AudioContext, base64Pcm: string) => {
    const floatSamples = base64PCMToFloat32(base64Pcm);
    const buffer = ctx.createBuffer(1, floatSamples.length, 24000);
    buffer.getChannelData(0).set(floatSamples);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const now = ctx.currentTime;
    const startAt = Math.max(now + 0.02, nextStartTimeRef.current);
    source.start(startAt);
    nextStartTimeRef.current = startAt + buffer.duration;
    activeSourcesRef.current.push(source);
    source.onended = () => {
      activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
    };
  };

  const appendLiveTranscript = (speaker: 'user' | 'assistant', text: string) => {
    const clean = text.trim();
    if (!clean) return;
    setVoiceTranscripts((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.speaker === speaker) {
        return [...prev.slice(0, -1), { ...last, text: `${last.text} ${clean}`.trim() }];
      }
      return [...prev, { id: `vt-${Date.now()}-${Math.random()}`, speaker, text: clean }];
    });
  };

  const startLiveVoiceSession = async () => {
    if (liveStatus === 'connecting' || liveStatus === 'live') return;
    setLiveError(null);

    if (!isOnline) {
      setLiveError('Live Voice requires an active internet connection.');
      setLiveStatus('error');
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setLiveError('Microphone capture is not supported in this browser.');
      setLiveStatus('error');
      return;
    }

    setLiveStatus('connecting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      liveMicStreamRef.current = stream;

      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      await inputCtx.resume();
      await outputCtx.resume();
      inputAudioCtxRef.current = inputCtx;
      outputAudioCtxRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/ai/live`);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: 'start',
            language,
            persona,
            voiceName,
            financialContext: shareContext ? authorizedSummary : undefined,
          })
        );
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data) as {
          type: string;
          data?: string;
          text?: string;
          error?: string;
        };

        if (msg.type === 'ready') {
          setLiveStatus('live');
          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;

          processor.onaudioprocess = (e) => {
            if (isMutedRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
              return;
            }
            const channel = e.inputBuffer.getChannelData(0);
            const pcmBase64 = floatTo16BitPCMBase64(channel);
            wsRef.current.send(JSON.stringify({ type: 'audio', data: pcmBase64 }));
          };

          source.connect(processor);
          processor.connect(inputCtx.destination);
        } else if (msg.type === 'audio' && msg.data && outputAudioCtxRef.current) {
          playOutputAudioChunk(outputAudioCtxRef.current, msg.data);
        } else if (msg.type === 'inputTranscript' && msg.text) {
          appendLiveTranscript('user', msg.text);
        } else if (msg.type === 'outputTranscript' && msg.text) {
          appendLiveTranscript('assistant', msg.text);
        } else if (msg.type === 'interrupted') {
          for (const src of activeSourcesRef.current) {
            try {
              src.stop();
            } catch {
              // ignore
            }
          }
          activeSourcesRef.current = [];
          if (outputAudioCtxRef.current) {
            nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
          }
        } else if (msg.type === 'error') {
          setLiveError(msg.error || 'Voice connection error.');
          stopLiveVoiceSession();
          setLiveStatus('error');
        } else if (msg.type === 'closed') {
          stopLiveVoiceSession();
        }
      };

      ws.onerror = () => {
        setLiveError('Unable to establish real-time voice WebSocket connection.');
        stopLiveVoiceSession();
        setLiveStatus('error');
      };

      ws.onclose = () => {
        if (wsRef.current) {
          stopLiveVoiceSession();
        }
      };
    } catch (err) {
      setLiveError(err instanceof Error ? err.message : 'Unable to access microphone.');
      stopLiveVoiceSession();
      setLiveStatus('error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Mode Switcher */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-300">{t('ai.subtitle')}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              Educational guidance only — not certified financial, tax, or investment advice.
            </p>
          </div>

          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => {
                if (liveStatus === 'live' || liveStatus === 'connecting') stopLiveVoiceSession();
                setModeTab('chat');
              }}
              className={`min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                modeTab === 'chat'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat &amp; Dictate</span>
            </button>
            <button
              type="button"
              onClick={() => setModeTab('voice')}
              className={`min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                modeTab === 'voice'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Live Voice</span>
            </button>
          </div>
        </div>

        {/* Persona, Speed & Context Controls */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Assistant Role"
              value={persona}
              onChange={(e) => setPersona(e.target.value as PersonaRole)}
              className="min-h-[38px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200"
            >
              <option value="coach">Role: Household Budget Coach</option>
              <option value="schemes">Role: Schemes &amp; Tax Guide</option>
              <option value="tutor">Role: Financial Literacy Tutor</option>
            </select>

            {modeTab === 'chat' && (
              <button
                type="button"
                onClick={() => setSpeedMode((m) => (m === 'general' ? 'fast' : 'general'))}
                className={`min-h-[38px] inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  speedMode === 'fast'
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{speedMode === 'fast' ? 'Fast Mode (Lite)' : 'Standard Mode'}</span>
              </button>
            )}

            {modeTab === 'voice' && (
              <select
                aria-label="Assistant Voice"
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value as VoiceName)}
                disabled={liveStatus === 'live' || liveStatus === 'connecting'}
                className="min-h-[38px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 disabled:opacity-50"
              >
                <option value="Zephyr">Voice: Zephyr</option>
                <option value="Kore">Voice: Kore</option>
                <option value="Puck">Voice: Puck</option>
                <option value="Charon">Voice: Charon</option>
                <option value="Fenrir">Voice: Fenrir</option>
              </select>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={shareContext}
                onChange={(e) => setShareContext(e.target.checked)}
                className="rounded border-slate-300 text-teal-600"
              />
              Share Authorized Budget Summary
            </label>
            {modeTab === 'chat' && (
              <button
                type="button"
                onClick={() => setMessages(messages.slice(0, 1))}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {modeTab === 'chat' ? (
        <>
          {/* Suggested Questions (Horizontally scrollable on mobile for clean compactness) */}
          <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => sendMessage(q)}
                disabled={loading}
                className="shrink-0 sm:shrink rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Messages Container */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-[58vh] min-h-[380px] max-h-[540px]">
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] sm:max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-[#0B192C] dark:bg-teal-600 text-white'
                        : m.error
                          ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    {m.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold mb-1 opacity-75">
                        {m.error ? <AlertCircle className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
                        <span>{m.error ? 'Service Notice' : 'Financial Literacy Assistant'}</span>
                      </div>
                    )}
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {transcriptionError && (
              <div className="mx-3 mb-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 px-3 py-2 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between gap-2">
                <span>{transcriptionError}</span>
                <button
                  type="button"
                  onClick={() => setTranscriptionError(null)}
                  className="text-[11px] font-semibold underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
            >
              <button
                type="button"
                onClick={toggleDictationRecording}
                disabled={isTranscribing}
                aria-label={isRecordingDictation ? 'Stop recording audio' : 'Record audio to transcribe'}
                title={isRecordingDictation ? 'Tap to stop & transcribe' : 'Tap to speak your question'}
                className={`min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                  isRecordingDictation
                    ? 'bg-rose-600 text-white'
                    : 'border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 hover:border-teal-500'
                }`}
              >
                {isTranscribing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isRecordingDictation ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isRecordingDictation
                    ? 'Listening... Tap mic again to transcribe'
                    : isTranscribing
                      ? 'Transcribing speech...'
                      : t('ai.askPlaceholder')
                }
                className="flex-1 min-h-[44px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-white"
              />

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="min-h-[44px] inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </>
      ) : (
        /* Real-Time Voice Conversation Panel (Gemini Live API) */
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
          <div className="flex flex-col items-center text-center space-y-4 py-4">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors ${
                liveStatus === 'live'
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/25'
                  : liveStatus === 'connecting'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {liveStatus === 'connecting' ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <Volume2 className="w-8 h-8" />
              )}
            </div>

            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                {liveStatus === 'live'
                  ? isMuted
                    ? 'Microphone Muted'
                    : 'Voice Conversation Active — Speak Naturally'
                  : liveStatus === 'connecting'
                    ? 'Connecting Voice Session...'
                    : 'Real-Time Voice Financial Coach'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                Have a natural hands-free spoken conversation in your preferred language about monthly budgets, expenses, EMI, SIP, or welfare schemes.
              </p>
            </div>

            {liveError && (
              <div className="w-full max-w-md rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 px-4 py-3 text-xs text-rose-700 dark:text-rose-300">
                {liveError}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              {liveStatus === 'live' || liveStatus === 'connecting' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsMuted((m) => !m)}
                    className={`min-h-[48px] inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold cursor-pointer ${
                      isMuted
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                        : 'border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{isMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={stopLiveVoiceSession}
                    className="min-h-[48px] inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 cursor-pointer"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>End Call</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={startLiveVoiceSession}
                  className="min-h-[48px] inline-flex items-center gap-2 rounded-xl bg-[#0B192C] dark:bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:opacity-95 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Start Voice Conversation</span>
                </button>
              )}
            </div>
          </div>

          {/* Live Voice Transcript Log */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Live Voice Transcript
              </p>
              {voiceTranscripts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setVoiceTranscripts([])}
                  className="text-xs text-slate-500 hover:text-rose-600 cursor-pointer"
                >
                  Clear Transcript
                </button>
              )}
            </div>

            {voiceTranscripts.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
                Start a voice call and speak — live transcripts of your conversation will appear here.
              </p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2.5">
                {voiceTranscripts.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      item.speaker === 'user'
                        ? 'bg-[#0B192C] dark:bg-teal-700 text-white ml-8'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 mr-8'
                    }`}
                  >
                    <span className="font-semibold block text-[10px] opacity-75 mb-0.5">
                      {item.speaker === 'user' ? 'You' : 'Financial Coach'}
                    </span>
                    {item.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
