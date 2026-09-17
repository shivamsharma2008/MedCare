import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient.js";
import { useAuth } from "../../context/AuthContext";
import { UserRole } from "../../types";
import {
  Activity,
  Stethoscope,
  User,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  Phone,
  Navigation,
} from "lucide-react";

export const RegisterPage: React.FC = () => {
  const { googleLogin, navigateTo, currentRoute } = useAuth();

  const [role, setRole] = useState<UserRole>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryRole = params.get("role");
      if (queryRole === "doctor" || queryRole === "patient") return queryRole;
      if (window.location.pathname.includes("doctor")) return "doctor";
    }
    return "patient";
  });

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("email") || "";
    }
    return "";
  });
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  // Doctor Specific
  const [specialization, setSpecialization] = useState<string>("General Physician");
  const [clinicName, setClinicName] = useState<string>("");
  const [clinicAddress, setClinicAddress] = useState<string>("");
  const [consultationFee, setConsultationFee] = useState<number>(300);
  const [lat, setLat] = useState<number>(28.6139);
  const [lng, setLng] = useState<number>(77.2090);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Patient Specific
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("Male");
  const [bloodGroup, setBloodGroup] = useState<string>("O+");

  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentRoute.includes("doctor")) {
      setRole("doctor");
    } else if (currentRoute.includes("patient")) {
      setRole("patient");
    }
  }, [currentRoute]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(Number(pos.coords.latitude.toFixed(6)));
        setLng(Number(pos.coords.longitude.toFixed(6)));
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName || !cleanEmail || !password) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-enter.");
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            full_name: cleanName,
            name: cleanName,
            role: role,
            phone: phone.trim(),
            specialization: role === "doctor" ? specialization : undefined,
            clinic_name: role === "doctor" ? (clinicName.trim() || `${cleanName}'s Clinic`) : undefined,
            clinic_address: role === "doctor" ? (clinicAddress.trim() || "Main Road") : undefined,
            consultation_fee: role === "doctor" ? Number(consultationFee) : undefined,
            latitude: role === "doctor" ? Number(lat) : undefined,
            longitude: role === "doctor" ? Number(lng) : undefined,
            age: role === "patient" && age ? Number(age) : undefined,
            gender: role === "patient" ? gender : undefined,
            blood_group: role === "patient" ? bloodGroup : undefined,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      // Do NOT auto-login: if a session was returned, sign out so the user logs in fresh
      if (data.session) {
        await supabase.auth.signOut();
      }

      // Redirect to the Sign In page with pre-filled email and registered flag
      const targetRoute =
        role === "doctor"
          ? `/doctor/login?registered=true&email=${encodeURIComponent(cleanEmail)}`
          : `/patient/login?registered=true&email=${encodeURIComponent(cleanEmail)}`;
      
      navigateTo(targetRoute);
    } catch (err: any) {
      console.error("Registration Error:", err);
      setErrorMsg(err.message || "Registration failed. Please check your details.");
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
      setErrorMsg(err.message || "Google registration failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoToLogin = () => {
    const target =
      role === "doctor"
        ? `/doctor/login${email ? `?email=${encodeURIComponent(email)}` : ""}`
        : `/patient/login${email ? `?email=${encodeURIComponent(email)}` : ""}`;
    navigateTo(target);
  };

  return (
    <div className="min-h-[calc(100vh-57px)] flex items-center justify-center p-4 sm:p-6 bg-slate-50">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden my-4">
        {/* Header */}
        <div className="p-6 sm:p-8 bg-slate-900 text-white text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mx-auto">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Create {role === "doctor" ? "Doctor" : "Patient"} Account
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Select your role to configure your personal healthcare or clinic portal.
            </p>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-800 rounded-xl max-w-xs mx-auto text-xs font-semibold">
            <button
              type="button"
              id="tab-reg-patient"
              onClick={() => {
                setRole("patient");
                if (currentRoute.includes("doctor")) navigateTo("/patient/register");
              }}
              className={`py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                role === "patient"
                  ? "bg-cyan-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Patient</span>
            </button>
            <button
              type="button"
              id="tab-reg-doctor"
              onClick={() => {
                setRole("doctor");
                if (currentRoute.includes("patient")) navigateTo("/doctor/register");
              }}
              className={`py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                role === "doctor"
                  ? "bg-cyan-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor / Clinic</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 space-y-2 animate-fadeIn">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
              {errorMsg.toLowerCase().includes("already registered") && (
                <button
                  type="button"
                  onClick={handleGoToLogin}
                  className="w-full py-1.5 px-3 bg-red-100 hover:bg-red-200 text-red-900 rounded-lg font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <span>Sign In to Existing Account</span>
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Common Fields */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Full Name *</label>
              <input
                id="input-register-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === "doctor" ? "Dr. Anand Sharma" : "Rajesh Patel"}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Email Address *</label>
              <input
                id="input-register-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-register-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Confirm Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-register-confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Contact Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="input-register-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Doctor Specific Fields */}
            {role === "doctor" && (
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-800">
                  Doctor & Clinic Details
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Specialization</label>
                    <select
                      id="select-register-specialization"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                    >
                      <option value="General Physician">General Physician</option>
                      <option value="Cardiologist">Cardiologist</option>
                      <option value="Pediatrician">Pediatrician</option>
                      <option value="Dermatologist">Dermatologist</option>
                      <option value="Orthopedic">Orthopedic</option>
                      <option value="Gynecologist">Gynecologist</option>
                      <option value="Neurologist">Neurologist</option>
                      <option value="ENT Specialist">ENT Specialist</option>
                      <option value="Dentist">Dentist</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Consultation Fee (₹)</label>
                    <input
                      id="input-register-fee"
                      type="number"
                      min={0}
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Clinic / Hospital Name *</label>
                  <input
                    id="input-register-clinic-name"
                    type="text"
                    required
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    placeholder="e.g. LifeCare Rural Clinic"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Clinic Address</label>
                  <input
                    id="input-register-clinic-address"
                    type="text"
                    value={clinicAddress}
                    onChange={(e) => setClinicAddress(e.target.value)}
                    placeholder="Station Road, Block 4"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">
                    Coordinates: ({lat}, {lng})
                  </span>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="text-xs text-cyan-600 hover:text-cyan-700 font-semibold flex items-center space-x-1"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{isLocating ? "Detecting GPS..." : "Auto-Detect GPS"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Patient Specific Fields */}
            {role === "patient" && (
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  Patient Health Details
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Age</label>
                    <input
                      id="input-register-age"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="30"
                      className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Gender</label>
                    <select
                      id="select-register-gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-2 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Blood</label>
                    <select
                      id="select-register-blood"
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full px-2 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                    >
                      {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <button
              id="btn-submit-register"
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-cyan-600/20 flex items-center justify-center space-x-2 transition-transform active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create {role === "doctor" ? "Doctor" : "Patient"} Account</span>
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
              id="btn-google-signup"
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
                  <span>Sign up with Google</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-600">
            Already have an account?{" "}
            <button
              id="btn-nav-login"
              onClick={handleGoToLogin}
              className="text-cyan-600 hover:text-cyan-700 font-bold ml-1 hover:underline"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
