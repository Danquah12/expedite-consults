"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Video,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Music,
  Send,
  Upload,
  CheckCircle2,
  Volume2,
  VolumeX,
  Camera,
  AlertCircle
} from "lucide-react";

interface VideoRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (newPost: any) => void;
}

export function VideoRecorderModal({ isOpen, onClose, onPostCreated }: VideoRecorderModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<15 | 30 | 60>(15);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Post form state
  const [caption, setCaption] = useState("");
  const [selectedMusic, setSelectedMusic] = useState("Afrobeats Synthwave Future Mix Vol. 4");
  const [musicAuthor, setMusicAuthor] = useState("Sphera Sound Studio");
  const [hashtags, setHashtags] = useState("#SpheraViral #FYP #CreatorLife");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const playbackRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: true,
      });
      setStream(newStream);
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = newStream;
      }
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      setCameraError("Camera access unavailable. You can also upload a video file directly.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setRecordedVideoUrl(null);
      setRecordedChunks([]);
      setRecording(false);
      setRecordingSeconds(0);
    }
    return () => stopCamera();
  }, [isOpen, facingMode]);

  const handleStartRecording = () => {
    if (!stream) return;
    const chunks: Blob[] = [];
    setRecordedChunks([]);
    setRecordedVideoUrl(null);

    try {
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : "video/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setRecordedChunks(chunks);
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setRecording(true);
      setRecordingSeconds(0);

      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setRecordingSeconds(elapsed);
        if (elapsed >= duration) {
          handleStopRecording();
        }
      }, 1000);
    } catch (err) {
      console.error("Recording error:", err);
      setCameraError("Media recording failed. Please upload a file instead.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setRecordedVideoUrl(url);
    }
  };

  const handlePublish = async () => {
    if (!caption && !recordedVideoUrl) return;
    setIsSubmitting(true);

    try {
      const parsedHashtags = hashtags
        .split(" ")
        .filter((t) => t.startsWith("#") || t.length > 0)
        .map((t) => (t.startsWith("#") ? t : `#${t}`));

      const payload = {
        content: caption || "Check out my new Sphera Short! 🚀✨",
        type: "immersive_video",
        videoUrl: recordedVideoUrl || undefined,
        imageUrl: undefined,
        musicTitle: selectedMusic,
        musicAuthor,
        hashtags: parsedHashtags,
        authorName: "Kwesi Asiedu",
        authorUsername: "kwesi",
      };

      const res = await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        onPostCreated(data.post);
        onClose();
      } else {
        onPostCreated({
          ...payload,
          id: `post-${Date.now()}`,
          likes: 0,
          commentsCount: 0,
          sharesCount: 0,
          savesCount: 0,
          author: {
            id: "user-kwesi",
            name: "Kwesi Asiedu",
            username: "kwesi",
            avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
            verified: true,
            timeAgo: "Just now",
          },
        });
        onClose();
      }
    } catch (err) {
      console.error("Publish error:", err);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-[#121318] border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95">
        
        {/* Left Side: Camera Preview / Video Playback */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[380px] md:min-h-[520px] overflow-hidden">
          {!recordedVideoUrl ? (
            <>
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover max-h-[520px]"
              />

              {recording && (
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-rose-600/90 text-white px-3 py-1 rounded-full text-xs font-mono font-black animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                  <span>REC 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds} / {duration}s</span>
                </div>
              )}

              {!recording && (
                <div className="absolute top-4 left-4 z-20 flex gap-1.5 bg-black/60 backdrop-blur-md p-1 rounded-full border border-white/10">
                  {([15, 30, 60] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition ${
                        duration === d ? "bg-pink-600 text-white" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              )}

              <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                <label className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 cursor-pointer border border-white/10">
                  <Upload className="w-4 h-4" />
                  <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
                </label>
                <button
                  onClick={() => setFacingMode(facingMode === "user" ? "environment" : "user")}
                  className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 border border-white/10"
                  title="Flip Camera"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <div className="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-center">
                <button
                  onClick={recording ? handleStopRecording : handleStartRecording}
                  className={`w-18 h-18 rounded-full border-4 border-white flex items-center justify-center transition transform hover:scale-105 active:scale-95 shadow-2xl ${
                    recording ? "bg-rose-600 animate-pulse" : "bg-gradient-to-tr from-pink-600 to-rose-500"
                  }`}
                >
                  <div className={`transition-all ${recording ? "w-6 h-6 rounded-sm bg-white" : "w-12 h-12 rounded-full bg-rose-500"}`} />
                </button>
              </div>

              {cameraError && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center z-10 space-y-3">
                  <AlertCircle className="w-10 h-10 text-amber-400" />
                  <p className="text-xs text-zinc-300 max-w-xs">{cameraError}</p>
                  <label className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-black cursor-pointer shadow-lg flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Upload Video from Device</span>
                    <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              )}
            </>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={playbackRef}
                src={recordedVideoUrl}
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover max-h-[520px]"
              />
              <button
                onClick={() => {
                  setRecordedVideoUrl(null);
                  startCamera();
                }}
                className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full bg-black/70 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-md border border-white/20"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retake
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Creator Studio & Post Settings */}
        <div className="w-full md:w-[380px] p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-zinc-800 space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-pink-600/20 text-pink-400 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-white">Creator Studio — New Short</h3>
              </div>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Caption & Hook</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="What's happening? Add your hook and tag creators..."
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-2xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-pink-500 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-pink-400" />
                <span>Audio Track</span>
              </label>
              <select
                value={selectedMusic}
                onChange={(e) => {
                  setSelectedMusic(e.target.value);
                  setMusicAuthor("Sphera Trending Audio");
                }}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
              >
                <option value="Afrobeats Synthwave Future Mix Vol. 4">Afrobeats Synthwave Future Mix Vol. 4</option>
                <option value="Lo-Fi Study Beats & Cyber Bass">Lo-Fi Study Beats & Cyber Bass</option>
                <option value="Cyberpunk 2077 Nightcore Anthem">Cyberpunk 2077 Nightcore Anthem</option>
                <option value="Collegiate Pulse & Cinematic Horns">Collegiate Pulse & Cinematic Horns</option>
                <option value="Original Creator Audio">Original Audio (Microphone)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Trending Hashtags</label>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#SpheraViral #FYP #CreatorLife"
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl p-2.5 text-xs text-pink-400 font-mono focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <button
              onClick={handlePublish}
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30 transition transform hover:scale-[1.02] disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? "Publishing to #FYP..." : "Publish Live to #FYP"}</span>
            </button>
            <p className="text-[10px] text-center text-zinc-500">
              Published directly to SpheraNet algorithmic feed & followers.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
