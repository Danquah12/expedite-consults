/** The cutout background is off. The live room sends the camera itself. */
export function mountStudyStage(video: HTMLVideoElement) {
  const raw = video.srcObject instanceof MediaStream ? video.srcObject : new MediaStream();
  return {
    stage: raw,
    stop() {},
  };
}
