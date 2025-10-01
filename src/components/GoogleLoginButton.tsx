"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    google: any;
  }
}

const GoogleLoginButton = () => {
  useEffect(() => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: handleGoogleCredentialResponse,
    });
  }, []);

  const handleGoogleLogin = () => {
    window.google.accounts.id.prompt(); // Show the Google Sign-In prompt
  };

  const handleGoogleCredentialResponse = async (response: any) => {
    const googleToken = response.credential; // This is the ID token

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        body: JSON.stringify({ token: googleToken }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data.success) {
        // Redirect to dashboard
        window.location.href = "/dashboard";
      } else {
        console.error("Google login failed:", data.error);
      }
    } catch (err) {
      console.error("Network error:", err);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="w-full flex items-center justify-center py-3 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-gray-700 dark:text-gray-200 font-semibold text-lg hover:bg-gray-100 dark:hover:bg-gray-700/90 relative overflow-hidden"
    >
      {/* Google Icon */}
      <svg
        className="w-6 h-6 mr-3"
        viewBox="0 0 533.5 544.3"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M533.5 278.4c0-18.5-1.5-36.3-4.3-53.6H272v101.4h146.9c-6.4 34.8-25.6 64.3-54.5 84.1v69h87.9c51.4-47.3 81.2-116.9 81.2-200.9z"
          fill="#4285F4"
        />
        <path
          d="M272 544.3c73.2 0 134.7-24.3 179.5-65.9l-87.9-69c-24.5 16.4-55.7 26-91.6 26-70.5 0-130.3-47.5-151.6-111.4H32.1v69.9C76.9 485.1 167 544.3 272 544.3z"
          fill="#34A853"
        />
        <path
          d="M120.4 325.1c-5.5-16.3-8.7-33.8-8.7-51.6s3.2-35.3 8.7-51.6v-69.9H32.1C11.7 206.4 0 237.5 0 273.5s11.7 67.1 32.1 92.8l88.3-69.2z"
          fill="#FBBC05"
        />
        <path
          d="M272 107.9c38.7-.6 73 13.3 100.2 39.4l75.1-75.1C406.4 24.3 345 0 272 0 167 0 76.9 59.2 32.1 147.4l88.3 69.9c21.3-63.9 81.1-111.4 151.6-109.4z"
          fill="#EA4335"
        />
      </svg>
      Sign in with Google
    </button>
  );
};

export default GoogleLoginButton;
