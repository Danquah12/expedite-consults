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
  AlertCircle,
  Loader2
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
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const playbackRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordedBlobRef = useRef<Blob | null>(null);
  const uploadedFileRef = useRef<File | null>(null);

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
      recordedBlobRef.current = null;
      uploadedFileRef.current = null;
      setRecording(false);
      setRecordingSeconds(0);
      setUploadStatus(null);
    }
    return () => stopCamera();
  }, [isOpen, facingMode]);

  const handleStartRecording = () => {
    if (!stream) return;
    const chunks: Blob[] = [];
    setRecordedChunks([]);
    setRecordedVideoUrl(null);
    recordedBlobRef.current = null;
    uploadedFileRef.current = null;

    try {
      let options: MediaRecorderOptions = { mimeType: "video/webm" };
      if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) {
        options = { mimeType: "video/webm;codecs=vp9,opus" };
      } else if (MediaRecorder.isTypeSupported("video/mp4")) {
        options = { mimeType: "video/mp4" };
      }

      const recorder = new MediaRecorder(stream, options);
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: options.mimeType || "video/webm" });
        recordedBlobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setRecordedChunks(chunks);
      };

      recorder.start(200);
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
      uploadedFileRef.current = file;
      recordedBlobRef.current = file;
      const url = URL.createObjectURL(file);
      setRecordedVideoUrl(url);
    }
  };

  const blobToDataUrl = (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string) || "");
      reader.onerror = () => resolve("");
      reader.readAsDataURL(blob);
    });
  };

  const handlePublish = async () => {
    if (!caption && !recordedVideoUrl && !recordedBlobRef.current && !uploadedFileRef.current) return;
    setIsSubmitting(true);
    setUploadStatus("Encoding permanent video stream...");

    let persistentVideoUrl = "";

    try {
      const targetBlob = recordedBlobRef.current || uploadedFileRef.current;
      if (targetBlob) {
        setUploadStatus("Generating sovereign permanent stream...");
        persistentVideoUrl = await blobToDataUrl(targetBlob);
      }

      if (!persistentVideoUrl && recordedVideoUrl && !recordedVideoUrl.startsWith("blob:")) {
        persistentVideoUrl = recordedVideoUrl;
      }

      setUploadStatus("Publishing to Global Feed...");

      const parsedHashtags = hashtags
        .split(" ")
        .filter((t) => t.startsWith("#") || t.length > 0)
        .map((t) => (t.startsWith("#") ? t : `#${t}`));

      const payload = {
        content: caption || "Check out my new Sphera Short! 🚀✨",
        type: "immersive_video",
        videoUrl: persistentVideoUrl || undefined,
        imageUrl: persistentVideoUrl || undefined,
        musicTitle: selectedMusic,
        musicAuthor,
        hashtags: parsedHashtags,
        authorName: "Kwesi Asiedu",
        authorUsername: "kwesi",
      };

      try {
        const res = await fetch("/api/feed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          onPostCreated(data.post);
          onClose();
          return;
        }
      } catch (feedErr) {
        console.warn("[Feed publish network notice]:", feedErr);
      }

      // Offline / immediate optimistic fallback with permanent video URL
      onPostCreated({
        ...payload,
        id: `post-${Date.now()}`,
        likes: 1,
        commentsCount: 0,
        sharesCount: 0,
        savesCount: 0,
        isLiked: true,
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
    } catch (err) {
      console.error("Publish error:", err);
      onClose();
    } finally {
      setIsSubmitting(false);
      setUploadStatus(null);
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
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

              {cameraError && (
                <div className="absolute top-4 left-4 right-4 bg-rose-500/20 border border-rose-500/40 backdrop-blur-md p-3 rounded-2xl flex items-center gap-2 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Top Controls Overlay */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <button
                  onClick={() => setFacingMode((prev) => (prev === "user" ? "environment" : "user"))}
                  className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition"
                  title="Flip Camera"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Duration Picker */}
                <div className="flex bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10">
                  {[15, 30, 60].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d as any)}
                      className={`px-3 py-1 rounded-full text-xs font-black transition ${
                        duration === d ? "bg-white text-black shadow-md" : "text-white/70 hover:text-white"
                      }`}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Music Banner */}
              <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/15 flex items-center gap-2 text-xs text-white max-w-[85%]">
                <Music className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <span className="truncate font-semibold">{selectedMusic}</span>
              </div>

              {/* Bottom Camera Trigger */}
              <div className="absolute bottom-6 left-0 right-0 flex items-center justify-around px-6 z-10">
                {/* Direct File Upload Alternative */}
                <label className="w-12 h-12 rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 backdrop-blur-md text-white flex items-center justify-center cursor-pointer transition">
                  <Upload className="w-5 h-5" />
                  <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
                </label>

                {/* Record Button with Animated Ring */}
                <button
                  onClick={recording ? handleStopRecording : handleStartRecording}
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center transition transform ${
                    recording ? "scale-110" : "hover:scale-105"
                  }`}
                >
                  <div className="absolute inset-0 rounded-full border-4 border-pink-500 animate-pulse" />
                  <div
                    className={`transition-all ${
                      recording
                        ? "w-8 h-8 bg-rose-500 rounded-lg"
                        : "w-16 h-16 bg-gradient-to-tr from-pink-500 to-rose-600 rounded-full shadow-lg shadow-pink-500/50"
                    }`}
                  />
                </button>

                {/* Timer Display */}
                <div className="w-12 text-center text-xs font-mono font-black text-white">
                  {recording ? `00:${recordingSeconds.toString().padStart(2, "0")}` : `${duration}s`}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Video Playback Review */}
              <video
                ref={playbackRef}
                src={recordedVideoUrl}
                controls
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => {
                  setRecordedVideoUrl(null);
                  recordedBlobRef.current = null;
                  uploadedFileRef.current = null;
                  startCamera();
                }}
                className="absolute top-4 left-4 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition z-10"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>
            </>
          )}
        </div>

        {/* Right Side: Post Metadata & Sound Picker */}
        <div className="w-full md:w-[360px] bg-[#121318] p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-zinc-800 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-400" />
              <h3 className="text-base font-black text-white">Publish Short</h3>
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto">
            {/* Caption Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Caption & Description</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Describe your video, tag @collaborators or ask a question..."
                className="w-full h-24 bg-zinc-900 border border-zinc-800 text-white rounded-2xl p-3 text-xs focus:outline-none focus:border-pink-500 transition resize-none placeholder:text-zinc-600"
              />
            </div>

            {/* Sound Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Audio / Music Track</label>
              <select
                value={selectedMusic}
                onChange={(e) => {
                  setSelectedMusic(e.target.value);
                  if (e.target.value.includes("Afrobeats")) setMusicAuthor("DJ Khaled x Sphera Sound");
                  else if (e.target.value.includes("Cyberpunk")) setMusicAuthor("CyberGuild Terps");
                  else setMusicAuthor("Sphera Audio Lab");
                }}
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-pink-500 transition cursor-pointer"
              >
                <option value="Afrobeats Synthwave Future Mix Vol. 4">Afrobeats Synthwave Future Mix Vol. 4</option>
                <option value="Cyberpunk 2026 Sovereign Bass Drop">Cyberpunk 2026 Sovereign Bass Drop</option>
                <option value="Bitcamp Hackathon High-Energy Pulse">Bitcamp Hackathon High-Energy Pulse</option>
                <option value="Original Sound - Microphone Audio">Original Sound - Microphone Audio</option>
              </select>
            </div>

            {/* Hashtags Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Hashtags</label>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-pink-500 transition"
              />
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="space-y-3 pt-2">
            {uploadStatus && (
              <div className="text-center text-xs font-bold text-pink-400 animate-pulse flex items-center justify-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{uploadStatus}</span>
              </div>
            )}

            <button
              disabled={isSubmitting || (!recordedVideoUrl && !caption)}
              onClick={handlePublish}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-black text-sm shadow-xl shadow-pink-500/20 transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Publish to Global Feed</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
