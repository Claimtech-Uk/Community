import Mux from "@mux/mux-node";
import jwt from "jsonwebtoken";

// Initialize Mux client with API credentials
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export const { video } = mux;

// Export the webhook utilities
export { mux };

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
