# MedCare

**From Handwritten to Health Record**

MedCare is an AI-powered healthcare platform designed to help clinics digitize handwritten prescriptions ("Parcha") and manage patient information more efficiently.

The platform connects two experiences:

- **Doctor Portal** — scan handwritten prescriptions, extract information with AI, verify the result, store the original prescription, manage patients, and handle appointments.
- **Patient Portal** — securely access health records, reports, files, appointments, find doctors by specialization and location, and create customized health reports.

---

## ✨ Key Features

### Doctor Portal

- Real email/password authentication
- Google authentication through Supabase Auth
- Secure doctor and clinic profiles
- Real phone/web camera access for scanning handwritten prescriptions
- Camera permission requested before use
- Upload a prescription from device files
- Store the original prescription image securely
- AI-powered handwriting extraction using a vision-capable Gemini model
- Structured extraction of:
  - Patient name
  - Age
  - Gender
  - Symptoms
  - Diagnosis when explicitly written
  - Medicines
  - Dosage
  - Frequency
  - Duration
  - Notes
- Doctor review and editing before saving
- Patient records and visit history
- Patient search
- Original Parcha viewing
- Patient record deletion with confirmation
- Appointment management
- Doctor availability management
- Clinic dashboard and statistics

### Patient Portal

- Real email/password authentication
- Google login through Supabase Auth
- New patient registration
- Patient profile setup
- Appointments
- Health reports
- Medical history
- My Files
- Customized health report generation
- Find a Doctor by specialization
- Nearby doctor search using location permission or manual location
- Distance-based doctor results
- Real appointment slots and booking
- Secure access to personal medical documents

---

## 🔄 Core Workflow

### Prescription Digitization

```text
Doctor Login
    ↓
Scan Parcha
    ↓
Ask Camera Permission
    ↓
Real Phone Camera / Upload File
    ↓
Original Image Stored
    ↓
Gemini Vision AI
    ↓
Structured Medical Information
    ↓
Doctor Reviews & Edits
    ↓
Confirm & Save
    ↓
Patient + Visit Record
    ↓
Searchable Medical History
```

### Patient Doctor Discovery

```text
Patient Login
    ↓
Find a Doctor
    ↓
Choose Specialization
    ↓
Use Current Location / Manual Location
    ↓
Search Registered Doctors
    ↓
Calculate Distance
    ↓
Check Availability
    ↓
View Doctor
    ↓
Select Available Slot
    ↓
Book Appointment
    ↓
Doctor Confirms
    ↓
Patient Sees Updated Status
```

---

## 🧠 AI Extraction

MedCare uses a vision-capable Gemini model to read handwritten prescriptions.

The AI is used for **information extraction**, not autonomous medical decision-making.

The system is designed to:

- Extract only information visible in the prescription
- Avoid guessing unclear handwriting
- Mark uncertain fields for review
- Preserve the original prescription image
- Require doctor verification before creating a final medical record

> **Important:** AI output should always be reviewed by an authorized medical professional before being treated as a final record.

MedCare does not use the AI to independently prescribe treatment or change medication dosage.

---

## 🔐 Authentication

Authentication is handled using **Supabase Auth**.

Supported methods:

- Email + password
- Google OAuth

Patient and Doctor accounts use the same Supabase authentication infrastructure while remaining separated by application role.

Typical flow:

```text
Supabase Auth
    ↓
User Profile
    ↓
Role
 ┌───────────┐
 │           │
Patient    Doctor
 │           │
 ↓           ↓
Patient     Doctor
Portal      Portal
```

---

## 🗄️ Data & Storage

MedCare uses Supabase for application data and secure file storage.

Typical data includes:

- User profiles
- Doctor profiles
- Patient profiles
- Clinics
- Visits
- Appointments
- Doctor availability
- Health reports
- Parcha images
- Generated health reports

Sensitive medical documents should be stored in private storage buckets and accessed through secure signed URLs.

New users should start with an empty account:

- No dummy patients
- No fake appointments
- No fake reports
- No fake medical history
- No hardcoded dashboard statistics

---

## 🛠️ Technology Stack

The exact implementation can vary by deployment, but the project is designed around:

- **Frontend:** React / modern responsive web UI
- **Styling:** CSS / Tailwind CSS
- **Authentication:** Supabase Auth
- **Database:** Supabase PostgreSQL
- **Storage:** Supabase Storage
- **AI:** Google Gemini Vision-capable model
- **Backend/API:** Node.js / Express or secure server-side API routes
- **Deployment:** Vercel

---

## 📁 Suggested Project Structure

```text
MedCare/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── utils/
│   ├── supabaseClient.js
│   └── App.*
├── api/ or backend/
├── .env.example
├── package.json
├── README.md
└── vercel.json
```

The exact folder structure may differ depending on the current project implementation.

---

## ⚙️ Local Development

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd MedCare
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` or `.env` file based on the project's framework.

Example:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_SUPABASE_KEY

GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

For server-side environments, keep secret variables such as:

```env
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

**Never expose service-role keys or Gemini secret keys in frontend code.**

### 4. Start development

```bash
npm run dev
```

---

## 🔑 Supabase Setup

Create a Supabase project and configure:

### Authentication

Enable:

- Email provider
- Google provider

Configure the Google OAuth application in Google Cloud and add the correct Supabase OAuth callback URL.

### Database

Create the required tables for:

- profiles
- doctors
- patients
- clinics
- visits
- appointments
- doctor availability
- health reports
- files
- generated reports

### Row Level Security

Enable RLS and ensure:

- Patients can access only their own records.
- Doctors can access only records authorized for their clinic.
- Users cannot access another user's private health information.

### Storage

Create private buckets for:

```text
parcha-images
health-reports
health-files
generated-reports
```

Use signed URLs for private medical documents.

---

## 🤖 Gemini Setup

Create a Gemini API key through Google AI services.

Store it only on the server:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

The browser should never receive the secret Gemini key.

Recommended extraction behavior:

```text
Prescription Image
       ↓
Gemini Vision
       ↓
Structured JSON
       ↓
Validation
       ↓
Doctor Review
       ↓
Save
```

---

## 📷 Camera & File Access

The Scan Parcha feature is designed for web browsers.

### Mobile

Uses the device camera after explicit permission:

```javascript
navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: { ideal: "environment" }
  },
  audio: false
});
```

### Desktop

Uses an available webcam when supported.

### File fallback

Users can select an existing prescription using the browser file picker.

Camera access is not requested automatically on page load.

The user must explicitly choose the scan action first.

---

## 📍 Find a Doctor

The Patient Portal supports:

- Specialization selection
- Current location permission
- Manual location search
- Real registered doctor data
- Clinic coordinates
- Distance calculation
- Availability checks
- Appointment slot generation
- Appointment booking

No fake doctor should be shown as a real result.

If no matching doctor exists, the application should display a useful empty state instead of generating fictional results.

---

## 📅 Appointment System

Appointments are linked to:

```text
Patient
   ↓
Doctor
   ↓
Clinic
```

Supported states may include:

- Pending
- Confirmed
- Rejected
- Cancelled
- Completed
- No Show

Appointment slots should be generated from doctor availability and existing bookings rather than hardcoded into the interface.

The backend should re-check slot availability before creating an appointment to prevent double booking.

---

## 📄 Customized Health Reports

Patients can select sections such as:

- Personal information
- Blood group
- Height and weight
- Medicines
- Medical history
- Visits
- Reports
- Emergency information

The application can generate a personalized health summary and save the generated PDF to the patient's secure files.

Only the patient's real available data should be included.

---

## 🌐 Deployment on Vercel

MedCare is designed to run as a responsive web application.

Typical Vercel deployment:

```text
GitHub
   ↓
Vercel
   ↓
MedCare Website
   ↓
Supabase + Gemini
```

Before deployment:

1. Add required environment variables to Vercel.
2. Configure Supabase Site URL and allowed redirect URLs.
3. Configure Google OAuth redirect settings.
4. Verify production API URLs.
5. Verify Supabase Storage permissions.
6. Test camera access over HTTPS.
7. Run a production build.

Typical commands:

```bash
npm install
npm run build
```

Use the framework's correct Vercel build/output settings if they differ from these defaults.

---

## 📱 Responsive Design

MedCare is designed to work across:

- Android phones
- iPhones
- Tablets
- Laptops
- Desktop computers

The interface should adapt:

```text
Mobile
  ↓
Compact cards + bottom navigation

Tablet
  ↓
Responsive multi-column layout

Desktop
  ↓
Sidebar + dashboard layout
```

Camera, file upload, authentication, appointments, AI extraction, reports, and other core functions should remain usable across supported screen sizes.

---

## 🔒 Security & Privacy

Because MedCare handles sensitive health information:

- Never commit `.env` files.
- Never expose service-role keys.
- Never expose Gemini secret keys.
- Use Supabase Row Level Security.
- Keep medical files private.
- Use signed URLs.
- Validate file uploads.
- Do not log sensitive patient information unnecessarily.
- Require authentication for private records.
- Require doctor verification before finalizing AI-extracted medical records.

This project should be treated as a prototype unless it has undergone the appropriate security, privacy, compliance, reliability, and clinical validation required for real-world healthcare deployment.

---

## 🚫 No Dummy Production Data

A newly created account should start empty.

For a new patient:

```text
Patients: 0
Appointments: 0
Reports: 0
Visits: 0
Files: 0
```

For a new doctor:

```text
Patients: 0
Appointments: 0
Visits: 0
```

Any demo/test data should be clearly isolated from real user accounts and never mixed with production records.

---

## 🧪 Testing Checklist

Before production deployment, test:

### Authentication

- [ ] Patient email login
- [ ] Patient Google login
- [ ] Doctor email login
- [ ] Doctor Google login
- [ ] Registration
- [ ] Password reset
- [ ] Logout
- [ ] Session persistence
- [ ] Protected routes
- [ ] Role-based routing

### Doctor Workflow

- [ ] Camera permission
- [ ] Real camera
- [ ] Capture Parcha
- [ ] File upload
- [ ] Supabase Storage upload
- [ ] Gemini extraction
- [ ] Review/edit
- [ ] Confirm/save
- [ ] Patient creation
- [ ] Visit history
- [ ] Search
- [ ] Delete patient

### Patient Workflow

- [ ] Profile setup
- [ ] Find Doctor
- [ ] Specialization search
- [ ] Location permission
- [ ] Nearby doctor search
- [ ] Availability
- [ ] Appointment booking
- [ ] Health reports
- [ ] My Files
- [ ] Customized health report
- [ ] PDF generation

### Security

- [ ] New users see no dummy records
- [ ] Patient data isolation
- [ ] Clinic data isolation
- [ ] Private file access
- [ ] RLS policies
- [ ] Secret keys are not exposed

---

## 🏥 Project Vision

MedCare aims to reduce the gap between traditional handwritten healthcare workflows and modern digital records.

Instead of forcing doctors to change how they write prescriptions, MedCare works around their existing workflow:

> **Write the Parcha → Take a photo → Let AI structure the information → Verify → Save.**

The result is a searchable digital record while preserving the original handwritten prescription.

---

## 📌 Status

MedCare is a hackathon/startup prototype focused on demonstrating:

- AI-assisted prescription digitization
- Secure patient and doctor portals
- Digital healthcare records
- Doctor discovery and appointments
- Health document management

Further production deployment should include additional security, privacy, compliance, reliability, and clinical validation appropriate to the intended jurisdiction and use case.

---

## 📄 License

Add the project's chosen license here, for example:

```text
MIT License
```

or replace this section with the license selected for the repository.

---

## 👥 Contributors

Add your team members here:

```text
- Your Name
- Team Member 2
- Team Member 3
- Team Member 4
```

---

## ⭐ MedCare

**From Handwritten to Health Record**
