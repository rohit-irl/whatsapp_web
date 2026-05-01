import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("chat_user")) {
      navigate("/chat", { replace: true });
    }
  }, [navigate]);

  const validate = () => {
    const nextErrors = {};
    const { username, password, confirmPassword } = formData;

    if (!username.trim()) {
      nextErrors.username = "Username is required";
    }

    if (!password) {
      nextErrors.password = "Password is required";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password";
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      setErrors({});
      setSuccessMessage("");

      await api.post("/auth/signup", {
        username: formData.username.trim(),
        password: formData.password,
      });

      setSuccessMessage("Account created successfully. Redirecting to login...");
      setTimeout(() => navigate("/", { replace: true }), 1000);
    } catch (requestError) {
      const message = requestError.response?.data?.message || "";
      const status = requestError.response?.status;
      if (!requestError.response) {
        setErrors({ form: "Cannot connect to server. Please check if the backend is running." });
      } else if (status === 409 || /exist/i.test(message)) {
        setErrors({ form: "Username already exists" });
      } else {
        setErrors({ form: message || "Unable to sign up. Please try again." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled =
    isSubmitting ||
    !formData.username.trim() ||
    !formData.password ||
    !formData.confirmPassword;

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#25D366] via-[#128C7E] to-[#075E54] px-4 font-sans">
      <div
        className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-white/20 blur-[100px] filter"
        style={{ animation: "blob 7s infinite" }}
      ></div>
      <div
        className="absolute top-[20%] right-[-10%] h-[400px] w-[400px] rounded-full bg-teal-200/30 blur-[80px] filter"
        style={{ animation: "blob 7s infinite 2s" }}
      ></div>

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/40 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
        <h1 className="mb-2 text-center text-2xl font-extrabold text-gray-800">Create Account</h1>
        <p className="mb-6 text-center text-sm font-medium text-gray-500">
          Sign up to start secure real-time chatting
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              type="text"
              value={formData.username}
              onChange={(event) => {
                setFormData((prev) => ({ ...prev, username: event.target.value }));
                if (errors.username || errors.form) setErrors((prev) => ({ ...prev, username: "", form: "" }));
              }}
              placeholder="Username"
              className={`w-full rounded-xl border px-4 py-3 text-gray-800 outline-none transition ${
                errors.username ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-[#25D366]"
              }`}
            />
            {errors.username ? <p className="mt-1 text-sm text-red-500">{errors.username}</p> : null}
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(event) => {
                setFormData((prev) => ({ ...prev, password: event.target.value }));
                if (errors.password || errors.form) setErrors((prev) => ({ ...prev, password: "", form: "" }));
              }}
              placeholder="Password"
              className={`w-full rounded-xl border px-4 py-3 pr-16 text-gray-800 outline-none transition ${
                errors.password ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-[#25D366]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-4 text-sm font-semibold text-gray-500 hover:text-gray-700"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
            {errors.password ? <p className="mt-1 text-sm text-red-500">{errors.password}</p> : null}
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(event) => {
                setFormData((prev) => ({ ...prev, confirmPassword: event.target.value }));
                if (errors.confirmPassword || errors.form) {
                  setErrors((prev) => ({ ...prev, confirmPassword: "", form: "" }));
                }
              }}
              placeholder="Confirm Password"
              className={`w-full rounded-xl border px-4 py-3 pr-16 text-gray-800 outline-none transition ${
                errors.confirmPassword
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-300 focus:border-[#25D366]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              className="absolute inset-y-0 right-4 text-sm font-semibold text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
            {errors.confirmPassword ? (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
            ) : null}
          </div>

          {errors.form ? <p className="text-sm font-medium text-red-500">{errors.form}</p> : null}
          {successMessage ? <p className="text-sm font-medium text-green-600">{successMessage}</p> : null}

          <button
            type="submit"
            disabled={isDisabled}
            className="mt-1 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] px-4 py-3 font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Creating...
              </span>
            ) : (
              "Create Account"
            )}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/" className="font-semibold text-[#128C7E] hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
        `,
        }}
      />
    </main>
  );
};

export default Signup;
