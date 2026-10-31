"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp, AudioLines, Mic, MicOff, Phone, PhoneOff, Sparkles, Volume2, VolumeX, X } from "lucide-react";

type SpeechResult = { transcript: string };
type SpeechResultItem = { isFinal: boolean; length: number; [index: number]: SpeechResult };
type SpeechEvent = { resultIndex: number; results: ArrayLike<SpeechResultItem> };
type SpeechErrorEvent = { error: string };
type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechEvent) => void) | null;
  onerror: ((event: SpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type RecognitionConstructor = new () => Recognition;
type VoiceReport = { id: string; public_code: string; title: string; city: string; area?: string | null; kind: string; approx_distance_km?: number };

export default function VoiceAssistant() {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [available, setAvailable] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [reports, setReports] = useState<VoiceReport[]>([]);
  const [voiceOutput, setVoiceOutput] = useState(true);
  const [fallbackText, setFallbackText] = useState("");
  const recognitionRef = useRef<Recognition | null>(null);
  const finalTextRef = useRef("");
  const sendingRef = useRef(false);

  useEffect(() => {
    const host = window as Window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
    setAvailable(Boolean(host.SpeechRecognition || host.webkitSpeechRecognition));
    return () => {
      recognitionRef.current?.abort();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  function speak(text: string) {
    if (!voiceOutput || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar-IQ";
    utterance.rate = 0.96;
    utterance.pitch = 1.02;
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find((voice) => voice.lang.toLowerCase() === "ar-iq")
      ?? voices.find((voice) => voice.lang.toLowerCase().startsWith("ar"));
    if (arabicVoice) utterance.voice = arabicVoice;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  async function sendQuestion(text: string) {
    const question = text.trim();
    if (!question || sendingRef.current) return;
    sendingRef.current = true;
    setProcessing(true);
    setError("");
    setReply("");
    setReports([]);
    try {
      const response = await fetch("/api/assistant/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: question }),
        cache: "no-store"
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "تعذر تنفيذ الطلب الصوتي.");
      const answer = payload.assistant?.reply ?? "اكتمل البحث في البلاغات المنشورة.";
      setReply(answer);
      setReports((payload.reports ?? []) as VoiceReport[]);
      speak(answer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر الاتصال بالمساعد.");
    } finally {
      setProcessing(false);
      sendingRef.current = false;
    }
  }

  function startListening() {
    if (!available) return;
    if (speaking) window.speechSynthesis.cancel();
    setSpeaking(false);
    setError("");
    setReply("");
    setTranscript("");
    setInterim("");
    finalTextRef.current = "";

    const host = window as Window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
    const Constructor = host.SpeechRecognition ?? host.webkitSpeechRecognition;
    if (!Constructor) {
      setAvailable(false);
      return;
    }

    const recognition = new Constructor();
    recognition.lang = "ar-IQ";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let final = "";
      let partial = "";
      for (let index = event.resultIndex; index < event.results.length; index++) {
        const result = event.results[index];
        const phrase = result[0]?.transcript ?? "";
        if (result.isFinal) final += phrase;
        else partial += phrase;
      }
      if (final) {
        finalTextRef.current = (finalTextRef.current + " " + final).trim();
        setTranscript(finalTextRef.current);
      }
      setInterim(partial);
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError("لم تسمح للمتصفح باستخدام الميكروفون. فعّل الإذن من إعدادات الموقع.");
      } else if (event.error !== "no-speech" && event.error !== "aborted") {
        setError("تعذر التقاط الصوت. جرّب مرة أخرى أو اكتب سؤالك.");
      }
    };

    recognition.onend = () => {
      setListening(false);
      setInterim("");
      const final = finalTextRef.current.trim();
      if (final) void sendQuestion(final);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      setError("تعذر بدء الميكروفون. تأكد من أن الصفحة تعمل عبر HTTPS وأن الإذن متاح.");
      setListening(false);
    }
  }

  function stopListening() {
    recognitionRef.current?.stop();
  }

  function close() {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setListening(false);
    setSpeaking(false);
    setOpen(false);
  }

  function submitFallback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!fallbackText.trim()) return;
    setTranscript(fallbackText.trim());
    void sendQuestion(fallbackText);
    setFallbackText("");
  }

  return (
    <>
      <button type="button" className="voice-call-trigger" onClick={() => setOpen(true)} data-sound="open">
        <span className="voice-call-icon"><Phone size={16} /></span>
        <span><b>محادثة صوتية</b><small>تحدث مع مساعد أثر معروف</small></span>
        <AudioLines size={17} />
      </button>

      {open && (
        <div className="voice-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
          <section className="voice-dialog" dir="rtl" role="dialog" aria-modal="true" aria-labelledby="voice-title">
            <header className="voice-dialog-header">
              <div className="voice-dialog-brand"><span><Sparkles size={18} /></span><div><b id="voice-title">مساعد أثر معروف</b><small>محادثة صوتية داخل التطبيق</small></div></div>
              <button type="button" className="voice-close" onClick={close} aria-label="إغلاق المحادثة"><X size={18} /></button>
            </header>

            <div className={listening ? "voice-orb listening" : speaking ? "voice-orb speaking" : "voice-orb"}>
              <span className="voice-orb-core"><AudioLines size={31} /></span>
              <i /><i /><i />
            </div>
            <div className="voice-state" aria-live="polite">
              {listening ? "أستمع إليك الآن..." : processing ? "أحلل سؤالك وأبحث في البلاغات..." : speaking ? "المساعد يتحدث..." : "اضغط الميكروفون وابدأ حديثك"}
            </div>

            <div className="voice-transcript">
              <label>النص الذي التقطه الميكروفون</label>
              <p>{transcript || interim || "سيظهر كلامك هنا بعد انتهاء التعرف الصوتي."}</p>
            </div>

            {available ? (
              <div className="voice-controls">
                <button type="button" className={listening ? "voice-mic-button active" : "voice-mic-button"} onClick={listening ? stopListening : startListening} disabled={processing}>
                  {listening ? <MicOff size={20} /> : <Mic size={20} />}
                  {listening ? "إنهاء التسجيل وإرسال النص" : "بدء الاستماع"}
                </button>
                <button type="button" className={voiceOutput ? "voice-sound-button active" : "voice-sound-button"} onClick={() => { setVoiceOutput((value) => !value); if (voiceOutput) window.speechSynthesis.cancel(); }}>
                  {voiceOutput ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  {voiceOutput ? "الصوت مفعّل" : "الصوت مكتوم"}
                </button>
              </div>
            ) : (
              <div className="voice-fallback-label">التعرف الصوتي غير متاح في هذا المتصفح. يمكنك كتابة السؤال وسيُقرأ الرد صوتياً إن كان الصوت مدعوماً.</div>
            )}

            {!available && (
              <form className="voice-fallback-form" onSubmit={submitFallback}>
                <input value={fallbackText} onChange={(event) => setFallbackText(event.target.value)} placeholder="اكتب سؤالك للمساعد..." maxLength={120} />
                <button type="submit" disabled={!fallbackText.trim() || processing}><ArrowUp size={18} /></button>
              </form>
            )}

            {reply && <div className="voice-answer"><b>رد المساعد</b><p>{reply}</p>{reports.length > 0 && <small>تم العثور على {reports.length} بلاغ منشور مطابق.</small>}</div>}
            {error && <div className="voice-error" role="alert">{error}</div>}

            <div className="voice-privacy-note">
              <span><Mic size={13} /> الميكروفون لا يبدأ إلا عند ضغطك. يستقبل التطبيق النص الناتج فقط، ولا يحفظ ملفاً صوتياً.</span>
              <span>قد يعالج متصفحك الصوت عبر خدمة التعرف الصوتي التابعة له. جرّب Chrome أو Edge للتوافق الأفضل.</span>
            </div>
            <button className="voice-end-call" type="button" onClick={close}><PhoneOff size={16} /> إنهاء المحادثة</button>
          </section>
        </div>
      )}
    </>
  );
}
