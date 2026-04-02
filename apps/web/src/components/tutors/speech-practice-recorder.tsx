"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Square, Play, Pause, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { TutorAvatar } from "@/components/tutors/tutor-avatar";

type RecorderState = "idle" | "recording" | "recorded" | "permission_denied";

interface SpeechPracticeRecorderProps {
  targetSound: string;
  onRecordingComplete: (audioBlob: Blob, durationMs: number) => void;
  maxDurationSeconds?: number;
  className?: string;
}

export function SpeechPracticeRecorder({
  targetSound,
  onRecordingComplete,
  maxDurationSeconds = 10,
  className,
}: SpeechPracticeRecorderProps) {
  const [state, setState] = useState<RecorderState>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [playbackMs, setPlaybackMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [barHeights, setBarHeights] = useState<number[]>(
    Array.from({ length: 24 }, () => 8),
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number>(0);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const liveRef = useRef<HTMLDivElement>(null);
  const recordBtnRef = useRef<HTMLButtonElement>(null);
  const startTimeRef = useRef(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllMedia();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopAllMedia() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (analyserRef.current) analyserRef.current.disconnect();
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.src = "";
    }
  }

  function announce(text: string) {
    if (liveRef.current) liveRef.current.textContent = text;
  }

  const startRecording = useCallback(async () => {
    chunksRef.current = [];
    blobRef.current = null;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        blobRef.current = blob;
        streamRef.current?.getTracks().forEach((t) => t.stop());
      };

      // Setup analyser for waveform
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Start visualizer
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      function updateBars() {
        analyser.getByteFrequencyData(dataArray);
        const heights = Array.from(dataArray.slice(0, 24)).map(
          (v) => 8 + (v / 255) * 24,
        );
        setBarHeights(heights);
        rafRef.current = requestAnimationFrame(updateBars);
      }
      updateBars();

      recorder.start(100);
      startTimeRef.current = Date.now();
      setElapsedMs(0);

      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setElapsedMs(elapsed);
        if (elapsed >= maxDurationSeconds * 1000) {
          stopRecording();
        }
      }, 100);

      setState("recording");
      announce("Recording started");
    } catch (err: unknown) {
      if (
        err instanceof DOMException &&
        (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")
      ) {
        setState("permission_denied");
      } else {
        setState("permission_denied");
      }
    }
  }, [maxDurationSeconds]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (analyserRef.current) analyserRef.current.disconnect();
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close();
    }

    const duration = Date.now() - startTimeRef.current;
    setElapsedMs(duration);
    setState("recorded");
    announce(
      `Recording stopped. ${(duration / 1000).toFixed(1)} seconds captured.`,
    );
  }, []);

  const resetToIdle = useCallback(() => {
    stopAllMedia();
    blobRef.current = null;
    setElapsedMs(0);
    setPlaybackMs(0);
    setIsPlaying(false);
    setBarHeights(Array.from({ length: 24 }, () => 8));
    setState("idle");
    setTimeout(() => recordBtnRef.current?.focus(), 50);
  }, []);

  const handleSend = useCallback(() => {
    if (blobRef.current) {
      onRecordingComplete(blobRef.current, elapsedMs);
      announce("Recording submitted to Echo.");
    }
    resetToIdle();
  }, [elapsedMs, onRecordingComplete, resetToIdle]);

  const togglePlayback = useCallback(() => {
    if (!blobRef.current) return;

    if (isPlaying && audioElRef.current) {
      audioElRef.current.pause();
      setIsPlaying(false);
      return;
    }

    const url = URL.createObjectURL(blobRef.current);
    const audio = new Audio(url);
    audioElRef.current = audio;

    audio.ontimeupdate = () =>
      setPlaybackMs(Math.floor(audio.currentTime * 1000));
    audio.onended = () => {
      setIsPlaying(false);
      setPlaybackMs(0);
    };

    audio.play();
    setIsPlaying(true);
  }, [isPlaying]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-pink-200 bg-gradient-to-br from-pink-50 to-sky-50 p-5 max-w-sm",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <TutorAvatar persona="echo" size="sm" />
        <span className="text-sm font-semibold text-pink-600">
          {"\u{1F3B5}"} Sound Practice
        </span>
      </div>

      <p className="text-lg font-bold text-gray-800 mt-2">
        Try saying: {targetSound}
      </p>

      {/* PERMISSION DENIED */}
      {state === "permission_denied" && (
        <div className="mt-6 text-center">
          <ShieldAlert className="mx-auto h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-600 mt-3">
            To practice sounds with Echo, please allow microphone access in your
            browser settings.
          </p>
          <button
            onClick={() => {
              setState("idle");
              startRecording();
            }}
            className="mt-3 text-sm text-pink-600 underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* IDLE */}
      {state === "idle" && (
        <div className="mt-6 flex flex-col items-center">
          <button
            ref={recordBtnRef}
            onClick={startRecording}
            aria-label={`Start recording your practice of ${targetSound}`}
            className="w-16 h-16 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-lg ring-4 ring-pink-200 animate-pulse hover:bg-pink-600 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-400 focus-visible:ring-offset-2"
          >
            <Mic className="h-7 w-7" />
          </button>
          <p className="text-xs text-gray-400 mt-3">Tap to record</p>
          <p className="text-xs text-gray-400 italic mt-4">
            {"\u{1F512}"} Your recording is only used for this practice session
            and is not stored permanently.
          </p>
        </div>
      )}

      {/* RECORDING */}
      {state === "recording" && (
        <div className="mt-6 flex flex-col items-center">
          <p className="text-sm font-mono text-red-600 mb-3">
            {formatTime(elapsedMs)} / {formatTime(maxDurationSeconds * 1000)}
          </p>

          {/* Waveform */}
          <div
            className="flex items-end justify-center gap-0.5 h-8 mb-4"
            aria-hidden="true"
          >
            {barHeights.map((h, i) => (
              <div
                key={i}
                className={cn(
                  "w-1 rounded-full transition-all duration-75",
                  i % 2 === 0 ? "bg-pink-400" : "bg-sky-400",
                )}
                style={{ height: h }}
              />
            ))}
          </div>

          <button
            onClick={stopRecording}
            aria-label="Stop recording"
            className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg ring-4 ring-red-300 animate-pulse hover:bg-red-600 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-400 focus-visible:ring-offset-2"
          >
            <Square className="h-7 w-7" />
          </button>
          <p className="text-xs text-red-500 mt-3">
            Recording... tap to stop
          </p>
        </div>
      )}

      {/* RECORDED */}
      {state === "recorded" && (
        <div className="mt-6">
          {/* Frozen waveform */}
          <div
            className="flex items-end justify-center gap-0.5 h-8 mb-3"
            aria-hidden="true"
          >
            {barHeights.map((h, i) => (
              <div
                key={i}
                className={cn(
                  "w-1 rounded-full",
                  i % 2 === 0 ? "bg-pink-300" : "bg-sky-300",
                )}
                style={{ height: h }}
              />
            ))}
          </div>

          <p className="text-sm text-gray-600 text-center mb-3">
            {formatTime(elapsedMs)} recorded
          </p>

          {/* Playback controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayback}
              aria-label={isPlaying ? "Pause playback" : "Play back your recording"}
              className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0 hover:bg-sky-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </button>
            <div
              className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={elapsedMs}
              aria-valuenow={playbackMs}
              aria-label="Playback progress"
            >
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-100"
                style={{
                  width: elapsedMs
                    ? `${(playbackMs / elapsedMs) * 100}%`
                    : "0%",
                }}
              />
            </div>
            <span className="text-xs text-gray-400">
              {formatTime(elapsedMs)}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={resetToIdle}
              className="flex-1 text-sm font-medium text-gray-500 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
            >
              Try Again
            </button>
            <button
              onClick={handleSend}
              aria-label={`Submit your recording of ${targetSound} to Echo`}
              className="flex-1 text-sm font-semibold text-white bg-pink-500 rounded-lg px-4 py-2 hover:bg-pink-600 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2"
            >
              Send to Echo {"\u2728"}
            </button>
          </div>
        </div>
      )}

      {/* Live region for screen readers */}
      <div ref={liveRef} aria-live="polite" className="sr-only" />
    </div>
  );
}
