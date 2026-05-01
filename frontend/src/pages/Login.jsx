import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsMounted(true);
    if (localStorage.getItem("chat_user") || localStorage.getItem("chat_username")) {
      navigate("/chat", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError("Username is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const { data } = await api.post("/users", { username: trimmedUsername });
      localStorage.setItem("chat_username", trimmedUsername);
      localStorage.setItem("chat_user", JSON.stringify(data));
      navigate("/chat");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to login. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#25D366] via-[#128C7E] to-[#075E54] px-4 font-sans">
      {/* Background Animated Blobs (Fixed Visibility) */}
      <div 
        className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-white/20 blur-[100px] filter"
        style={{ animation: 'blob 7s infinite' }}
      ></div>
      <div 
        className="absolute top-[20%] right-[-10%] h-[400px] w-[400px] rounded-full bg-teal-200/30 blur-[80px] filter"
        style={{ animation: 'blob 7s infinite 2s' }}
      ></div>
      <div 
        className="absolute bottom-[-10%] left-[20%] h-[600px] w-[600px] rounded-full bg-emerald-300/20 blur-[120px] filter"
        style={{ animation: 'blob 7s infinite 4s' }}
      ></div>

      {/* Noise Texture Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay z-0"></div>

      {/* Floating UI Elements (Chat Bubbles) */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Top Left */}
        <div 
          className="absolute top-[15%] left-[10%] w-48 rounded-2xl rounded-tl-sm border border-white/20 bg-white/10 p-4 shadow-xl backdrop-blur-md"
          style={{ animation: 'float1 12s ease-in-out infinite' }}
        >
          <div className="h-2 w-3/4 rounded bg-white/60"></div>
          <div className="mt-2 h-2 w-1/2 rounded bg-white/40"></div>
        </div>

        {/* Top Right (Blurred) */}
        <div 
          className="absolute top-[25%] right-[15%] w-32 rounded-2xl rounded-tr-sm border border-white/10 bg-white/5 p-3 shadow-lg backdrop-blur-sm blur-[2px]"
          style={{ animation: 'float2 14s ease-in-out infinite reverse' }}
        >
          <div className="h-2 w-full rounded bg-white/50"></div>
          <div className="mt-2 h-2 w-2/3 rounded bg-white/30"></div>
        </div>

        {/* Bottom Left (Green tint) */}
        <div 
          className="absolute bottom-[20%] left-[15%] w-40 rounded-2xl rounded-bl-sm border border-green-300/20 bg-[#25D366]/20 p-4 shadow-xl backdrop-blur-md"
          style={{ animation: 'float3 15s ease-in-out infinite' }}
        >
          <div className="h-2 w-full rounded bg-white/70"></div>
          <div className="mt-2 h-2 w-4/5 rounded bg-white/50"></div>
        </div>

        {/* Bottom Right */}
        <div 
          className="absolute bottom-[25%] right-[10%] w-56 rounded-2xl rounded-br-sm border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-lg"
          style={{ animation: 'float1 10s ease-in-out infinite 2s' }}
        >
          <div className="h-2 w-full rounded bg-white/60"></div>
          <div className="mt-3 h-2 w-5/6 rounded bg-white/40"></div>
          <div className="mt-3 h-2 w-1/2 rounded bg-white/40"></div>
        </div>

        {/* Mid Right (Very small) */}
        <div 
          className="absolute top-[50%] right-[25%] w-24 rounded-xl border border-white/10 bg-white/5 p-2 shadow-sm backdrop-blur-sm blur-[1px]"
          style={{ animation: 'float3 18s ease-in-out infinite 1s' }}
        >
          <div className="h-1.5 w-full rounded bg-white/40"></div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center">
        
        {/* Background Text (Added back and made prominent) */}
        <div 
          className={`mb-16 md:mb-20 md:-mt-10 text-center transition-all duration-1000 ease-out ${
            isMounted ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
          }`}
        >
          <h1 className="mb-4 text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-xl">
            Chat Smarter.<br className="md:hidden" /> Connect Faster.
          </h1>
          <p className="text-lg md:text-xl font-medium text-green-50 drop-shadow-md">
            A modern real-time messaging experience
          </p>
        </div>

        {/* Card Wrapper for Entrance Animation */}
        <div
          className={`w-full max-w-md transform transition-all duration-1000 delay-150 ease-out ${
            isMounted ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          {/* Static Card */}
          <div className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
            {/* Logo & Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#25D366] to-[#128C7E] shadow-lg shadow-green-500/30">
                <svg className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.01 2.01c-5.52 0-10 4.48-10 10 0 1.95.56 3.76 1.51 5.31L2 22l4.82-1.46c1.51.89 3.25 1.47 5.19 1.47 5.52 0 10-4.48 10-10s-4.48-10-10-10zm5.82 14.39c-.25.72-1.46 1.39-2.02 1.47-.52.07-1.19.19-3.79-1.25-3.15-1.74-5.2-5.46-5.36-5.69-.15-.22-1.28-1.76-1.28-3.36s.83-2.39 1.13-2.73c.27-.3.59-.38.79-.38.2 0 .4 0 .57.01.2.01.46-.08.72.56.27.67.92 2.3.99 2.45.08.15.13.33.03.53-.1.2-.15.33-.3.51-.15.18-.32.4-.45.53-.15.15-.31.32-.13.62.18.3 1.38 2.29 3.16 3.86 2.3 2.03 4.25 2.68 4.56 2.83.3.15.48.13.67-.08.18-.22.8-1 1.02-1.34.22-.35.43-.28.72-.18.28.1 1.83.91 2.14 1.07.31.15.52.23.59.36.08.12.08.73-.17 1.45z" />
                </svg>
              </div>
              <h2 className="mb-2 text-2xl font-extrabold text-gray-800">Welcome to WhatsApp</h2>
              <p className="text-sm font-medium text-gray-500">Enter your username to start chatting</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="relative">
                {/* FIX: Added z-10 so the icon stays visible above the input background */}
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4 text-gray-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    if (error) setError("");
                  }}
                  autoFocus
                  placeholder="Username"
                  className="relative w-full rounded-full border border-gray-200 bg-white/60 py-3 pl-12 pr-5 text-gray-800 shadow-sm outline-none backdrop-blur-md transition-all duration-300 placeholder:text-gray-400 focus:border-[#25D366] focus:bg-white focus:ring-4 focus:ring-[#25D366]/20"
                />
              </div>
              
              {error && (
                <p className="animate-pulse pl-4 text-sm font-medium text-red-500">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!username.trim() || isSubmitting}
                className="group relative mt-2 flex w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E] px-5 py-3 font-bold text-white shadow-lg shadow-green-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-green-500/50 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none"
              >
                {isSubmitting ? (
                  <svg className="h-6 w-6 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <span className="flex items-center gap-2">
                    Continue to Chat
                    <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                )}
                {/* Ripple effect overlay on hover */}
                <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Global styles for floating/blob animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float1 {
          0%, 100% { transform: translate(0px, 0px) rotate(-2deg); }
          50% { transform: translate(10px, -20px) rotate(1deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0px, 0px) rotate(2deg); }
          50% { transform: translate(-10px, -30px) rotate(-1deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
          50% { transform: translate(-15px, 25px) rotate(3deg); }
        }
      `}} />
    </main>
  );
};

export default Login;
