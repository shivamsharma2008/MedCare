import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient.js";
import { useAuth } from "../../context/AuthContext";
import { UserRole } from "../../types";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import {
  Activity,
  Stethoscope,
  User,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  UserPlus,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export const LoginPage: React.FC = () => {
  const { googleLogin, loginDemo, navigateTo, currentRoute } = useAuth();

  const [role, setRole] = useState<UserRole>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryRole = params.get("role");
      if (queryRole === "doctor" || queryRole === "patient") return queryRole;
      if (window.location.pathname.includes("doctor")) return "doctor";
    }
    return "patient";
  });

  const [email, setEmail] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("email") || "";
    }
    return "";
  });

  const [successMsg, setSuccessMsg] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("registered") === "true") {
        return "Your account has been created. Please check your email and verify your address before logging in.";
      }
    }
    return null;
  });

  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [demoLoading, setDemoLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [forgotModalOpen, setForgotModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get("email");
      if (emailParam) {
        setEmail(emailParam);
      }
      if (params.get("registered") === "true") {
        setSuccessMsg("Your account has been created. Please check your email and verify your address before logging in.");
      }
    }

    if (currentRoute.includes("doctor")) {
      setRole("doctor");
    } else if (currentRoute.includes("patient")) {
      setRole("patient");
    }
  }, [currentRoute]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      if (data.session) {
        navigateTo("/");
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      setErrorMsg(err.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setGoogleLoading(true);
    try {
      await googleLogin(role);
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      setErrorMsg(err.message || "Google authentication failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMsg(null);
    setDemoLoading(true);
    try {
      await loginDemo(role);
    } catch (err: any) {
      console.error("Demo Login Error:", err);
      setErrorMsg(err.message || "Unable to start demo session. Please try again.");
    } finally {
      setDemoLoading(false);
    }
  };

  const handleGoToRegister = () => {
    const target =
      role === "doctor"
        ? `/doctor/register${email ? `?email=${encodeURIComponent(email)}` : ""}`
        : `/patient/register${email ? `?email=${encodeURIComponent(email)}` : ""}`;
    navigateTo(target);
  };

  return (
    <div className="min-h-[calc(100vh-57px)] flex items-center justify-center p-4 sm:p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 bg-slate-900 text-white text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mx-auto">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {role === "doctor" ? "Doctor Login" : "Patient Login"}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              From Handwritten to Health Record
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-800 rounded-xl max-w-xs mx-auto text-xs font-semibold">
            <button
              type="button"
              id="tab-role-patient"
              onClick={() => {
                setRole("patient");
                if (currentRoute.includes("doctor")) {
                  navigateTo(`/patient/login${email ? `?email=${encodeURIComponent(email)}` : ""}`);
                }
              }}
              className={`py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                role === "patient"
                  ? "bg-cyan-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Patient Portal</span>
            </button>
            <button
              type="button"
              id="tab-role-doctor"
              onClick={() => {
                setRole("doctor");
                if (currentRoute.includes("patient")) {
                  navigateTo(`/doctor/login${email ? `?email=${encodeURIComponent(email)}` : ""}`);
                }
              }}
              className={`py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                role === "doctor"
                  ? "bg-cyan-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor Portal</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-start space-x-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 space-y-2 animate-fadeIn">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
              <button
                type="button"
                onClick={handleGoToRegister}
                className="w-full py-1.5 px-3 bg-red-100 hover:bg-red-200 text-red-900 rounded-lg font-semibold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create New {role === "doctor" ? "Doctor" : "Patient"} Account</span>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="input-login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-[11px] text-cyan-600 hover:text-cyan-700 font-medium hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="input-login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow"
                />
              </div>
            </div>

            <button
              id="btn-submit-login"
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-cyan-600/20 flex items-center justify-center space-x-2 transition-transform active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In as {role === "doctor" ? "Doctor" : "Patient"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Auth */}
          <div className="space-y-3 pt-2">
            <div className="relative text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Or Continue With
              </span>
            </div>

            <button
              id="btn-google-login"
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading || googleLoading}
              className="w-full py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            >
              {googleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Demo Account Section */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5 text-center">
              <button
                id="btn-demo-login"
                type="button"
                onClick={handleDemoLogin}
                disabled={loading || googleLoading || demoLoading}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-colors active:scale-98 disabled:opacity-50"
              >
                {demoLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                    <span>Loading Demo Account...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Continue with Demo Account</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-slate-400 font-medium">
                Demo account for testing only
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-600">
            Don't have an account yet?{" "}
            <button
              id="btn-nav-register"
              onClick={handleGoToRegister}
              className="text-cyan-600 hover:text-cyan-700 font-bold ml-1 hover:underline"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        initialEmail={email}
      />
    </div>
  );
};
