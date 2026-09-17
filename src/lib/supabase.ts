import { supabase } from "../supabaseClient";
import {
  UserSession,
  DoctorProfile,
  PatientProfile,
  ParchaRecord,
  Appointment,
  HealthFile,
  UserRole,
} from "../types";

export { supabase };

// Helper to store items in localStorage for resilience and demo isolation
const getLocalItem = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(`medcare_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const setLocalItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(`medcare_${key}`, JSON.stringify(value));
  } catch {}
};

// ==========================================
// DEMO DATA SEEDING (IS_DEMO = TRUE)
// ==========================================
const DEMO_DOCTOR_ID = "demo-doctor-id";
const DEMO_PATIENT_ID = "demo-patient-id";
const DEMO_EMAIL = "demo@medcare.test";

const SEED_DEMO_DOCTOR: DoctorProfile = {
  id: DEMO_DOCTOR_ID,
  user_id: DEMO_DOCTOR_ID,
  email: DEMO_EMAIL,
  name: "Dr. Sameer Verma (Demo)",
  specialization: "General Physician",
  clinic_name: "MedCare Demo Healthcare Clinic",
  clinic_address: "12 Connaught Place, New Delhi",
  latitude: 28.6304,
  longitude: 77.2177,
  consultation_fee: 400,
  phone: "+91 98765 00000",
  is_verified: true,
  is_demo: true,
  availability: {
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    startTime: "09:00",
    endTime: "17:00",
    slotDurationMinutes: 30,
  },
  created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
};

const SEED_DEMO_PATIENTS: PatientProfile[] = [
  {
    id: DEMO_PATIENT_ID,
    user_id: DEMO_PATIENT_ID,
    email: DEMO_EMAIL,
    name: "Ramesh Kumar (Demo)",
    date_of_birth: "1982-05-14",
    age: 42,
    gender: "Male",
    blood_group: "O+",
    phone: "+91 98111 00000",
    chronic_conditions: ["Hypertension"],
    allergies: ["Penicillin"],
    emergency_contact: {
      name: "Sunita Kumar",
      relation: "Spouse",
      phone: "+91 98111 00001",
    },
    address: "B-42, Vasant Kunj, New Delhi",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    is_demo: true,
  },
  {
    id: "demo-patient-2",
    user_id: "demo-patient-2",
    email: "pooja.demo@medcare.test",
    name: "Pooja Sharma (Demo)",
    date_of_birth: "1995-10-22",
    age: 29,
    gender: "Female",
    blood_group: "B+",
    phone: "+91 98222 00000",
    chronic_conditions: ["Mild Asthma"],
    allergies: ["Dust", "Sulfa drugs"],
    emergency_contact: {
      name: "Vikas Sharma",
      relation: "Brother",
      phone: "+91 98222 00001",
    },
    address: "Pocket 1, Dwarka, New Delhi",
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    is_demo: true,
  },
];

const SEED_DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: "demo-appt-1",
    doctor_id: DEMO_DOCTOR_ID,
    doctor_name: "Dr. Sameer Verma (Demo)",
    clinic_name: "MedCare Demo Healthcare Clinic",
    doctor_specialization: "General Physician",
    doctor_phone: "+91 98765 00000",
    doctor_address: "12 Connaught Place, New Delhi",
    patient_id: DEMO_PATIENT_ID,
    patient_name: "Ramesh Kumar (Demo)",
    patient_phone: "+91 98111 00000",
    patient_age: 42,
    patient_gender: "Male",
    appointment_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    slot_time: "10:30 AM",
    reason: "Routine Blood Pressure & Health Checkup",
    status: "confirmed",
    notes: "Patient advised to bring last week BP logs.",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    is_demo: true,
  },
  {
    id: "demo-appt-2",
    doctor_id: DEMO_DOCTOR_ID,
    doctor_name: "Dr. Sameer Verma (Demo)",
    clinic_name: "MedCare Demo Healthcare Clinic",
    doctor_specialization: "General Physician",
    doctor_phone: "+91 98765 00000",
    doctor_address: "12 Connaught Place, New Delhi",
    patient_id: "demo-patient-2",
    patient_name: "Pooja Sharma (Demo)",
    patient_phone: "+91 98222 00000",
    patient_age: 29,
    patient_gender: "Female",
    appointment_date: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
    slot_time: "02:00 PM",
    reason: "Seasonal Allergy Consultation",
    status: "pending",
    notes: "Follow-up after nebulization.",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    is_demo: true,
  },
];

const SEED_DEMO_PARCHAS: ParchaRecord[] = [
  {
    id: "demo-parcha-1",
    doctor_id: DEMO_DOCTOR_ID,
    doctor_name: "Dr. Sameer Verma (Demo)",
    clinic_name: "MedCare Demo Healthcare Clinic",
    patient_id: DEMO_PATIENT_ID,
    patient_name: "Ramesh Kumar (Demo)",
    patient_age: 42,
    patient_gender: "Male",
    patient_phone: "+91 98111 00000",
    visit_date: new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0],
    symptoms: ["Mild headache", "Elevated BP (145/90)", "Fatigue"],
    diagnosis: "Stage 1 Essential Hypertension",
    medicines: [
      {
        name: "Amlodipine",
        dosage: "5mg",
        frequency: "Once Daily (OD)",
        duration: "30 Days",
        instructions: "Take in the morning after breakfast",
      },
      {
        name: "Telmisartan",
        dosage: "40mg",
        frequency: "Once Daily (OD)",
        duration: "30 Days",
        instructions: "Take at bedtime with water",
      },
    ],
    notes: "Advised low-sodium diet and daily 30-min brisk walk. Repeat BP check in 14 days.",
    image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800",
    verified_by_doctor: true,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    is_demo: true,
  },
];

const SEED_DEMO_FILES: HealthFile[] = [
  {
    id: "demo-file-1",
    patient_id: DEMO_PATIENT_ID,
    patient_name: "Ramesh Kumar (Demo)",
    file_name: "Complete_Blood_Count_Demo.pdf",
    title: "Complete Blood Count (CBC) & Lipid Profile",
    category: "Lab Reports",
    file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    file_size: 142000,
    file_type: "application/pdf",
    doctor_name: "Dr. Sameer Verma (Demo)",
    clinic_name: "MedCare Demo Healthcare Clinic",
    report_date: new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    is_demo: true,
  },
];

export const dbService = {
  isUsingLiveSupabase(): boolean {
    return Boolean(supabase);
  },

  // Check if currently operating in a demo session
  isDemoSessionActive(): boolean {
    try {
      const demo = localStorage.getItem("medcare_demo_session");
      return Boolean(demo);
    } catch {
      return false;
    }
  },

  getDemoSession(): UserSession | null {
    try {
      const raw = localStorage.getItem("medcare_demo_session");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setDemoSession(session: UserSession | null): void {
    try {
      if (session) {
        localStorage.setItem("medcare_demo_session", JSON.stringify(session));
      } else {
        localStorage.removeItem("medcare_demo_session");
      }
    } catch {}
  },

  // Auth: Get initial active session (Real Supabase Auth has top priority)
  async getInitialSession(): Promise<UserSession | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!error && session && session.user) {
        // Clear any stale demo session when real user is signed in
        this.setDemoSession(null);

        const user = session.user;
        const userMeta = user.user_metadata || {};

        let role = (userMeta.role as "doctor" | "patient") || "patient";
        let name = userMeta.full_name || userMeta.name || user.email?.split("@")[0] || "User";

        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, full_name")
            .eq("id", user.id)
            .maybeSingle();

          if (profile) {
            if (profile.role) role = profile.role as "doctor" | "patient";
            if (profile.full_name) name = profile.full_name;
          }
        } catch {}

        return {
          id: user.id,
          email: user.email || "",
          role,
          name,
          avatar_url: userMeta.avatar_url,
          is_demo: false,
        };
      }
    } catch (err) {
      console.warn("Supabase session check error:", err);
    }

    // Check if a demo session is currently active
    const demo = this.getDemoSession();
    if (demo) {
      return demo;
    }

    return null;
  },

  // Auth: Dedicated Demo Account Login
  async signInDemo(rolePreference: UserRole = "patient"): Promise<UserSession> {
    const isDoc = rolePreference === "doctor";
    const demoUser: UserSession = {
      id: isDoc ? DEMO_DOCTOR_ID : DEMO_PATIENT_ID,
      email: DEMO_EMAIL,
      role: rolePreference,
      name: isDoc ? "Dr. Sameer Verma (Demo)" : "Ramesh Kumar (Demo)",
      is_demo: true,
    };

    this.setDemoSession(demoUser);
    return demoUser;
  },

  // Auth: Real Email/Password Sign In with error normalization
  async signIn(email: string, password: string, rolePreference?: "doctor" | "patient"): Promise<UserSession> {
    const cleanEmail = email.trim().toLowerCase();

    // Clear any previous demo session
    this.setDemoSession(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        const msg = (error.message || "").toLowerCase();
        if (
          msg.includes("invalid login credentials") ||
          msg.includes("invalid_credentials") ||
          msg.includes("invalid email or password") ||
          msg.includes("invalid path") ||
          msg.includes("user not found") ||
          msg.includes("not confirmed")
        ) {
          throw new Error("Invalid email or password. Please verify your credentials or create a new account.");
        }
        throw new Error(error.message || "Failed to sign in. Please try again.");
      }

      if (!data.user) {
        throw new Error("No user returned from authentication service.");
      }

      const user = data.user;
      const userMeta = user.user_metadata || {};

      let role = (userMeta.role as "doctor" | "patient") || rolePreference || "patient";
      let name = userMeta.full_name || userMeta.name || user.email?.split("@")[0] || "User";

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", user.id)
          .maybeSingle();

        if (profile) {
          if (profile.role) role = profile.role as "doctor" | "patient";
          if (profile.full_name) name = profile.full_name;
        }
      } catch {}

      return {
        id: user.id,
        email: user.email || cleanEmail,
        role,
        name,
        avatar_url: userMeta.avatar_url,
        is_demo: false,
      };
    } catch (err: any) {
      if (err.message && err.message.includes("Invalid email or password")) {
        throw err;
      }
      const msg = (err.message || "").toLowerCase();
      if (msg.includes("invalid path") || msg.includes("invalid login") || msg.includes("invalid_credentials")) {
        throw new Error("Invalid email or password. Please verify your credentials or create a new account.");
      }
      throw new Error(err.message || "Unable to sign in. Please check your network connection and credentials.");
    }
  },

  // Auth: Real Sign Up
  async signUp(
    email: string,
    password: string,
    name: string,
    role: "doctor" | "patient",
    extraData?: Partial<DoctorProfile | PatientProfile>
  ): Promise<UserSession> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    this.setDemoSession(null);

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          name: cleanName,
          full_name: cleanName,
          role,
        },
      },
    });

    if (error) {
      throw new Error(error.message || "Registration failed. Please check your details.");
    }

    const user = data.user;
    if (!user) {
      throw new Error("Registration completed, but user record was not returned.");
    }

    // Save profile record
    try {
      await supabase.from("profiles").upsert({
        id: user.id,
        auth_user_id: user.id,
        role,
        full_name: cleanName,
        email: cleanEmail,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch {}

    // Save role profile
    if (role === "doctor") {
      await this.saveDoctorProfile({
        id: user.id,
        user_id: user.id,
        email: cleanEmail,
        name: cleanName,
        specialization: (extraData as any)?.specialization || "General Physician",
        clinic_name: (extraData as any)?.clinic_name || `${cleanName}'s Clinic`,
        clinic_address: (extraData as any)?.clinic_address || "Main Road",
        latitude: (extraData as any)?.latitude || 28.6139,
        longitude: (extraData as any)?.longitude || 77.2090,
        consultation_fee: (extraData as any)?.consultation_fee || 300,
        phone: (extraData as any)?.phone || "",
        is_verified: true,
        is_demo: false,
        availability: {
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          startTime: "09:00",
          endTime: "17:00",
          slotDurationMinutes: 30,
        },
        created_at: new Date().toISOString(),
      });
    } else {
      await this.savePatientProfile({
        id: user.id,
        user_id: user.id,
        email: cleanEmail,
        name: cleanName,
        phone: (extraData as any)?.phone || "",
        age: (extraData as any)?.age || undefined,
        gender: (extraData as any)?.gender || "Male",
        blood_group: (extraData as any)?.blood_group || "O+",
        is_demo: false,
        created_at: new Date().toISOString(),
      });
    }

    return {
      id: user.id,
      email: cleanEmail,
      role,
      name: cleanName,
      is_demo: false,
    };
  },

  // Auth: Real Google OAuth Sign In
  async signInWithGoogle(rolePreference: "doctor" | "patient" = "patient"): Promise<void> {
    this.setDemoSession(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${rolePreference}`,
      },
    });
    if (error) {
      throw new Error(error.message || "Failed to initiate Google authentication.");
    }
  },

  // Auth: Sign Out
  async signOut(): Promise<void> {
    this.setDemoSession(null);
    try {
      await supabase.auth.signOut();
    } catch {}
  },

  // ==========================================
  // DOCTORS PROFILE & DIRECTORY
  // ==========================================
  async getDoctorProfile(userId: string): Promise<DoctorProfile | null> {
    if (userId === DEMO_DOCTOR_ID || this.isDemoSessionActive()) {
      return SEED_DEMO_DOCTOR;
    }

    try {
      const { data: docData, error } = await supabase
        .from("doctors")
        .select("*")
        .or(`id.eq.${userId},auth_user_id.eq.${userId}`)
        .maybeSingle();

      if (!error && docData) {
        return {
          id: docData.id || userId,
          user_id: docData.auth_user_id || docData.user_id || userId,
          email: docData.email || "",
          name: docData.name || "Doctor",
          specialization: docData.specialization || "General Physician",
          clinic_name: docData.clinic_name || "MedCare Clinic",
          clinic_address: docData.clinic_address || "Main Road",
          latitude: Number(docData.latitude) || 28.6139,
          longitude: Number(docData.longitude) || 77.2090,
          consultation_fee: Number(docData.consultation_fee) || 300,
          phone: docData.phone || "",
          is_verified: docData.is_verified ?? true,
          is_demo: false,
          availability: docData.availability || {
            days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            startTime: "09:00",
            endTime: "17:00",
            slotDurationMinutes: 30,
          },
          created_at: docData.created_at || new Date().toISOString(),
        };
      }
    } catch {}

    const localDoctors = getLocalItem<DoctorProfile[]>("user_doctors", []);
    return localDoctors.find((d) => (d.id === userId || d.user_id === userId) && !d.is_demo) || null;
  },

  async saveDoctorProfile(profile: DoctorProfile): Promise<DoctorProfile> {
    if (profile.id === DEMO_DOCTOR_ID || profile.is_demo) {
      return profile;
    }

    const cleanProfile: DoctorProfile = { ...profile, is_demo: false };
    try {
      await supabase.from("doctors").upsert({
        id: cleanProfile.id,
        auth_user_id: cleanProfile.user_id || cleanProfile.id,
        name: cleanProfile.name,
        email: cleanProfile.email,
        phone: cleanProfile.phone,
        specialization: cleanProfile.specialization,
        clinic_name: cleanProfile.clinic_name,
        clinic_address: cleanProfile.clinic_address,
        latitude: cleanProfile.latitude,
        longitude: cleanProfile.longitude,
        consultation_fee: cleanProfile.consultation_fee,
        availability: cleanProfile.availability,
        is_verified: cleanProfile.is_verified,
        updated_at: new Date().toISOString(),
      });
    } catch {}

    const localDocs = getLocalItem<DoctorProfile[]>("user_doctors", []);
    const filtered = localDocs.filter((d) => d.id !== cleanProfile.id && d.user_id !== cleanProfile.id);
    setLocalItem("user_doctors", [...filtered, cleanProfile]);

    return cleanProfile;
  },

  async getAllDoctors(): Promise<DoctorProfile[]> {
    // If in demo mode, provide the demo doctor alongside any mock clinic for testing
    if (this.isDemoSessionActive()) {
      return [SEED_DEMO_DOCTOR];
    }

    try {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .order("name", { ascending: true });

      if (!error && data && data.length > 0) {
        // Real users NEVER see demo records
        return data
          .filter((d: any) => d.id !== DEMO_DOCTOR_ID && !d.email?.includes("demo@"))
          .map((d: any) => ({
            id: d.id,
            user_id: d.auth_user_id || d.id,
            email: d.email || "",
            name: d.name,
            specialization: d.specialization || "General Physician",
            clinic_name: d.clinic_name || "MedCare Clinic",
            clinic_address: d.clinic_address || "Main Road",
            latitude: Number(d.latitude) || 28.6139,
            longitude: Number(d.longitude) || 77.2090,
            consultation_fee: Number(d.consultation_fee) || 300,
            phone: d.phone || "",
            is_verified: d.is_verified ?? true,
            is_demo: false,
            availability: d.availability || {
              days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
              startTime: "09:00",
              endTime: "17:00",
              slotDurationMinutes: 30,
            },
            created_at: d.created_at || new Date().toISOString(),
          }));
      }
    } catch {}

    const local = getLocalItem<DoctorProfile[]>("user_doctors", []);
    return local.filter((d) => !d.is_demo);
  },

  // ==========================================
  // PATIENTS PROFILE
  // ==========================================
  async getPatientProfile(userId: string): Promise<PatientProfile | null> {
    if (userId === DEMO_PATIENT_ID || this.isDemoSessionActive()) {
      return SEED_DEMO_PATIENTS[0];
    }

    try {
      const { data: patData, error } = await supabase
        .from("patients")
        .select("*")
        .or(`id.eq.${userId},auth_user_id.eq.${userId}`)
        .maybeSingle();

      if (!error && patData) {
        return {
          id: patData.id || userId,
          user_id: patData.auth_user_id || patData.user_id || userId,
          email: patData.email || "",
          name: patData.name || "Patient",
          date_of_birth: patData.date_of_birth || "",
          age: patData.age || undefined,
          gender: patData.gender || undefined,
          weight: patData.weight_kg || patData.weight || undefined,
          height: patData.height_cm || patData.height || undefined,
          blood_group: patData.blood_group || "O+",
          phone: patData.phone || "",
          chronic_conditions: patData.chronic_conditions || [],
          allergies: patData.allergies || [],
          emergency_contact: patData.emergency_contact,
          created_at: patData.created_at || new Date().toISOString(),
          is_demo: false,
        };
      }
    } catch {}

    const localPatients = getLocalItem<PatientProfile[]>("user_patients", []);
    return localPatients.find((p) => (p.id === userId || p.user_id === userId) && !p.is_demo) || null;
  },

  async savePatientProfile(profile: PatientProfile): Promise<PatientProfile> {
    if (profile.id === DEMO_PATIENT_ID || profile.is_demo) {
      return profile;
    }

    const cleanProfile: PatientProfile = { ...profile, is_demo: false };
    try {
      await supabase.from("patients").upsert({
        id: cleanProfile.id,
        auth_user_id: cleanProfile.user_id || cleanProfile.id,
        name: cleanProfile.name,
        date_of_birth: cleanProfile.date_of_birth,
        age: cleanProfile.age,
        gender: cleanProfile.gender,
        blood_group: cleanProfile.blood_group,
        phone: cleanProfile.phone,
        chronic_conditions: cleanProfile.chronic_conditions,
        allergies: cleanProfile.allergies,
        emergency_contact: cleanProfile.emergency_contact,
        updated_at: new Date().toISOString(),
      });
    } catch {}

    const localPatients = getLocalItem<PatientProfile[]>("user_patients", []);
    const filtered = localPatients.filter((p) => p.id !== cleanProfile.id && p.user_id !== cleanProfile.id);
    setLocalItem("user_patients", [...filtered, cleanProfile]);

    return cleanProfile;
  },

  // ==========================================
  // PARCHA RECORDS
  // ==========================================
  async saveParchaRecord(record: Omit<ParchaRecord, "id" | "created_at">): Promise<ParchaRecord> {
    const isDemo = this.isDemoSessionActive() || record.is_demo === true;
    const newRecord: ParchaRecord = {
      ...record,
      id: (isDemo ? "demo_parcha_" : "parcha_") + Math.random().toString(36).substring(2, 9),
      is_demo: isDemo,
      created_at: new Date().toISOString(),
    };

    if (isDemo) {
      const demoParchas = getLocalItem<ParchaRecord[]>("demo_parchas", SEED_DEMO_PARCHAS);
      setLocalItem("demo_parchas", [newRecord, ...demoParchas]);
      return newRecord;
    }

    try {
      const { data, error } = await supabase
        .from("parcha_records")
        .insert(newRecord)
        .select()
        .single();

      if (!error && data) {
        return { ...data, is_demo: false } as ParchaRecord;
      }
    } catch {}

    const localParchas = getLocalItem<ParchaRecord[]>("user_parchas", []);
    setLocalItem("user_parchas", [newRecord, ...localParchas]);
    return newRecord;
  },

  async getDoctorParchas(doctorId: string): Promise<ParchaRecord[]> {
    if (doctorId === DEMO_DOCTOR_ID || this.isDemoSessionActive()) {
      return getLocalItem<ParchaRecord[]>("demo_parchas", SEED_DEMO_PARCHAS);
    }

    try {
      const { data, error } = await supabase
        .from("parcha_records")
        .select("*")
        .eq("doctor_id", doctorId)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.filter((p: any) => !p.is_demo) as ParchaRecord[];
      }
    } catch {}

    const localParchas = getLocalItem<ParchaRecord[]>("user_parchas", []);
    return localParchas.filter((p) => p.doctor_id === doctorId && !p.is_demo);
  },

  async getPatientParchas(patientId: string, patientName?: string): Promise<ParchaRecord[]> {
    if (patientId === DEMO_PATIENT_ID || this.isDemoSessionActive()) {
      const demoParchas = getLocalItem<ParchaRecord[]>("demo_parchas", SEED_DEMO_PARCHAS);
      return demoParchas.filter((p) => p.is_demo);
    }

    try {
      let query = supabase.from("parcha_records").select("*");
      if (patientName && patientName.trim()) {
        query = query.or(`patient_id.eq.${patientId},patient_name.ilike.%${patientName.trim()}%`);
      } else {
        query = query.eq("patient_id", patientId);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        return data.filter((p: any) => !p.is_demo) as ParchaRecord[];
      }
    } catch {}

    const localParchas = getLocalItem<ParchaRecord[]>("user_parchas", []);
    return localParchas.filter(
      (p) =>
        !p.is_demo &&
        (p.patient_id === patientId ||
          (patientName && p.patient_name.toLowerCase().includes(patientName.toLowerCase().trim())))
    );
  },

  async deletePatientRecords(doctorId: string, patientName: string, patientId?: string): Promise<void> {
    if (doctorId === DEMO_DOCTOR_ID || this.isDemoSessionActive()) {
      const demoParchas = getLocalItem<ParchaRecord[]>("demo_parchas", SEED_DEMO_PARCHAS);
      const updated = demoParchas.filter(
        (p) =>
          !(
            p.doctor_id === doctorId &&
            (p.patient_name === patientName || (patientId && p.patient_id === patientId))
          )
      );
      setLocalItem("demo_parchas", updated);
      return;
    }

    try {
      let query = supabase.from("parcha_records").delete().eq("doctor_id", doctorId);
      if (patientId) {
        query = query.eq("patient_id", patientId);
      } else {
        query = query.eq("patient_name", patientName);
      }
      await query;
    } catch {}

    const localParchas = getLocalItem<ParchaRecord[]>("user_parchas", []);
    const updated = localParchas.filter(
      (p) =>
        !(
          p.doctor_id === doctorId &&
          (p.patient_name === patientName || (patientId && p.patient_id === patientId))
        )
    );
    setLocalItem("user_parchas", updated);
  },

  // ==========================================
  // APPOINTMENTS
  // ==========================================
  async bookAppointment(appt: Omit<Appointment, "id" | "created_at" | "status">): Promise<Appointment> {
    const isDemo = this.isDemoSessionActive() || appt.is_demo === true;
    const newAppt: Appointment = {
      ...appt,
      id: (isDemo ? "demo_appt_" : "appt_") + Math.random().toString(36).substring(2, 9),
      status: "pending",
      is_demo: isDemo,
      created_at: new Date().toISOString(),
    };

    if (isDemo) {
      const demoAppts = getLocalItem<Appointment[]>("demo_appointments", SEED_DEMO_APPOINTMENTS);
      setLocalItem("demo_appointments", [newAppt, ...demoAppts]);
      return newAppt;
    }

    try {
      const { data, error } = await supabase
        .from("appointments")
        .insert(newAppt)
        .select()
        .single();

      if (!error && data) {
        return { ...data, is_demo: false } as Appointment;
      }
    } catch {}

    const localAppts = getLocalItem<Appointment[]>("user_appointments", []);
    setLocalItem("user_appointments", [newAppt, ...localAppts]);
    return newAppt;
  },

  async updateAppointmentStatus(appointmentId: string, status: Appointment["status"]): Promise<void> {
    if (appointmentId.startsWith("demo_") || this.isDemoSessionActive()) {
      const demoAppts = getLocalItem<Appointment[]>("demo_appointments", SEED_DEMO_APPOINTMENTS);
      const updated = demoAppts.map((a) => (a.id === appointmentId ? { ...a, status } : a));
      setLocalItem("demo_appointments", updated);
      return;
    }

    try {
      await supabase.from("appointments").update({ status }).eq("id", appointmentId);
    } catch {}

    const localAppts = getLocalItem<Appointment[]>("user_appointments", []);
    const updated = localAppts.map((a) => (a.id === appointmentId ? { ...a, status } : a));
    setLocalItem("user_appointments", updated);
  },

  async getDoctorAppointments(doctorId: string): Promise<Appointment[]> {
    if (doctorId === DEMO_DOCTOR_ID || this.isDemoSessionActive()) {
      return getLocalItem<Appointment[]>("demo_appointments", SEED_DEMO_APPOINTMENTS);
    }

    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("doctor_id", doctorId)
        .order("appointment_date", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.filter((a: any) => !a.is_demo) as Appointment[];
      }
    } catch {}

    const localAppts = getLocalItem<Appointment[]>("user_appointments", []);
    return localAppts.filter((a) => a.doctor_id === doctorId && !a.is_demo);
  },

  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    if (patientId === DEMO_PATIENT_ID || this.isDemoSessionActive()) {
      return getLocalItem<Appointment[]>("demo_appointments", SEED_DEMO_APPOINTMENTS).filter(
        (a) => a.patient_id === DEMO_PATIENT_ID || a.patient_id === patientId
      );
    }

    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("patient_id", patientId)
        .order("appointment_date", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.filter((a: any) => !a.is_demo) as Appointment[];
      }
    } catch {}

    const localAppts = getLocalItem<Appointment[]>("user_appointments", []);
    return localAppts.filter((a) => a.patient_id === patientId && !a.is_demo);
  },

  async createAppointment(appointment: Omit<Appointment, "id" | "created_at">): Promise<Appointment> {
    return this.bookAppointment(appointment);
  },

  // ==========================================
  // HEALTH FILES & REPORTS
  // ==========================================
  async saveHealthFile(file: Omit<HealthFile, "id" | "created_at">): Promise<HealthFile> {
    const isDemo = this.isDemoSessionActive() || file.is_demo === true;
    const newFile: HealthFile = {
      ...file,
      id: (isDemo ? "demo_file_" : "file_") + Math.random().toString(36).substring(2, 9),
      is_demo: isDemo,
      created_at: new Date().toISOString(),
    };

    if (isDemo) {
      const demoFiles = getLocalItem<HealthFile[]>("demo_health_files", SEED_DEMO_FILES);
      setLocalItem("demo_health_files", [newFile, ...demoFiles]);
      return newFile;
    }

    try {
      const { data, error } = await supabase
        .from("health_files")
        .insert(newFile)
        .select()
        .single();

      if (!error && data) {
        return { ...data, is_demo: false } as HealthFile;
      }
    } catch {}

    const localFiles = getLocalItem<HealthFile[]>("user_health_files", []);
    setLocalItem("user_health_files", [newFile, ...localFiles]);
    return newFile;
  },

  async uploadPatientFile(file: Omit<HealthFile, "id" | "created_at">): Promise<HealthFile> {
    return this.saveHealthFile(file);
  },

  async getPatientFiles(patientId: string, category?: string): Promise<HealthFile[]> {
    if (patientId === DEMO_PATIENT_ID || this.isDemoSessionActive()) {
      const demoFiles = getLocalItem<HealthFile[]>("demo_health_files", SEED_DEMO_FILES);
      let filtered = demoFiles.filter((f) => f.patient_id === DEMO_PATIENT_ID || f.patient_id === patientId);
      if (category && category !== "All") {
        filtered = filtered.filter((f) => f.category === category);
      }
      return filtered;
    }

    try {
      let query = supabase.from("health_files").select("*").eq("patient_id", patientId);
      if (category && category !== "All") {
        query = query.eq("category", category);
      }
      const { data, error } = await query.order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        return data.filter((f: any) => !f.is_demo) as HealthFile[];
      }
    } catch {}

    const localFiles = getLocalItem<HealthFile[]>("user_health_files", []);
    let filtered = localFiles.filter((f) => f.patient_id === patientId && !f.is_demo);
    if (category && category !== "All") {
      filtered = filtered.filter((f) => f.category === category);
    }
    return filtered;
  },

  async deleteHealthFile(fileId: string): Promise<void> {
    if (fileId.startsWith("demo_") || this.isDemoSessionActive()) {
      const demoFiles = getLocalItem<HealthFile[]>("demo_health_files", SEED_DEMO_FILES);
      setLocalItem(
        "demo_health_files",
        demoFiles.filter((f) => f.id !== fileId)
      );
      return;
    }

    try {
      await supabase.from("health_files").delete().eq("id", fileId);
    } catch {}

    const localFiles = getLocalItem<HealthFile[]>("user_health_files", []);
    setLocalItem(
      "user_health_files",
      localFiles.filter((f) => f.id !== fileId)
    );
  },

  async deletePatientFile(fileId: string): Promise<void> {
    return this.deleteHealthFile(fileId);
  },
};
