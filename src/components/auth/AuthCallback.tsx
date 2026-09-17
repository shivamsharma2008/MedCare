import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { dbService } from "../../lib/supabase";
import { Activity, Loader2, AlertCircle } from "lucide-react";

export const AuthCallback: React.FC = () => {
  const { navigateTo } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: any;
    let isProcessed = false;

    const handleAuthCallback = async () => {
      // 1. Check if URL contains OAuth error
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

      const oauthError =
        searchParams.get("error_description") ||
        searchParams.get("error") ||
        hashParams.get("error_description") ||
        hashParams.get("error");

      if (oauthError) {
        const lower = oauthError.toLowerCase();
        if (lower.includes("cancelled") || lower.includes("access_denied")) {
          setError("Google sign-in was cancelled.");
        } else {
          setError("Google sign-in failed. Please try again.");
        }
        return;
      }

      try {
        const {
          data: { session },
          error: authError,
        } = await supabase.auth.getSession();

        if (authError) throw authError;

        if (session && session.user) {
          isProcessed = true;
          await processUserSession(session.user);
          return;
        }

        // If no session immediately, listen to auth state changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            if (currentSession && currentSession.user && !isProcessed) {
              isProcessed = true;
              authListener.subscription.unsubscribe();
              clearTimeout(timeoutId);
              await processUserSession(currentSession.user);
            }
          }
        );

        // Fallback timeout if session does not resolve
        timeoutId = setTimeout(() => {
          if (!isProcessed) {
            authListener.subscription.unsubscribe();
            setError("Unable to complete Google sign-in. Please try signing in again.");
          }
        }, 4500);
      } catch (err: any) {
        console.error("Auth callback error:", err);
        setError("Google sign-in failed. Please try again.");
      }
    };

    const processUserSession = async (authUser: any) => {
      // Determine desired role from query param or user metadata
      const searchParams = new URLSearchParams(window.location.search);
      const queryRole = searchParams.get("role") as "doctor" | "patient" | null;
      const metaRole = authUser.user_metadata?.role as "doctor" | "patient" | undefined;
      const role = queryRole || metaRole || "patient";
      const name =
        authUser.user_metadata?.full_name ||
        authUser.user_metadata?.name ||
        authUser.email?.split("@")[0] ||
        "User";

      // Ensure profile exists in Supabase
      const existingDoc = await dbService.getDoctorProfile(authUser.id);
      const existingPat = await dbService.getPatientProfile(authUser.id);

      if (role === "doctor" && !existingDoc) {
        await dbService.saveDoctorProfile({
          id: authUser.id,
          user_id: authUser.id,
          email: authUser.email || "",
          name,
          specialization: "General Physician",
          clinic_name: `${name}'s Clinic`,
          clinic_address: "Main Road",
          latitude: 28.6139,
          longitude: 77.2090,
          consultation_fee: 300,
          phone: "",
          is_verified: true,
          availability: {
            days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            startTime: "09:00",
            endTime: "17:00",
            slotDurationMinutes: 30,
          },
          created_at: new Date().toISOString(),
        });
      } else if (role === "patient" && !existingPat) {
        await dbService.savePatientProfile({
          id: authUser.id,
          user_id: authUser.id,
          email: authUser.email || "",
          name,
          blood_group: "O+",
          created_at: new Date().toISOString(),
        });
      }

      // Redirect to appropriate role portal
      if (role === "doctor") {
        navigateTo("/doctor/home");
      } else {
        navigateTo("/patient/home");
      }
    };

    handleAuthCallback();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [navigateTo]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-md max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Sign-in Notice</h2>
            <p className="text-xs text-slate-500 mt-1">{error}</p>
          </div>
          <button
            onClick={() => navigateTo("/login")}
            className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-4 text-white p-4">
      <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center animate-pulse">
        <Activity className="w-8 h-8" />
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-base font-bold tracking-tight">Authenticating with MedCare</h2>
        <p className="text-xs text-slate-400 flex items-center justify-center space-x-1.5">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
          <span>Setting up your secure portal...</span>
        </p>
      </div>
    </div>
  );
};
