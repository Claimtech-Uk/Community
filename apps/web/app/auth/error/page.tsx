"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration. Please check that all environment variables are set.",
  AccessDenied: "Access was denied. This could be due to: (1) Missing environment variables (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, DATABASE_URL), (2) Google OAuth is in testing mode and your email is not added as a test user, or (3) Database connection failed.",
  Verification: "The verification link has expired or has already been used.",
  Default: "An error occurred during authentication.",
  OAuthSignin: "Error starting the OAuth sign in flow. Check that GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set.",
  OAuthCallback: "Error handling the OAuth callback. Verify the redirect URI in Google Cloud Console matches: https://community-web-iota.vercel.app/api/auth/callback/google",
  OAuthCreateAccount: "Error creating an OAuth account. Database may not be accessible or DATABASE_URL not set.",
  EmailCreateAccount: "Error creating an email account.",
  Callback: "Error in the OAuth callback handler. Check DATABASE_URL and AUTH_SECRET environment variables.",
  OAuthAccountNotLinked:
    "This email is already associated with another account. Please sign in with your original provider.",
  EmailSignin: "Error sending the sign in email.",
  CredentialsSignin: "Invalid email or password.",
  SessionRequired: "Please sign in to access this page.",
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Default";
  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <div className="w-full max-w-md space-y-8 text-center">
      <div>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <svg
            className="h-8 w-8 text-destructive"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          Authentication Error
        </h1>
        <p className="mt-2 text-muted-foreground">{errorMessage}</p>
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href="/auth/signin"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Try signing in again
        </Link>
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Return to home
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="text-center text-muted-foreground">Loading...</div>
        }
      >
        <ErrorContent />
      </Suspense>
    </div>
  );
}
