import Mux from "@mux/mux-node";

export const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID || "dummy_token_id",
  tokenSecret: process.env.MUX_TOKEN_SECRET || "dummy_token_secret",
});

/**
 * Create a Mux direct upload URL.
 * The client uploads directly to Mux — the backend never handles the video bytes.
 */
export async function createMuxUpload() {
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    throw new Error("MUX credentials are not configured in environment variables.");
  }

  const upload = await mux.video.uploads.create({
    cors_origin: process.env.NEXT_PUBLIC_APP_URL ?? "*",
    new_asset_settings: {
      playback_policy: ["public"],
      encoding_tier: "smart",
    },
  });

  return {
    uploadId: upload.id,
    uploadUrl: upload.url,
  };
}

/**
 * Get a Mux asset by its asset ID.
 */
export async function getMuxAsset(assetId: string) {
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    throw new Error("MUX credentials are not configured in environment variables.");
  }
  return mux.video.assets.retrieve(assetId);
}

/**
 * Delete a Mux asset.
 */
export async function deleteMuxAsset(assetId: string) {
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    throw new Error("MUX credentials are not configured in environment variables.");
  }
  return mux.video.assets.delete(assetId);
}
