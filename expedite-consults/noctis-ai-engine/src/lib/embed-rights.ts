/** Playback rules. We never ask a viewer to sign in to YouTube or Vimeo. */

export const YOUTUBE_BLOCK = [
  "Age-restricted films — YouTube will not embed them without a signed-in adult account.",
  "Embedding disabled by the owner — player error 101 / 150.",
  "Private, members-only, or premium films.",
  "Deleted or missing films — player error 100.",
] as const;

export const YOUTUBE_ALLOW = [
  "Public films with embedding on, played in YouTube’s official iframe.",
  "We identify the player with a Referer (strict-origin-when-cross-origin).",
  "We do not download or re-host the file.",
] as const;

export const VIMEO_ALLOW = [
  "Public or unlisted films with embed set to Anywhere.",
  "oEmbed must return html — if it 404s, the film is not public and we skip it.",
  "Viewers do not need a Vimeo account.",
] as const;

export const VIMEO_BLOCK = [
  "Private films (login required).",
  "Password films (a gate is a sign-in by another name).",
  "Domain-locked films that exclude this host.",
  "Hide-from-Vimeo with embed Nowhere.",
] as const;
