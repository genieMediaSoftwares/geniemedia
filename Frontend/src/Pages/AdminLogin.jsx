import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import BASE_URL from "../Api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/admin/blogs");
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // Handle non-200 HTTP responses
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        setError(errData?.message || `Server error (${res.status}). Please try again.`);
        return;
      }

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        navigate("/admin/blogs");
      } else {
        setError(data.message || "Invalid credentials.");
      }
    } catch (err) {
      // Network error or CORS block
      if (!navigator.onLine) {
        setError("No internet connection. Please check your network.");
      } else {
        setError("Unable to reach server. Please try again later.");
      }
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white overflow-x-hidden">

      {/* ── Hero Banner ── */}
      <section className="relative min-h-[50vh] md:min-h-[60vh] lg:min-h-[55vh] xl:min-h-[50vh] text-white overflow-hidden flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/39/lIZrwvbeRuuzqOoWJUEn_Photoaday_CSD%20%281%20of%201%29-5.jpg?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Admin Portal
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Secure access to manage your Genie Studio content and operations
          </p>
        </div>
      </section>

      {/* ── Login Form ── */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12 lg:py-16">
        <div className="w-full max-w-sm md:max-w-md lg:max-w-md">
          <div className="bg-white p-5 sm:p-6 md:p-8 lg:p-10 rounded-2xl shadow-lg md:shadow-xl border border-yellow-100 transition hover:shadow-xl md:hover:shadow-2xl">

            {/* Card Header */}
            <div className="mb-6 md:mb-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">
                  Welcome Back
                </h2>
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-lg sm:text-xl font-bold">👤</span>
                </div>
              </div>
              <div className="h-1 sm:h-1.5 w-20 sm:w-24 bg-gradient-to-r from-yellow-500 to-amber-600 rounded" />
              <p className="text-gray-600 text-xs sm:text-sm mt-2 md:mt-3 font-medium">
                Sign in to your admin account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4 md:space-y-5" noValidate>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block mb-1.5 sm:mb-2 text-xs sm:text-sm font-semibold text-gray-700"
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    placeholder="admin@geniemedia.in"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    autoComplete="email"
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:bg-white outline-none transition duration-200 hover:border-gray-300 text-sm sm:text-base"
                  />
                  <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-lg pointer-events-none">
                    ✉️
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block mb-1.5 sm:mb-2 text-xs sm:text-sm font-semibold text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    autoComplete="current-password"
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:bg-white outline-none transition duration-200 hover:border-gray-300 text-sm sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-600 transition duration-200 p-1"
                  >
                    {showPassword
                      ? <EyeOff size={18} className="sm:w-5 sm:h-5" />
                      : <Eye size={18} className="sm:w-5 sm:h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center text-xs sm:text-sm">
                <label className="flex items-center gap-2 cursor-pointer group select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-2 border-gray-300 cursor-pointer accent-yellow-500 transition"
                  />
                  <span className="text-gray-600 group-hover:text-gray-700 transition font-medium">
                    Remember me
                  </span>
                </label>
              </div>

              {/* Error message */}
              {error && (
                <div
                  role="alert"
                  className="bg-red-50 border-2 border-red-300 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium"
                >
                  ⚠️ {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white py-2.5 sm:py-3 md:py-3.5 rounded-lg font-bold text-sm sm:text-base transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg disabled:shadow-sm transform hover:scale-105 disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs sm:text-sm">Logging in...</span>
                  </span>
                ) : (
                  "Login to Admin"
                )}
              </button>

            </form>

            {/* Footer */}
            <div className="mt-6 md:mt-8 pt-4 sm:pt-6 border-t-2 border-gray-200 text-center">
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                © 2026 Genie Studio Admin.{" "}
                <br className="sm:hidden" />
                All rights reserved.{" "}
                <br />
                <span className="text-yellow-600 font-semibold">🔒 Secure Area</span>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-600 mt-4 sm:mt-6 px-2 font-medium">
            By logging in, you agree to our{" "}
            <a
              href="#"
              className="text-yellow-600 hover:text-amber-600 font-bold transition"
            >
              Terms of Service
            </a>
          </p>
        </div>
      </section>

    </div>
  );
}