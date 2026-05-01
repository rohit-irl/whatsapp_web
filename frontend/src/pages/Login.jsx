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
    <main className="flex min-h-screen items-center justify-center bg-[#f0f2f5] px-4">
      <div 
        className={`w-full max-w-[400px] transform rounded-2xl bg-white p-8 shadow-lg transition-all duration-700 ease-out ${
          isMounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm">
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.01 2.01c-5.52 0-10 4.48-10 10 0 1.95.56 3.76 1.51 5.31L2 22l4.82-1.46c1.51.89 3.25 1.47 5.19 1.47 5.52 0 10-4.48 10-10s-4.48-10-10-10zm5.82 14.39c-.25.72-1.46 1.39-2.02 1.47-.52.07-1.19.19-3.79-1.25-3.15-1.74-5.2-5.46-5.36-5.69-.15-.22-1.28-1.76-1.28-3.36s.83-2.39 1.13-2.73c.27-.3.59-.38.79-.38.2 0 .4 0 .57.01.2.01.46-.08.72.56.27.67.92 2.3.99 2.45.08.15.13.33.03.53-.1.2-.15.33-.3.51-.15.18-.32.4-.45.53-.15.15-.31.32-.13.62.18.3 1.38 2.29 3.16 3.86 2.3 2.03 4.25 2.68 4.56 2.83.3.15.48.13.67-.08.18-.22.8-1 1.02-1.34.22-.35.43-.28.72-.18.28.1 1.83.91 2.14 1.07.31.15.52.23.59.36.08.12.08.73-.17 1.45z" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Welcome to WhatsApp Web</h1>
          <p className="text-sm text-gray-500">Enter your name to continue chatting</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                if (error) setError("");
              }}
              autoFocus
              placeholder="Enter your username"
              className="w-full rounded-full border border-gray-300 bg-gray-50 px-5 py-3 text-gray-800 outline-none transition-all duration-300 placeholder:text-gray-400 focus:scale-[1.02] focus:border-[#25D366] focus:bg-white focus:ring-2 focus:ring-[#25D366]/20"
            />
            {error && (
              <p className="mt-2 pl-4 text-xs font-medium text-red-500 animate-pulse">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!username.trim() || isSubmitting}
            className="group relative flex w-full items-center justify-center rounded-full bg-[#25D366] px-5 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:bg-green-600 hover:shadow-lg active:scale-95 disabled:scale-100 disabled:cursor-not-allowed disabled:bg-[#86dcb2] disabled:opacity-70 disabled:shadow-none"
          >
            {isSubmitting ? (
              <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Continue"
            )}
          </button>
        </form>
      </div>
    </main>
  );
};

export default Login;
