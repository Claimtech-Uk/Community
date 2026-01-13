import Mux from "@mux/mux-node";
import jwt from "jsonwebtoken";

/**
 * Check if Mux is configured with required credentials
 */
export function isMuxConfigured(): boolean {
  return !!(process.env.MUX_TOKEN_ID && process.env.MUX_TOKEN_SECRET);
}

/**
 * Check if Mux signing keys are configured (for signed playback)
 */
export function isMuxSigningConfigured(): boolean {
  return !!(process.env.MUX_SIGNING_KEY_ID && process.env.MUX_SIGNING_PRIVATE_KEY);
}

/**
 * Get Mux configuration status for display
 */
export function getMuxConfigStatus(): {
  configured: boolean;
  signingConfigured: boolean;
  missing: string[];
} {
  const missing: string[] = [];
  
  if (!process.env.MUX_TOKEN_ID) missing.push("MUX_TOKEN_ID");
  if (!process.env.MUX_TOKEN_SECRET) missing.push("MUX_TOKEN_SECRET");
  if (!process.env.MUX_SIGNING_KEY_ID) missing.push("MUX_SIGNING_KEY_ID");
  if (!process.env.MUX_SIGNING_PRIVATE_KEY) missing.push("MUX_SIGNING_PRIVATE_KEY");
  
  return {
    configured: isMuxConfigured(),
    signingConfigured: isMuxSigningConfigured(),
    missing,
  };
}

// Initialize Mux client with API credentials (lazy to avoid errors when not configured)
let muxClient: Mux | null = null;

function getMuxClient(): Mux | null {
  if (muxClient) return muxClient;
  
  if (!isMuxConfigured()) {
    return null;
  }
  
  muxClient = new Mux({
    tokenId: process.env.MUX_TOKEN_ID!,
    tokenSecret: process.env.MUX_TOKEN_SECRET!,
  });
  
  return muxClient;
}

// Export video API (may be null if not configured)
export const video = {
  get uploads() {
    const client = getMuxClient();
    if (!client) {
      throw new Error("Mux not configured - MUX_TOKEN_ID and MUX_TOKEN_SECRET are required");
    }
    return client.video.uploads;
  },
  get assets() {
    const client = getMuxClient();
    if (!client) {
      throw new Error("Mux not configured - MUX_TOKEN_ID and MUX_TOKEN_SECRET are required");
    }
    return client.video.assets;
  },
};

// Export the mux client getter
export { getMuxClient as mux };

/**
 * Generate a signed playback URL for Mux video
 * Signed URLs expire after 1 hour for security
 */
export function generateSignedPlaybackUrl(playbackId: string): string {
  const signingKeyId = process.env.MUX_SIGNING_KEY_ID;
  const signingPrivateKey = process.env.MUX_SIGNING_PRIVATE_KEY;

  if (!signingKeyId || !signingPrivateKey) {
    console.error("Missing MUX_SIGNING_KEY_ID or MUX_SIGNING_PRIVATE_KEY");
    // Return unsigned URL as fallback (won't work for signed playback policies)
    return `https://stream.mux.com/${playbackId}.m3u8`;
  }

  // Decode base64 private key
  const privateKey = Buffer.from(signingPrivateKey, "base64").toString("utf8");

  // Token expires in 1 hour
  const expiresIn = 60 * 60; // 1 hour in seconds
  const exp = Math.floor(Date.now() / 1000) + expiresIn;

  // Create JWT token for signed URL
  const token = jwt.sign(
    {
      sub: playbackId,
      aud: "v",
      exp,
      kid: signingKeyId,
    },
    privateKey,
    { algorithm: "RS256" }
  );

  return token;
}

/**
 * Get playback token for Mux Player
 * This returns just the token, not the full URL
 */
export function getPlaybackToken(playbackId: string): string | null {
  const signingKeyId = process.env.MUX_SIGNING_KEY_ID;
  const signingPrivateKey = process.env.MUX_SIGNING_PRIVATE_KEY;

  if (!signingKeyId || !signingPrivateKey) {
    console.error("Missing MUX_SIGNING_KEY_ID or MUX_SIGNING_PRIVATE_KEY");
    return null;
  }

  // Decode base64 private key
  const privateKey = Buffer.from(signingPrivateKey, "base64").toString("utf8");

  // Token expires in 1 hour
  const expiresIn = 60 * 60; // 1 hour in seconds
  const exp = Math.floor(Date.now() / 1000) + expiresIn;

  // Create JWT token
  const token = jwt.sign(
    {
      sub: playbackId,
      aud: "v",
      exp,
      kid: signingKeyId,
    },
    privateKey,
    { algorithm: "RS256" }
  );

  return token;
}
