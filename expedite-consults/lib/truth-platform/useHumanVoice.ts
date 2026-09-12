"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface VoiceOption {
  id: string;
  name: string;
  gender: string;
  desc: string;
}

export const OPENAI_VOICES: VoiceOption[] = [
  { id: "onyx", name: "Onyx", gender: "Male", desc: "Authoritative News Anchor / Deep Timber" },
  { id: "echo", name: "Echo", gender: "Male", desc: "Smooth Broadcast Presenter" },
  { id: "nova", name: "Nova", gender: "Female", desc: "Natural, High-Clarity Anchor" },
  { id: "alloy", name: "Alloy", gender: "Neutral", desc: "Balanced & Articulate" },
  { id: "fable", name: "Fable", gender: "Expressive", desc: "Warm Narrative Speaker" },
  { id: "shimmer", name: "Shimmer", gender: "Female", desc: "Clear & Engaging Presenter" },
];

// Audio cache to prevent duplicate API token usage
const audioCache = new Map<string, string>();

export function useHumanVoice() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>("onyx");
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [currentText, setCurrentText] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, []);

  const speak = useCallback(
    async (text: string, customVoice?: string, customSpeed?: number) => {
      if (!text || !text.trim()) return;

      const voiceToUse = customVoice || selectedVoice;
      const speedToUse = customSpeed || playbackSpeed;
      const cacheKey = `${voiceToUse}-${speedToUse}-${text.slice(0, 300)}`;

      // If already playing this text, stop
      if (isPlaying && currentText === text) {
        stop();
        return;
      }

      // Stop any existing playback
      if (audioRef.current) {
        audioRef.current.pause();
      }

      setErrorMessage(null);
      setCurrentText(text);

      try {
        let audioUrl = audioCache.get(cacheKey);

        if (!audioUrl) {
          setIsLoading(true);
          const res = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text,
              voice: voiceToUse,
              speed: speedToUse,
              model: "tts-1",
            }),
          });

          if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            const errMsg =
              errJson.error || `Speech synthesis failed with HTTP ${res.status}`;
            if (res.status === 429 || errJson.code === "insufficient_quota" || errJson.code === "credit_balance_exhausted") {
              throw new Error(
                "OpenAI API credit balance is exhausted. Please add $5 or $10 credit at platform.openai.com/settings/organization/billing."
              );
            }
            throw new Error(errMsg);
          }

          const blob = await res.blob();
          audioUrl = URL.createObjectURL(blob);
          audioCache.set(cacheKey, audioUrl);
        }

        const audio = new Audio(audioUrl);
        audio.playbackRate = speedToUse;
        audioRef.current = audio;

        audio.onplay = () => {
          setIsLoading(false);
          setIsPlaying(true);
        };

        audio.onended = () => {
          setIsPlaying(false);
        };

        audio.onerror = () => {
          setIsLoading(false);
          setIsPlaying(false);
          setErrorMessage("Failed to play synthesized audio.");
        };

        await audio.play();
      } catch (err: any) {
        console.error("TTS Playback error:", err);
        setIsLoading(false);
        setIsPlaying(false);
        setErrorMessage(err.message || "Could not generate human voice.");
      }
    },
    [isPlaying, currentText, selectedVoice, playbackSpeed, stop]
  );

  return {
    speak,
    stop,
    isPlaying,
    isLoading,
    selectedVoice,
    setSelectedVoice,
    playbackSpeed,
    setPlaybackSpeed,
    errorMessage,
    currentText,
  };
}
