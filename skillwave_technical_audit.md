# SkillWave — Complete Technical Audit & MERN Migration Blueprint

---

## A. Project Overview

**SkillWave** is an online learning management system (LMS) built as a pure client-side React + Firebase application using Vite as the build tool. It serves three user roles — **Learner**, **Teacher**, and **Admin** — through role-based routing, each with dedicated dashboards and feature sets.

The application is a fully-functional educational platform featuring video courses, coding challenges, live events, an AI summarizer, an AI-powered roadmap generator, and an integrated AI chatbot. All backend logic (authentication, database reads/writes, file storage) is handled entirely through Firebase and two external APIs (Cloudinary for file storage, OpenRouter for AI).

There is **no custom backend** (no Node.js, no Express.js, no REST API). The application calls Firebase directly from the browser.

---

## B. Complete Existing Feature Inventory

### 1. Authentication (Fully Functional)
- **What it does**: Allows users to sign in with email/password and get role-based redirects.
- **User interaction**: Single shared login page for all roles. After login, users are redirected based on their `role` field (`teacher`, `learner`, `admin`).
- **Frontend**: [`Login.jsx`](file:///c:/Users/HP/Desktop/SkillWave/skill-wave-main/skillwave/src/Teacher/TPages/Login.jsx)
- **Firebase**: `signInWithEmailAndPassword` → reads `users/{uid}` from Firestore → stores userData in `localStorage`.
- **Status**: ✅ Fully functional. No registration page (admin creates accounts manually).

### 2. Role-Based Protected Routing (Fully Functional)
- **What it does**: Prevents unauthorized access to role-specific dashboards.
- **Frontend**: Inline `ProtectedRoute` component in [`App.jsx`](file:///c:/Users/HP/Desktop/SkillWave/skill-wave-main/skillwave/src/App.jsx)
- **Data flow**: Reads Firebase `auth.onAuthStateChanged` + `localStorage.userData.role`.
- **Status**: ✅ Functional. Role is stored in `localStorage` (security concern — see Section H).

### 3. Teacher Dashboard (Fully Functional)
- **What it does**: Shows aggregate counts of teacher's videos, challenges, and events, plus a recent activity feed.
- **Frontend**: [`Dashboard.jsx`](file:///c:/Users/HP/Desktop/SkillWave/skill-wave-main/skillwave/src/Teacher/TPages/Dashboard.jsx)
- **Firebase**: Reads `videos`, `challenges`, `events` collections filtered by `user_id == currentUser.uid`.
- **Status**: ✅ Functional. Stats counts, recent activity, and quick-action navigation buttons work.

### 4. Video Management — Teacher (Fully Functional)
#### Upload Video
- **What it does**: Teacher uploads a video file and thumbnail; they are uploaded to Cloudinary. Metadata is saved to Firestore `videos` collection.
- **Frontend**: [`UploadVideo.jsx`](file:///c:/Users/HP/Desktop/SkillWave/skill-wave-main/skillwave/src/Teacher/TPages/UploadVideo.jsx), [`Cloudinary.jsx`](file:///c:/Users/HP/Desktop/SkillWave/skill-wave-main/skillwave/src/Teacher/TUploads/Cloudinary.jsx)
- **Firebase**: `addDoc(collection(db, "videos"), {...})`, reads `categories` and subcollections.
- **Cloudinary**: POST to `https://api.cloudinary.com/v1_1/dakkqbr4g/video/upload`
- **Status**: ✅ Fully functional, including category/subcategory/topic creation.

#### View & Search Videos
- **Frontend**: [`Videos.jsx`](file:///c:/Users/HP/Desktop/SkillWave/skill-wave-main/skillwave/src/Teacher/TPages/Videos.jsx) — shows only the current teacher's videos.
- **Firebase**: `getDocs(collection(db, "videos"))` filtered in JS by `user_id`.
- **Status**: ✅ Functional. Edit and Delete actions work.

#### Video Player — Teacher
- **Frontend**: [`VideoPlayer.jsx`](file:///c:/Users/HP/Desktop/SkillWave/skill-wave-main/skillwave/src/Teacher/TPages/VideoPlayer.jsx) (1056 lines)
- **What it does**: Custom HTML5 video player with custom controls; shows likes, comments (with replies), ratings, and reports from Firestore sub-collections.
- **Firebase reads**: `videos/{id}`, `videos/{id}/comments`, `videos/{id}/comments/{id}/replies`, `videos/{id}/reports`
- **Status**: ✅ Mostly functional. Teacher can view liked users, ratings, reports, and reply to comments. Note: Reply email is hardcoded as `"teacher@example.com"` — a bug.

### 5. Coding Challenges — Teacher (Fully Functional)
- **What it does**: Teacher uploads challenge as PDF (problem statement + solution PDF).
- **Frontend**: [`UploadChallenge.jsx`](file:///c:/Users/HP/Desktop/SkillWave/skill-wave-main/skillwave/src/Teacher/TPages/UploadChallenge.jsx), [`Challenges.jsx`](file:///c:/Users/HP/Desktop/SkillWave/skill-wave-main/skillwave/src/Teacher/TPages/Challenges.jsx)
- **Firebase**: `setDoc(doc(collection(db, "challenges"), id), {...})`
- **Cloudinary**: PDFs uploaded via `uploadPDFToCloudinary()` as raw files.
- **Status**: ✅ Functional. Create, edit, delete challenges.

### 6. Events — Shared (Teacher + Learner) (Fully Functional)
- **What it does**: Teachers host events (Workshop, Conference, Webinar, Hackathon) with thumbnail, PDF, date, mode; Learners can browse and view event details.
- **Frontend**: [`HostEvent.jsx`](file:///c:/Users/HP/Desktop/SkillWave/skill-wave-main/skillwave/src/Teacher/TPages/HostEvent.jsx), [`EventsPage.jsx`](file:///c:/Users/HP/Desktop/SkillWave/skill-wave-main/skillwave/src/Learner/LPages/EventsPage.jsx)
- **Firebase**: CRUD on `events` collection. Thumbnail and PDF uploaded to Cloudinary.
- **Status**: ✅ Functional. Tab-based view: "All Events" (excludes own) and "My Events" (own only).

### 7. Video Learning — Learner (Fully Functional)
#### Browse Videos
- **Frontend**: [`VideosPage.jsx`](file:///c:/Users/HP/Desktop/SkillWave/skill-wave-main/skillwave/src/Learner/LPages/VideosPage.jsx)
- **What it does**: Browse all videos with category/subcategory filtering, search, and preference-based filtering.
- **Firebase**: Reads all `videos`, `categories`, `users/{id}/preferences`.
- **Status**: ✅ Functional.

#### Video Player — Learner
- **Frontend**: [`VideoPlayerPage.jsx`](file:///c:/Users/HP/Desktop/SkillWave/skill-wave-main/skillwave/src/Learner/LPages/VideoPlayerPage.jsx) (45,267 bytes)
- **What it does**: Full video player with like, rating (1-5 stars), comment system, report functionality, related videos, notes, and view count tracking.
- **Firebase**: Reads `videos/{id}`; writes likes to `videos/{id}.like_count`, `videos/{id}.likedUsers[]`; writes ratings to `videos/{id}.total_ratings[]`, `videos/{id}.average_rating`; writes comments to `videos/{id}/comments` subcollection; writes reports to `videos/{id}/reports` subcollection; updates `videos/{id}.views`.
- **TensorFlow.js**: Toxicity model (`@tensorflow-models/toxicity`) used for comment moderation before submission.
- **Status**: ✅ Fully functional, the most complex component in the app.

### 8. Coding Challenges — Learner (Fully Functional)
- **Frontend**: [`ChallengesPage.jsx`](file:///c:/Users/HP/Desktop/SkillWave/skill-wave-main/skillwave/src/Learner/LPages/ChallengesPage.jsx)
- **What it does**: Browse and filter challenges by search/category. View PDF problem statement and PDF solution via Cloudinary URLs. Navigate to code editor with the PDF loaded.
- **Firebase**: `getDocs(collection(db, "challenges"))`.
- **Status**: ✅ Functional.

### 9. Code Editor (Fully Functional)
- **Frontend**: [`MainCodeEditor.jsx`](file:///c:/Users/HP/Desktop/SkillWave/skill-wave-main/skillwave/src/CodeEditor/MainCodeEditor.jsx)
- **What it does**: Monaco-based code editor supporting 6 languages (JavaScript, TypeScript, Python, Java, C#, PHP). Can be launched standalone or with a PDF split-view when opened from a challenge.
- **External API**: Piston API (`https://emkc.org/api/v2/piston/execute`) — POST to execute code remotely.
- **Status**: ✅ Fully functional. Split-view PDF+editor, draggable divider, language switching.

### 10. AI Summarize (Fully Functional)
- **Frontend**: [`AISummarizePage.jsx`](file:///c:/Users/HP/Desktop/SkillWave/skill-wave-main/skillwave/src/Learner/LPages/AISummarizePage.jsx)
- **What it does**: Accepts a topic and generates a Detailed Explanation, Summary, or Key Points using an AI model, with language selector (7 languages) and code/theory filter toggles.
- **External API**: OpenRouter API (`https://openrouter.ai/api/v1/chat/completions`) using `deepseek/deepseek-r1:free` model. **API key is hardcoded in source**.
- **Status**: ✅ Functional. Typing animation simulates streaming output.

### 11. AI Roadmap Generator (Fully Functional)
- **Frontend**: [`RoadmapPage.jsx`](file:///c:/Users/HP/Desktop/SkillWave/skill-wave-main/skillwave/src/Learner/LPages/RoadmapPage.jsx) (1013 lines)
- **What it does**: User enters a learning topic and duration; AI generates a structured roadmap with phases, resources, and time estimates. Steps can be marked complete. Roadmap is auto-saved to Firestore. PDF export via jsPDF.
- **External API**: OpenRouter (DeepSeek R1). **API key hardcoded in source**.
- **Firebase**: CRUD on `roadmaps` collection (save, load, delete per user).
- **Status**: ✅ Functional. Includes fallback mock data if AI call fails.

### 12. AI Chatbot (Fully Functional)
- **Frontend**: [`ChatBot.jsx`](file:///c:/Users/HP/Desktop/SkillWave/skill-wave-main/skillwave/src/chatbot/ChatBot.jsx)
- **What it does**: Floating chat window using OpenRouter + DeepSeek. Dark/light mode toggle. Available in both Teacher and Learner dashboard layouts.
- **External API**: OpenRouter. **API key hardcoded in source**.
- **Status**: ✅ Functional. No conversation history persistence (session only).

### 13. User Preferences — Learner (Fully Functional)
- **Frontend**: [`PreferencesPage.jsx`](file:///c:/Users/HP/Desktop/SkillWave/skill-wave-main/skillwave/src/Learner/LPages/PreferencesPage.jsx)
- **What it does**: Learner sets current skills, desired skills, career goals, and category/subcategory preference. Data saved to `users/{uid}/preferences/userPreferences` in Firestore and also mirrored to `localStorage`.
- **Firebase**: `setDoc` with merge on `users/{uid}/preferences/userPreferences`.
- **Status**: ✅ Functional.

### 14. Admin Panel (Mostly Functional)
#### Admin Dashboard
- **Frontend**: [`Dashboard.jsx`](file:///c:/Users/HP/Desktop/SkillWave/skill-wave-main/skillwave/src/Admin/admin/components/Dashboard.jsx)
- **What it does**: Shows platform-wide stats (total users, videos, challenges, events), analytics charts using Recharts, and recent activity feed. Admin-only metrics.
- **Firebase**: Reads all `users`, `videos`, `challenges`, `events` collections.

#### User Management
- **Frontend**: [`UserManagement.jsx`](file:///c:/Users/HP/Desktop/SkillWave/skill-wave-main/skillwave/src/Admin/admin/components/UserManagement.jsx), [`AddUserForm.jsx`](file:///c:/Users/HP/Desktop/SkillWave/skill-wave-main/skillwave/src/Admin/components/users/AddUserForm.jsx)
- **What it does**: Admin can view, search, filter, and delete users. `AddUserForm.jsx` (30,795 bytes) allows admin to create new users by calling Firebase Auth's `createUserWithEmailAndPassword` and saving profile to Firestore.
- **Firebase**: CRUD on `users` collection.

#### Content Management
- **Frontend**: [`ContentManagement.jsx`](file:///c:/Users/HP/Desktop/SkillWave/skill-wave-main/skillwave/src/Admin/admin/components/ContentManagement.jsx)
- **What it does**: Admin can browse, filter, and delete videos, challenges, and events across all teachers. Navigate to edit forms reusing Teacher upload components.
- **Firebase**: Reads and deletes from `videos`, `challenges`, `events`.

#### Analytics
- **Frontend**: [`Analytics.jsx`](file:///c:/Users/HP/Desktop/SkillWave/skill-wave-main/skillwave/src/Admin/admin/components/Analytics.jsx)
- **What it does**: Visual charts showing content distribution (Recharts Pie/Bar) for videos, challenges, events.
- **Status**: ⚠️ Partially implemented — charts use computed data, but some analytics may show placeholder data.

#### Support & Settings
- **Frontend**: [`Support.jsx`](file:///c:/Users/HP/Desktop/SkillWave/skill-wave-main/skillwave/src/Admin/admin/components/Support.jsx), [`Settings.jsx`](file:///c:/Users/HP/Desktop/SkillWave/skill-wave-main/skillwave/src/Admin/admin/components/Settings.jsx)
- **Status**: ⚠️ Partially implemented — Support shows static FAQ/contact info. Settings has UI toggles but limited save logic.

### 15. Landing Pages (Fully Functional)
- **Frontend**: [`LHome.jsx`](file:///c:/Users/HP/Desktop/SkillWave/skill-wave-main/skillwave/src/Landing/LHome.jsx), [`LAbout.jsx`](file:///c:/Users/HP/Desktop/SkillWave/skill-wave-main/skillwave/src/Landing/LAbout.jsx), [`LContact.jsx`](file:///c:/Users/HP/Desktop/SkillWave/skill-wave-main/skillwave/src/Landing/LContact.jsx)
- **Status**: ✅ Functional. Marketing pages with hero, features, partner logos, privacy/terms modals.

---

## C. Current Technology Stack

| Layer | Technology | Details |
|-------|-----------|---------|
| **Build Tool** | Vite 6.2 | `vite.config.js` — React + Tailwind CSS v4 plugin |
| **Frontend Framework** | React 19 | Functional components, Hooks throughout |
| **Routing** | React Router DOM v7 | BrowserRouter, nested routes, Outlet |
| **Styling** | Tailwind CSS v4 | Configured via `@tailwindcss/vite` plugin (not config file) |
| **Authentication** | Firebase Auth v11 | Email/password only |
| **Database** | Firestore (Firebase) | NoSQL document store |
| **File Storage** | Cloudinary | Videos, thumbnails, PDFs via unsigned upload preset |
| **State Management** | React `useState`/`useEffect` | No Redux, no Zustand, no Context beyond Firebase |
| **AI APIs** | OpenRouter (DeepSeek R1) | AI summarizer, roadmap, chatbot |
| **Code Execution** | Piston API (emkc.org) | Multi-language code runner |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) | VS Code-based in-browser editor |
| **Comment Moderation** | TensorFlow.js Toxicity Model | Client-side toxicity detection |
| **Animations** | Framer Motion v12 | Page transitions, micro-animations |
| **UI Components** | Radix UI (Select, Switch, Slot) + Lucide Icons + Chakra UI v3 | Mixed |
| **Charts** | Recharts v2 | Admin analytics |
| **PDF Export** | jsPDF + jspdf-autotable | Roadmap PDF download |
| **HTTP Client** | Axios v1.8 | Cloudinary uploads, OpenRouter calls |
| **Date Utilities** | date-fns v4 | Timestamp formatting |
| **Responsive Queries** | react-responsive v10 | Mobile breakpoints |
| **File Uploads** | react-dropzone v14 | Drag-and-drop for video/image/PDF |
| **CSS Utilities** | tailwind-merge + class-variance-authority | Conditional Tailwind class management |
| **Firebase Analytics** | Firebase Analytics | Conditionally initialized |
| **Dev Dependencies** | ESLint v9, Vite | Linting, bundling |

---

## D. Complete Folder and File Structure

```
skillwave/                              ← Project root
├── index.html                          ← Vite entry HTML
├── vite.config.js                      ← Vite + React + Tailwind CSS v4
├── package.json                        ← 20 dependencies
├── eslint.config.js                    ← ESLint 9 flat config
├── README.md                           ← Default Vite README (no project docs)
└── src/
    ├── main.jsx                        ← ReactDOM.createRoot entry
    ├── App.jsx                         ← Router, all routes, ProtectedRoute
    ├── App.css                         ← Minimal global CSS
    ├── index.css                       ← Minimal CSS (22 bytes)
    ├── Firebase.jsx                    ← Firebase init, FirebaseProvider context
    ├── api.js                          ← Piston API (code execution)
    ├── constants.js                    ← Language versions + starter snippets
    ├── theme.js                        ← (minimal, unused)
    ├── NotFound.jsx                    ← 404 page
    ├── ProtectedRoute.jsx              ← (file exists but unused — inline in App.jsx)
    │
    ├── Landing/                        ← Public marketing pages
    │   ├── LHome.jsx                   ← Hero, features, CTA, footer
    │   ├── LAbout.jsx                  ← Team, about content
    │   ├── LContact.jsx                ← Contact form
    │   └── LHomeNav.jsx                ← Landing navigation bar
    │
    ├── Teacher/                        ← Teacher module
    │   ├── TComponents/
    │   │   ├── Layouts/
    │   │   │   └── Dashboard-Layout.jsx   ← Collapsible sidebar, header, ChatBot toggle
    │   │   └── UI/
    │   │       ├── Button.jsx
    │   │       ├── Card.jsx
    │   │       ├── Progress.jsx
    │   │       └── select.jsx
    │   ├── TLib/
    │   │   ├── firestoreSetup.js       ← Category initialization helper
    │   │   └── utils.js                ← cn() classnames utility
    │   ├── TPages/
    │   │   ├── Login.jsx               ← Shared login page
    │   │   ├── Dashboard.jsx           ← Stats + recent activity
    │   │   ├── Videos.jsx              ← Teacher's video list
    │   │   ├── VideoPlayer.jsx         ← Video player + comments/likes/reports view
    │   │   ├── UploadVideo.jsx         ← Upload/edit video form
    │   │   ├── Challenges.jsx          ← Challenge list
    │   │   ├── UploadChallenge.jsx     ← Upload/edit challenge form
    │   │   ├── HostEvent.jsx           ← Create/edit event form
    │   │   └── EditVideo.jsx           ← (empty file — 0 bytes)
    │   └── TUploads/
    │       └── Cloudinary.jsx          ← Cloudinary upload functions (video, image, PDF)
    │
    ├── Learner/                        ← Learner module
    │   ├── LComponents/
    │   │   ├── Layouts/
    │   │   │   └── DashboardLayout.jsx ← Learner sidebar, header, ChatBot toggle
    │   │   └── UI/
    │   │       ├── Button.jsx
    │   │       ├── card.jsx
    │   │       ├── select.jsx
    │   │       ├── slider.jsx
    │   │       └── switch.jsx
    │   ├── LLib/
    │   │   └── utils.js                ← cn() classnames utility
    │   ├── Constant.js                 ← (empty or minimal)
    │   └── LPages/
    │       ├── VideosPage.jsx          ← Browse/filter all videos
    │       ├── VideoPlayerPage.jsx     ← Full learner video player (likes, comments, etc.)
    │       ├── ChallengesPage.jsx      ← Browse challenges
    │       ├── SolveChallengePage.jsx  ← (file exists, may be incomplete)
    │       ├── PreferencesPage.jsx     ← Learning preferences form
    │       ├── AISummarizePage.jsx     ← AI topic summarizer
    │       ├── RoadmapPage.jsx         ← AI learning roadmap generator
    │       ├── EventsPage.jsx          ← Browse events (shared with teacher)
    │       ├── HostEventPage.jsx       ← (may be a wrapper or unused)
    │       ├── DashboardPage.jsx       ← Learner dashboard (may be minimal)
    │       └── EditVideoPage.jsx       ← (may be unused)
    │
    ├── Admin/                          ← Admin module
    │   ├── admin/
    │   │   ├── Admin.jsx               ← Admin layout (sidebar + children)
    │   │   ├── App.jsx                 ← (small, may be unused)
    │   │   └── components/
    │   │       ├── Dashboard.jsx       ← Platform stats + charts
    │   │       ├── UserManagement.jsx  ← User list, search, delete
    │   │       ├── ContentManagement.jsx ← Content moderation
    │   │       ├── Analytics.jsx       ← Charts/graphs
    │   │       ├── Support.jsx         ← FAQ + contact
    │   │       ├── Settings.jsx        ← Platform settings UI
    │   │       └── Profile.jsx         ← Admin profile view/edit
    │   └── components/
    │       ├── ui/
    │       │   ├── Button.jsx          ← Duplicate of Teacher's
    │       │   └── card.jsx            ← Duplicate of Teacher's
    │       └── users/
    │           └── AddUserForm.jsx     ← Admin user creation (30KB!)
    │
    ├── CodeEditor/                     ← Standalone code editor module
    │   ├── AppCodeEditor.jsx/css       ← Wrapper (minimal)
    │   ├── MainCodeEditor.jsx          ← Full Monaco editor + Piston API
    │   ├── CodeEditor.jsx/css          ← Monaco component wrapper
    │   ├── LanguageSelector.jsx/css    ← Language picker
    │   ├── Output.jsx/css              ← Output panel
    │   └── code.css                    ← Minimal
    │
    └── chatbot/
        └── ChatBot.jsx                 ← AI chatbot overlay (OpenRouter + DeepSeek)

public/
    ├── Chatbot_Chat.jpg                ← Chatbot avatar image
    ├── Divyesh.jpeg, Harshil.jpeg, Sneha.jpeg  ← Team member photos
    ├── Illustration.png                ← Hero image
    ├── about.png                       ← About page image
    └── store-logo.png                  ← Partner logo
```

---

## E. Existing Application Architecture

### Architecture Pattern
**Client-Side Rendered (CSR) + Firebase BaaS**

```
Browser (React SPA)
    │
    ├─► Firebase Auth    ← email/password auth
    ├─► Firestore DB     ← all CRUD operations (called directly from browser)
    ├─► Cloudinary CDN   ← file uploads (unsigned preset, called from browser)
    ├─► OpenRouter AI    ← chat, summarize, roadmap (API key exposed in browser)
    └─► Piston API       ← code execution (public, no auth required)
```

### Request Flow (Example: Video Upload)
1. Teacher fills UploadVideo form → selects video file
2. React calls `uploadVideoToCloudinary(file)` → POST to Cloudinary API (browser → Cloudinary)
3. Cloudinary returns `secure_url`
4. React calls `addDoc(collection(db, "videos"), {...})` → Firestore (browser → Firebase)
5. Document created with Cloudinary URL stored in `VideoURL` field

### Authentication Flow
1. `signInWithEmailAndPassword(auth, email, password)` via Firebase SDK
2. Firebase returns `userCredential`
3. `getDoc(doc(db, "users", uid))` fetches user metadata including `role`
4. User data stored in `localStorage.userData`
5. `FirebaseContext` stores `userId` via `onAuthStateChanged`
6. `ProtectedRoute` reads `auth.onAuthStateChanged` + `localStorage.userData.role` for access control

---

## F. Database and Authentication Analysis

### Firestore Collections

| Collection | Key Fields | Purpose |
|-----------|-----------|---------|
| `users` | `user_id`, `name`, `email`, `role`, `profileImage`, `phone` | User profiles (all roles) |
| `videos` | `video_title`, `video_description`, `VideoURL`, `ThumbnailURL`, `user_id`, `category`, `subcategory`, `topic`, `duration`, `upload_date`, `status`, `like_count`, `average_rating`, `total_ratings[]`, `views`, `report_count`, `likedUsers[]` | All course videos |
| `challenges` | `content_id`, `content_title`, `content_description`, `user_id`, `problemStatementURL`, `solutionURL`, `upload_date`, `status` | Coding challenges (PDF-based) |
| `events` | `event_title`, `event_description`, `thumbnailURL`, `pdfURL`, `event_date`, `registrationClosingDate`, `organizedBy`, `mode`, `location`, `event_type`, `user_id`, `upload_date` | Events/workshops |
| `categories` | `name` | Top-level content categories |
| `categories/{id}/subcategories` | `name`, `topics[]` | Subcategories with topic tags |
| `roadmaps` | `userId`, `userEmail`, `userName`, `roadmap{}`, `title`, `topic`, `duration`, `progress`, `createdAt`, `updatedAt` | AI-generated roadmaps per user |

### Subcollections

| Parent | Subcollection | Key Fields |
|--------|--------------|-----------|
| `videos/{id}` | `comments` | `email`, `comment`, `timestamp`, `hasReplies`, `likes[]` |
| `videos/{id}/comments/{id}` | `replies` | `email`, `reply`, `timestamp`, `isTeacher` |
| `videos/{id}` | `reports` | `email`, `reason`, `timestamp` |
| `users/{id}` | `preferences/userPreferences` | `category`, `subcategory`, `currentSkills[]`, `wantToLearn[]`, `futureGoals` |

### Authentication Configuration
- **Provider**: Email/Password only (no Google, no social login)
- **User creation**: Only admin can create users (via `AddUserForm.jsx` → `createUserWithEmailAndPassword`)
- **Role storage**: In Firestore `users` document + mirrored to `localStorage`
- **Firebase credentials**: Hardcoded in `Firebase.jsx` (API key, project ID — exposed in bundle)

### Security Concerns
1. Firebase API keys are hardcoded in `Firebase.jsx` — standard for Firebase web but Firestore Security Rules must be properly configured (rules not visible in source).
2. Role-based access is enforced **client-side only** via `localStorage.userData.role` — an attacker could modify localStorage.
3. OpenRouter API keys hardcoded in source code (3 different keys across files) — severe security issue.
4. Cloudinary upload preset `demo-upload` is unsigned — anyone can upload to this cloud account.
5. No rate limiting on any operations.

---

## G. Feature-wise Frontend and Backend Data Flow

### Video Like Flow (Learner)
```
User clicks "Like" on VideoPlayerPage
→ Check localStorage if user already liked (video_id in likedVideos[])
→ updateDoc(doc(db, "videos", id), { like_count: increment(1), likedUsers: arrayUnion({email}) })
→ Update localStorage
→ Re-render like count
```

### Comment + Toxicity Check Flow
```
User submits comment
→ TensorFlow.js Toxicity model loaded (client-side ML)
→ classify(commentText)
→ If toxic → block + show warning
→ If safe → addDoc(collection(db, "videos", id, "comments"), {...})
→ updateDoc video.comments_count
```

### AI Roadmap Generation Flow
```
User enters topic + selects duration
→ POST to OpenRouter API (DeepSeek R1) with structured JSON prompt
→ Parse JSON response
→ Set roadmap state
→ Auto-trigger saveRoadmapToFirestore()
→ setDoc(doc(db, 'roadmaps', auto-id), {...})
→ loadUserRoadmaps() to refresh saved list
```

### Code Execution Flow
```
User writes code in Monaco editor
→ Click "Run Code"
→ POST to https://emkc.org/api/v2/piston/execute
→ { language, version, files: [{ content }] }
→ Display result.output or result.stderr
```

---

## H. Code Quality and Technical Issues

### ✅ Strengths
1. **Consistent functional components** with Hooks throughout
2. **Good loading states** in most pages (skeleton loaders, spinners)
3. **Responsive design** via Tailwind and `react-responsive`
4. **Rich animations** via Framer Motion — polished UX
5. **Good error handling** in most async operations (`try/catch`)
6. **Clean route structure** in `App.jsx` — role-based routing is clear
7. **TensorFlow.js for comment moderation** — innovative feature

### ⚠️ Issues and Concerns

| Issue | Severity | Location |
|-------|----------|---------|
| API keys hardcoded in source | 🔴 Critical | `ChatBot.jsx`, `AISummarizePage.jsx`, `RoadmapPage.jsx`, `Cloudinary.jsx` |
| Teacher reply email hardcoded as `"teacher@example.com"` | 🔴 High | `VideoPlayer.jsx:355` |
| Role enforcement is client-side only | 🔴 High | `App.jsx` ProtectedRoute |
| No `.env` file — all config inline | 🔴 High | `Firebase.jsx`, `Cloudinary.jsx` |
| `EditVideo.jsx` is empty (0 bytes) | 🟡 Medium | `TPages/EditVideo.jsx` |
| `ProtectedRoute.jsx` file exists but is unused | 🟡 Medium | `src/ProtectedRoute.jsx` |
| Duplicate UI components across modules | 🟡 Medium | `Button.jsx`, `Card.jsx` duplicated in Teacher, Learner, Admin |
| `window.location.reload()` used for state refresh instead of React state | 🟡 Medium | `Videos.jsx:67`, `EventsPage.jsx:44` |
| No `useMemo`/`useCallback` optimization | 🟡 Medium | `VideoPlayerPage.jsx`, `RoadmapPage.jsx` |
| `utils.js` duplicated in `TLib` and `LLib` | 🟡 Low | Both contain same `cn()` function |
| README is default Vite template | 🟢 Low | `README.md` |
| `theme.js` appears unused | 🟢 Low | `src/theme.js` |
| Commented-out `SkillCodeZ` route | 🟢 Low | `App.jsx:178` |
| Fake progress bar in `UploadChallenge.jsx` | 🟢 Low | Uses `setInterval` not real upload progress |
| Teacher Dashboard trend values hardcoded | 🟢 Low | `Dashboard.jsx:194` (+12.5%) |
| Login success navigation uses wrong paths | 🟡 Medium | `Login.jsx:49` → navigates to `/dashboard` not `/teacher/dashboard` |

### Component Sizes (Concern for Maintainability)
- `VideoPlayerPage.jsx` — 45,267 bytes (massive, should be split)
- `RoadmapPage.jsx` — 45,960 bytes (massive, should be split)
- `AddUserForm.jsx` — 30,795 bytes (very large)
- `UploadVideo.jsx` — 31,392 bytes (large)

---

## I. Existing Features That Can Be Retained

| Feature | Action | Rationale |
|---------|--------|-----------|
| React component structure | ✅ Retain & migrate | Well-organized, functional components |
| Tailwind CSS styling | ✅ Retain | Required by WMD |
| Framer Motion animations | ✅ Retain | Enhances UX significantly |
| Monaco Code Editor | ✅ Retain | High-quality editor |
| Piston API integration | ✅ Retain | Third-party API, no changes needed |
| TensorFlow toxicity detection | ✅ Retain | Unique feature, satisfies third-party API requirement |
| OpenRouter AI features | ✅ Retain | Move key to backend |
| Landing pages (LHome, LAbout, LContact) | ✅ Retain | Minimal changes needed |
| All UI/UX designs | ✅ Retain | Polished, modern design |
| React Router structure | ✅ Retain & update | Update to work with JWT auth |
| Cloudinary integration | ✅ Retain (move to backend) | Move signed uploads to server |
| Recharts analytics | ✅ Retain | Good admin charts |
| jsPDF export | ✅ Retain | Useful for roadmap download |
| date-fns, lucide-react, framer-motion | ✅ Retain | Useful utilities |

---

## J. Features Requiring Modification or Replacement

| Current (Firebase) | Replacement (MERN) |
|-------------------|--------------------|
| Firebase Auth (`signInWithEmailAndPassword`) | Custom Express.js JWT login endpoint |
| Firestore `users` collection | MongoDB `users` collection + Mongoose |
| Firestore `videos` collection | MongoDB `videos` collection |
| Firestore `challenges` collection | MongoDB `challenges` collection |
| Firestore `events` collection | MongoDB `events` collection |
| Firestore `categories` collection | MongoDB `categories` collection |
| Firestore `roadmaps` collection | MongoDB `roadmaps` collection |
| Firestore `videos/{id}/comments` subcollection | MongoDB `comments` collection (with `videoId` reference) |
| Firestore `videos/{id}/reports` subcollection | MongoDB `reports` collection |
| Firestore `users/{id}/preferences` | MongoDB embedded or separate `preferences` collection |
| `onAuthStateChanged` listener | Axios interceptor + JWT stored in `localStorage`/`httpOnly` cookie |
| `FirebaseProvider` Context | Custom `AuthContext` + Axios instance |
| Client-side Cloudinary unsigned uploads | Backend signed Cloudinary uploads via Express route |
| Hardcoded API keys in frontend | Environment variables in Express `.env` |
| Client-side role enforcement | Server-side JWT middleware role check |
| `ProtectedRoute` reading localStorage role | `ProtectedRoute` validating JWT via API call |

---

## K. New Requirements and Missing Functionality

| Requirement | Status | Notes |
|-------------|--------|-------|
| Node.js + Express.js backend | ❌ Missing | Entire backend needs to be built |
| RESTful API (GET/POST/PUT/PATCH/DELETE) | ❌ Missing | All endpoints need implementation |
| JWT-based authentication | ❌ Missing | Replace Firebase Auth |
| Protected routes (server-side) | ❌ Missing | Express middleware needed |
| Express middleware (`express.json`, CORS, custom) | ❌ Missing | |
| MongoDB + Mongoose schemas | ❌ Missing | Replace Firestore |
| `.env` file with environment variables | ❌ Missing | For DB URI, JWT secret, Cloudinary keys, AI keys |
| `.gitignore` including `.env` | ❌ Missing | No `.gitignore` found |
| Postman API testing | ❌ Missing | No tests exist |
| Proper README with API docs | ❌ Missing | Current README is Vite template |
| User registration flow | ❌ Missing | Only admin can currently create users |
| Password reset flow | ❌ Missing | Commented-out "Forgot password" link |
| Axios integration on frontend | ⚠️ Partial | Axios is imported but only used for Cloudinary/OpenRouter, not for own backend |
| Fetch API usage | ❌ Missing | Only in `ChatBot.jsx` for OpenRouter |

---

## L. Proposed MERN Architecture

### Overall Architecture

```
Client (React + Vite)
    │
    ├─► Express.js API (Node.js)
    │       ├── /api/auth        ← login, register, verify
    │       ├── /api/users       ← user CRUD
    │       ├── /api/videos      ← video CRUD + likes/ratings/comments
    │       ├── /api/challenges  ← challenge CRUD
    │       ├── /api/events      ← event CRUD
    │       ├── /api/categories  ← category/subcategory CRUD
    │       ├── /api/roadmaps    ← roadmap CRUD
    │       ├── /api/ai          ← proxy for OpenRouter (keeps key server-side)
    │       └── /api/upload      ← signed Cloudinary upload endpoint
    │               │
    │               ├── MongoDB (Mongoose)
    │               ├── Cloudinary (signed uploads)
    │               └── OpenRouter AI (proxied)
    │
    └── Piston API (direct from client, public)
    └── TensorFlow.js (client-side, no key needed)
```

### Recommended Frontend Folder Structure

```
frontend/
├── public/
├── src/
│   ├── api/                      ← Axios instance + API helpers
│   │   ├── axiosInstance.js      ← Base URL, interceptors, JWT header
│   │   ├── authAPI.js
│   │   ├── videosAPI.js
│   │   ├── challengesAPI.js
│   │   ├── eventsAPI.js
│   │   ├── categoriesAPI.js
│   │   ├── roadmapsAPI.js
│   │   └── aiAPI.js
│   ├── context/
│   │   └── AuthContext.jsx       ← Replace FirebaseContext
│   ├── components/               ← Shared reusable components
│   │   ├── ui/                   ← Button, Card, Select, Switch, etc.
│   │   ├── layouts/
│   │   │   ├── TeacherLayout.jsx
│   │   │   ├── LearnerLayout.jsx
│   │   │   └── AdminLayout.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── ChatBot.jsx
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.jsx
│   │   ├── landing/
│   │   │   ├── HomePage.jsx
│   │   │   ├── AboutPage.jsx
│   │   │   └── ContactPage.jsx
│   │   ├── teacher/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── VideosPage.jsx
│   │   │   ├── VideoPlayerPage.jsx
│   │   │   ├── UploadVideoPage.jsx
│   │   │   ├── ChallengesPage.jsx
│   │   │   ├── UploadChallengePage.jsx
│   │   │   ├── EventsPage.jsx
│   │   │   └── HostEventPage.jsx
│   │   ├── learner/
│   │   │   ├── VideosPage.jsx
│   │   │   ├── VideoPlayerPage.jsx
│   │   │   ├── ChallengesPage.jsx
│   │   │   ├── PreferencesPage.jsx
│   │   │   ├── AISummarizePage.jsx
│   │   │   ├── RoadmapPage.jsx
│   │   │   ├── EventsPage.jsx
│   │   │   └── CodeEditorPage.jsx
│   │   └── admin/
│   │       ├── DashboardPage.jsx
│   │       ├── UserManagementPage.jsx
│   │       ├── ContentManagementPage.jsx
│   │       ├── AnalyticsPage.jsx
│   │       ├── SupportPage.jsx
│   │       └── SettingsPage.jsx
│   ├── hooks/                    ← Custom hooks
│   │   ├── useAuth.js
│   │   ├── useVideos.js
│   │   └── useCategories.js
│   ├── utils/
│   │   ├── codeExecution.js      ← Piston API calls
│   │   └── helpers.js            ← cn(), formatDuration, etc.
│   ├── constants/
│   │   └── languages.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env                          ← VITE_API_BASE_URL=http://localhost:5000
└── package.json
```

### Recommended Backend Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js                 ← MongoDB connection (Mongoose)
│   │   └── cloudinary.js         ← Cloudinary configuration
│   ├── middleware/
│   │   ├── auth.middleware.js    ← JWT verification middleware
│   │   ├── role.middleware.js    ← Role-based access (teacher, learner, admin)
│   │   ├── upload.middleware.js  ← Multer for file uploads
│   │   └── error.middleware.js   ← Global error handler
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Video.model.js
│   │   ├── Challenge.model.js
│   │   ├── Event.model.js
│   │   ├── Category.model.js
│   │   ├── Roadmap.model.js
│   │   ├── Comment.model.js
│   │   └── Report.model.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── video.controller.js
│   │   ├── challenge.controller.js
│   │   ├── event.controller.js
│   │   ├── category.controller.js
│   │   ├── roadmap.controller.js
│   │   ├── comment.controller.js
│   │   └── ai.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── video.routes.js
│   │   ├── challenge.routes.js
│   │   ├── event.routes.js
│   │   ├── category.routes.js
│   │   ├── roadmap.routes.js
│   │   ├── comment.routes.js
│   │   └── ai.routes.js
│   └── app.js                    ← Express app setup
├── server.js                     ← Entry point
├── .env                          ← Secrets
├── .gitignore                    ← Includes .env
└── package.json
```

---

## M. Recommended MongoDB Schemas

```js
// User
{
  _id: ObjectId,
  name: String,
  email: { type: String, unique: true },
  password: String,          // bcrypt hashed
  role: { type: String, enum: ['learner', 'teacher', 'admin'] },
  profileImage: String,
  phone: String,
  preferences: {
    category: String,
    subcategory: String,
    currentSkills: [String],
    wantToLearn: [String],
    futureGoals: String,
  },
  createdAt: Date, updatedAt: Date
}

// Video
{
  _id: ObjectId,
  title: String,
  description: String,
  videoUrl: String,           // Cloudinary URL
  thumbnailUrl: String,       // Cloudinary URL
  teacherId: { type: ObjectId, ref: 'User' },
  category: { type: ObjectId, ref: 'Category' },
  subcategoryId: String,
  topic: String,
  duration: String,
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  likeCount: { type: Number, default: 0 },
  likedBy: [{ type: ObjectId, ref: 'User' }],
  averageRating: { type: Number, default: 0 },
  ratings: [{ userId: ObjectId, rating: Number, createdAt: Date }],
  viewCount: { type: Number, default: 0 },
  reportCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  uploadedAt: Date, updatedAt: Date
}

// Comment
{
  _id: ObjectId,
  videoId: { type: ObjectId, ref: 'Video' },
  userId: { type: ObjectId, ref: 'User' },
  email: String,
  content: String,
  isTeacherReply: Boolean,
  parentCommentId: { type: ObjectId, ref: 'Comment', default: null },
  createdAt: Date
}

// Challenge
{
  _id: ObjectId,
  title: String,
  description: String,
  teacherId: { type: ObjectId, ref: 'User' },
  problemStatementUrl: String,  // Cloudinary PDF URL
  solutionUrl: String,          // Cloudinary PDF URL
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  uploadedAt: Date, updatedAt: Date
}

// Event
{
  _id: ObjectId,
  title: String,
  description: String,
  organizerId: { type: ObjectId, ref: 'User' },
  organizedBy: String,
  thumbnailUrl: String,
  pdfUrl: String,
  eventDate: Date,
  registrationClosingDate: Date,
  mode: { type: String, enum: ['Online', 'Offline'] },
  location: String,
  eventType: { type: String, enum: ['Workshop', 'Conference', 'Webinar', 'Hackathon', 'General'] },
  status: { type: String, default: 'Active' },
  createdAt: Date, updatedAt: Date
}

// Category
{
  _id: ObjectId,
  name: String,
  subcategories: [{
    _id: ObjectId,
    name: String,
    topics: [String]
  }]
}

// Roadmap
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User' },
  title: String,
  topic: String,
  duration: String,
  progress: { type: Number, default: 0 },
  roadmapData: Mixed,   // The full AI-generated JSON
  createdAt: Date, updatedAt: Date
}

// Report
{
  _id: ObjectId,
  videoId: { type: ObjectId, ref: 'Video' },
  userId: { type: ObjectId, ref: 'User' },
  email: String,
  reason: String,
  createdAt: Date
}
```

---

## N. Proposed REST API Endpoint List

### Auth Routes (`/api/auth`)
| Method | Endpoint | Access | Description |
|--------|---------|--------|-------------|
| POST | `/api/auth/login` | Public | Login, returns JWT |
| POST | `/api/auth/register` | Admin only | Create user account |
| GET | `/api/auth/me` | Authenticated | Get current user profile |
| POST | `/api/auth/logout` | Authenticated | Invalidate token |

### User Routes (`/api/users`)
| Method | Endpoint | Access | Description |
|--------|---------|--------|-------------|
| GET | `/api/users` | Admin | Get all users (with pagination) |
| GET | `/api/users/:id` | Admin/Self | Get user by ID |
| PUT | `/api/users/:id` | Admin/Self | Update user profile |
| DELETE | `/api/users/:id` | Admin | Delete user |
| PUT | `/api/users/:id/preferences` | Learner/Self | Update learning preferences |

### Video Routes (`/api/videos`)
| Method | Endpoint | Access | Description |
|--------|---------|--------|-------------|
| GET | `/api/videos` | Authenticated | List all videos (filtered by role, with search/pagination) |
| GET | `/api/videos/:id` | Authenticated | Get single video + increment view |
| POST | `/api/videos` | Teacher | Create video (Cloudinary URL in body) |
| PUT | `/api/videos/:id` | Teacher (owner) | Update video metadata |
| DELETE | `/api/videos/:id` | Teacher (owner) / Admin | Delete video |
| POST | `/api/videos/:id/like` | Learner | Like/unlike video |
| POST | `/api/videos/:id/rate` | Learner | Submit rating |
| POST | `/api/videos/:id/report` | Learner | Report video |
| GET | `/api/videos/:id/comments` | Authenticated | Get comments (paginated) |
| POST | `/api/videos/:id/comments` | Authenticated | Post comment |
| POST | `/api/videos/:id/comments/:commentId/replies` | Authenticated | Reply to comment |
| DELETE | `/api/videos/:id/comments/:commentId` | Admin | Delete comment |

### Challenge Routes (`/api/challenges`)
| Method | Endpoint | Access | Description |
|--------|---------|--------|-------------|
| GET | `/api/challenges` | Authenticated | List all challenges |
| GET | `/api/challenges/:id` | Authenticated | Get challenge details |
| POST | `/api/challenges` | Teacher | Create challenge |
| PUT | `/api/challenges/:id` | Teacher (owner) | Update challenge |
| DELETE | `/api/challenges/:id` | Teacher (owner) / Admin | Delete challenge |

### Event Routes (`/api/events`)
| Method | Endpoint | Access | Description |
|--------|---------|--------|-------------|
| GET | `/api/events` | Authenticated | List all events |
| GET | `/api/events/:id` | Authenticated | Get event details |
| POST | `/api/events` | Teacher | Create event |
| PUT | `/api/events/:id` | Teacher (owner) | Update event |
| DELETE | `/api/events/:id` | Teacher (owner) / Admin | Delete event |

### Category Routes (`/api/categories`)
| Method | Endpoint | Access | Description |
|--------|---------|--------|-------------|
| GET | `/api/categories` | Authenticated | List all categories |
| POST | `/api/categories` | Teacher/Admin | Create category |
| POST | `/api/categories/:id/subcategories` | Teacher/Admin | Add subcategory |
| PATCH | `/api/categories/:id/subcategories/:subId/topics` | Teacher/Admin | Add topic |

### Roadmap Routes (`/api/roadmaps`)
| Method | Endpoint | Access | Description |
|--------|---------|--------|-------------|
| GET | `/api/roadmaps` | Learner | Get current user's roadmaps |
| POST | `/api/roadmaps` | Learner | Save roadmap |
| PUT | `/api/roadmaps/:id` | Learner (owner) | Update roadmap (progress) |
| DELETE | `/api/roadmaps/:id` | Learner (owner) | Delete roadmap |

### AI Proxy Routes (`/api/ai`)
| Method | Endpoint | Access | Description |
|--------|---------|--------|-------------|
| POST | `/api/ai/summarize` | Authenticated | Proxy OpenRouter summarize |
| POST | `/api/ai/roadmap` | Authenticated | Proxy OpenRouter roadmap generation |
| POST | `/api/ai/chat` | Authenticated | Proxy OpenRouter chatbot |

### Upload Routes (`/api/upload`)
| Method | Endpoint | Access | Description |
|--------|---------|--------|-------------|
| POST | `/api/upload/video` | Teacher | Signed upload → Cloudinary |
| POST | `/api/upload/image` | Teacher/Admin | Signed upload → Cloudinary |
| POST | `/api/upload/pdf` | Teacher | Signed upload → Cloudinary |

---

## O. Proposed Implementation Roadmap

### Phase 1 — Backend Foundation (1 week)
1. Set up Node.js + Express project structure
2. Connect MongoDB via Mongoose
3. Create all Mongoose models
4. Implement auth controller (login + JWT)
5. Create auth middleware, role middleware, error middleware
6. Test auth endpoints in Postman

### Phase 2 — Core Backend APIs (1 week)
1. Users CRUD endpoints
2. Categories endpoints
3. Videos CRUD endpoints (without file upload)
4. Challenges CRUD endpoints (without file upload)
5. Events CRUD endpoints (without file upload)
6. Comment/Rating/Like/Report sub-routes for videos
7. Test all endpoints in Postman

### Phase 3 — File Upload & AI Proxy (3 days)
1. Cloudinary signed upload endpoint (multer + cloudinary-node SDK)
2. OpenRouter proxy endpoints (summarize, roadmap, chat)
3. Roadmap CRUD endpoints

### Phase 4 — Frontend Migration (2 weeks)
1. Remove all Firebase imports
2. Create Axios instance with JWT interceptor
3. Create AuthContext replacing FirebaseContext
4. Update LoginPage to use `/api/auth/login`
5. Update ProtectedRoute to use JWT validation
6. Migrate each page's data fetching calls from Firestore to Axios
7. Update file upload flows to use backend signed upload endpoint
8. Update AI features to use backend proxy endpoints
9. Test all flows end-to-end

### Phase 5 — Polish & Documentation (3 days)
1. Write README.md with installation, structure, API docs
2. Add `.env.example`
3. Add `.gitignore`
4. Final Postman collection with success/failure/auth tests
5. Deploy backend (Railway/Render) + frontend (Vercel/Netlify)

---

## P. Recommended Two-Member Work Distribution

### Team Member 1 — Backend + Integration
- Express server setup, middleware, error handling
- All Mongoose models
- Auth routes + JWT
- Videos, Comments, Reports, Ratings routes
- Challenges, Events routes
- Cloudinary signed upload route
- Postman testing for all endpoints

### Team Member 2 — Frontend + AI Features
- Axios instance setup + AuthContext migration
- Login, ProtectedRoute migration
- Learner pages migration (VideosPage, VideoPlayerPage, ChallengesPage, PreferencesPage)
- Teacher pages migration (Dashboard, Videos, UploadVideo, Challenges, Events)
- AI proxy routes (backend) + AI page updates (frontend)
- Roadmap routes (backend) + RoadmapPage migration
- Admin panel migration
- README documentation

---

## Q. WMD Requirements Compliance Matrix

### Frontend Requirements

| Requirement | Status | Location |
|-------------|--------|---------|
| React.js | ✅ Already implemented | react 19, all components |
| Functional components | ✅ Already implemented | All components use functions |
| `useState`, `useEffect` | ✅ Already implemented | Everywhere |
| Additional Hooks (`useRef`, `useParams`, etc.) | ✅ Already implemented | Multiple components |
| React Router | ✅ Already implemented | React Router DOM v7 |
| Tailwind CSS | ✅ Already implemented | Tailwind CSS v4 |
| Responsive web design | ✅ Already implemented | Tailwind classes + react-responsive |
| Fetch API or Axios | ⚠️ Partially implemented | Axios used for Cloudinary/AI; `fetch()` in ChatBot; needs own API calls |
| Loading states | ✅ Already implemented | Most pages have spinners/skeletons |
| Success states | ✅ Already implemented | Toast notifications, success modals |
| Error states | ✅ Already implemented | Error messages in most forms |
| Meaningful third-party Web API | ✅ Already implemented | Piston API (code execution) + TensorFlow.js toxicity |

### Backend Requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| Node.js | ❌ Not implemented | Needs to be built |
| Express.js | ❌ Not implemented | Needs to be built |
| RESTful API architecture | ❌ Not implemented | Needs to be built |
| GET method | ❌ Not implemented | |
| POST method | ❌ Not implemented | |
| PUT method | ❌ Not implemented | |
| PATCH method | ❌ Not implemented | |
| DELETE method | ❌ Not implemented | |
| JWT-based authentication | ❌ Not implemented | Firebase Auth is used instead |
| Protected routes | ❌ Not implemented | Client-side only currently |
| Express middleware | ❌ Not implemented | |
| `express.json()` | ❌ Not implemented | |
| `express.static()` | ❌ Not implemented | |
| CORS middleware | ❌ Not implemented | |
| Custom middleware | ❌ Not implemented | |
| HTTP status codes | ❌ Not implemented | |
| Error handling middleware | ❌ Not implemented | |
| Modular architecture (routes/controllers/models/middleware) | ❌ Not implemented | |
| `.env` file | ❌ Not implemented | Config hardcoded |
| `.env` in `.gitignore` | ❌ Not implemented | No `.gitignore` found |

### Database Requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| MongoDB | ❌ Not implemented | Firebase Firestore is used |
| Mongoose | ❌ Not implemented | |
| Proper schemas and models | ❌ Not implemented | |
| CRUD operations | ⚠️ Partially implemented | Firebase CRUD exists; needs MongoDB |

### Testing Requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| Postman testing | ❌ Not implemented | No backend to test |
| Successful request tests | ❌ Not implemented | |
| Unsuccessful request tests | ❌ Not implemented | |
| Authentication tests | ❌ Not implemented | |
| Invalid input tests | ❌ Not implemented | |

### Documentation & Deployment Requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| GitHub repository | ⚠️ Needs verification | Likely exists (not visible in audit) |
| README.md | ❌ Not implemented | Current README is Vite default template |
| Installation instructions | ❌ Not implemented | |
| Project structure docs | ❌ Not implemented | |
| API endpoint documentation | ❌ Not implemented | |
| Environment variable docs | ❌ Not implemented | |
| Project report with screenshots | ❌ Not implemented | |
| Deployed working application | ⚠️ Needs verification | No deployment config found |

---

> **Summary**: The existing SkillWave application has an impressive feature set with 15+ features fully or partially implemented and a polished, modern UI. The core architecture challenge for the WMD migration is that **100% of the backend functionality needs to be rewritten** from Firebase to Express.js + MongoDB. The frontend React components are largely reusable and require adaptation (not rewriting) to consume the new REST API instead of Firebase. The AI features, code editor, Cloudinary integration, and UI/UX designs are all strong foundations to build upon.
