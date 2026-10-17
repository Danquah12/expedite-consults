"use client";

import { useState, useEffect, useCallback } from "react";
import { ClusterData, SlideData, CameraState } from "./types";
import { CLUSTERS, ALL_SLIDES, PRESENTATION_META } from "@/data/presentation-data";
import { soundFX } from "./audio";
import confetti from "canvas-confetti";

export function usePresentation() {
  const [camera, setCamera] = useState<CameraState>({
    x: PRESENTATION_META.overviewCoordinates.x,
    y: PRESENTATION_META.overviewCoordinates.y,
    zoom: PRESENTATION_META.overviewCoordinates.zoom,
  });

  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(-1);
  const [isOverview, setIsOverview] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const activeSlide: SlideData | undefined =
    currentSlideIndex >= 0 && currentSlideIndex < ALL_SLIDES.length
      ? ALL_SLIDES[currentSlideIndex]
      : undefined;

  const nextSlide: SlideData | undefined =
    currentSlideIndex + 1 < ALL_SLIDES.length ? ALL_SLIDES[currentSlideIndex + 1] : undefined;

  const activeCluster: ClusterData | undefined = activeSlide
    ? CLUSTERS.find((c) => c.id === activeSlide.clusterId)
    : undefined;

  // Sound FX sync
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      soundFX.enabled = prev; // if previously muted, new state is unmuted (soundFX.enabled = true)
      return !prev;
    });
  }, []);

  // Confetti trigger
  const triggerConfetti = useCallback(() => {
    soundFX.playChime();
    confetti({
      particleCount: 120,
      spread: 75,
      origin: { y: 0.65 },
      colors: ["#38bdf8", "#818cf8", "#34d399", "#f472b6", "#fbbf24"],
    });
  }, []);

  // Navigate to Overview
  const goToOverview = useCallback(() => {
    soundFX.playWhoosh();
    setIsOverview(true);
    setCurrentSlideIndex(-1);
    setCamera({
      x: PRESENTATION_META.overviewCoordinates.x,
      y: PRESENTATION_META.overviewCoordinates.y,
      zoom: PRESENTATION_META.overviewCoordinates.zoom,
    });
  }, []);

  // Navigate to Specific Slide
  const goToSlide = useCallback((index: number) => {
    if (index < 0) {
      goToOverview();
      return;
    }
    const safeIdx = Math.min(Math.max(index, 0), ALL_SLIDES.length - 1);
    const targetSlide = ALL_SLIDES[safeIdx];
    if (!targetSlide) return;

    soundFX.playWhoosh();
    setIsOverview(false);
    setCurrentSlideIndex(safeIdx);

    setCamera({
      x: targetSlide.x,
      y: targetSlide.y,
      zoom: targetSlide.scale || 1.65,
    });

    // Milestone celebration on last slide!
    if (safeIdx === ALL_SLIDES.length - 1) {
      setTimeout(() => {
        triggerConfetti();
      }, 700);
    }
  }, [goToOverview, triggerConfetti]);

  // Navigate to Specific Cluster
  const goToCluster = useCallback((cluster: ClusterData) => {
    soundFX.playWhoosh();
    setIsOverview(false);
    // Find the first slide in this cluster
    const slideIdx = ALL_SLIDES.findIndex((s) => s.clusterId === cluster.id);
    if (slideIdx !== -1) {
      goToSlide(slideIdx);
    } else {
      setCamera({
        x: cluster.x,
        y: cluster.y,
        zoom: 0.95,
      });
    }
  }, [goToSlide]);

  const nextSlideAction = useCallback(() => {
    if (isOverview) {
      goToSlide(0);
    } else if (currentSlideIndex < ALL_SLIDES.length - 1) {
      goToSlide(currentSlideIndex + 1);
    } else {
      // Loop back to overview
      goToOverview();
    }
  }, [isOverview, currentSlideIndex, goToSlide, goToOverview]);

  const prevSlideAction = useCallback(() => {
    if (isOverview) {
      goToSlide(ALL_SLIDES.length - 1);
    } else if (currentSlideIndex > 0) {
      goToSlide(currentSlideIndex - 1);
    } else {
      goToOverview();
    }
  }, [isOverview, currentSlideIndex, goToSlide, goToOverview]);

  // Fullscreen Toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  }, []);

  // Timer Tick
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Autoplay Timer (every 8 seconds advances slide)
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      nextSlideAction();
    }, 8500);
    return () => clearInterval(interval);
  }, [isPlaying, nextSlideAction]);

  // Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when focusing form controls or sliders
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") {
        return;
      }

      switch (e.key) {
        case "ArrowRight":
        case " ": // Space
          e.preventDefault();
          nextSlideAction();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prevSlideAction();
          break;
        case "Escape":
        case "o":
        case "O":
          e.preventDefault();
          goToOverview();
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "n":
        case "N":
          e.preventDefault();
          setShowNotes((prev) => !prev);
          break;
        case "m":
        case "M":
          e.preventDefault();
          toggleMute();
          break;
        case "p":
        case "P":
          e.preventDefault();
          setIsPlaying((prev) => !prev);
          break;
        case "?":
          e.preventDefault();
          setShowHelp((prev) => !prev);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlideAction, prevSlideAction, goToOverview, toggleFullscreen, toggleMute]);

  return {
    clusters: CLUSTERS,
    totalSlides: ALL_SLIDES.length,
    currentSlideIndex,
    activeSlide,
    nextSlide,
    activeCluster,
    camera,
    setCamera,
    isOverview,
    isPlaying,
    isMuted,
    isFullscreen,
    showNotes,
    showDrawer,
    showHelp,
    elapsedSeconds,
    goToSlide,
    onNext: nextSlideAction,
    onPrev: prevSlideAction,
    goToOverview,
    goToCluster,
    triggerConfetti,
    togglePlay: () => setIsPlaying((p) => !p),
    toggleMute,
    toggleFullscreen,
    toggleNotes: () => setShowNotes((n) => !n),
    toggleDrawer: () => setShowDrawer((d) => !d),
    openHelp: () => setShowHelp(true),
    closeHelp: () => setShowHelp(false),
  };
}
