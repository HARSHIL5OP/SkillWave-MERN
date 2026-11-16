import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import DashboardLayout from "./Teacher/TComponents/Layouts/Dashboard-Layout";
import LoginPage from "./Teacher/TPages/Login";
import Dashboard from "./Teacher/TPages/Dashboard";
import Videos from "./Teacher/TPages/Videos";
import HostEvent from "./Teacher/TPages/HostEvent";
import VideoPlayer from "./Teacher/TPages/VideoPlayer";
import Challenges from "./Teacher/TPages/Challenges";
import UploadChallenge from "./Teacher/TPages/UploadChallenge";
import UploadVideo from "./Teacher/TPages/UploadVideo";

import LHome from "./Landing/LHome";
import LAbout from "./Landing/LAbout";
import LContact from "./Landing/LContact";

import VideosPage from "./Learner/LPages/VideosPage";
import DashboardLayout1 from "./Learner/LComponents/Layouts/DashboardLayout";
import VideoPlayerPage from "./Learner/LPages/VideoPlayerPage";
import ChallengesPage from "./Learner/LPages/ChallengesPage";
import PreferencesPage from "./Learner/LPages/PreferencesPage";
import AISummarizePage from "./Learner/LPages/AISummarizePage";
import RoadmapPage from "./Learner/LPages/RoadmapPage";
import EventsPage from "./Learner/LPages/EventsPage";
import MainCodeEditor from "./CodeEditor/MainCodeEditor";
import ChatBot from "./chatbot/ChatBot";

import Admin from "./Admin/admin/Admin";
import AdminDashboard from "./Admin/admin/components/Dashboard";
import ContentManagement from "./Admin/admin/components/ContentManagement";
import Settings from "./Admin/admin/components/Settings";
import Analytics from "./Admin/admin/components/Analytics";
import Support from "./Admin/admin/components/Support";
import Profile from "./Admin/admin/components/Profile";
import UserManagement from "./Admin/admin/components/UserManagement";
import { AddUserForm } from "./Admin/components/users/AddUserForm";

const AppRoutes = () => {
  const { user, isAuthenticated, loading } = useAuth();

  const getRoleRedirect = () => {
    if (!isAuthenticated || !user) return "/home";
    if (user.role === "admin") return "/admin";
    if (user.role === "teacher") return "/teacher/dashboard";
    return "/learner/videos";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Loading SkillWave...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/home"
        element={
          isAuthenticated ? <Navigate to={getRoleRedirect()} replace /> : <LHome />
        }
      />
      <Route path="/home/about" element={<LAbout />} />
      <Route path="/home/contact" element={<LContact />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Teacher Protected Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["teacher"]} layout={DashboardLayout}>
            <Outlet />
          </ProtectedRoute>
        }
      >
        <Route path="/teacher/dashboard" element={<Dashboard />} />
        <Route path="/teacher/videos" element={<Videos />} />
        <Route path="/teacher/videos/:id" element={<VideoPlayer />} />
        <Route path="/teacher/upload-video" element={<UploadVideo />} />
        <Route path="/teacher/challenges" element={<Challenges />} />
        <Route path="/teacher/upload-challenge" element={<UploadChallenge />} />
        <Route path="/teacher/events" element={<EventsPage />} />
        <Route path="/teacher/host-event" element={<HostEvent />} />
      </Route>

      {/* Learner Protected Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["learner"]} layout={DashboardLayout1}>
            <Outlet />
          </ProtectedRoute>
        }
      >
        <Route path="/learner/videos" element={<VideosPage />} />
        <Route path="/learner/videos/:id" element={<VideoPlayerPage />} />
        <Route path="/learner/challenges" element={<ChallengesPage />} />
        <Route path="/learner/code-editor" element={<MainCodeEditor />} />
        <Route path="/learner/preferences" element={<PreferencesPage />} />
        <Route path="/learner/events" element={<EventsPage />} />
        <Route path="/learner/ai-summarize" element={<AISummarizePage />} />
        <Route path="/learner/roadmap" element={<RoadmapPage />} />
        <Route path="/learner/chatbot" element={<ChatBot />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["admin"]} layout={Admin}>
            <Outlet />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/users/add" element={<AddUserForm />} />
        <Route path="/admin/content" element={<ContentManagement />} />
        <Route path="/admin/settings" element={<Settings />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/support" element={<Support />} />
        <Route path="/admin/profile" element={<Profile />} />
        <Route path="/admin/videos/:id" element={<VideoPlayer />} />
        <Route path="/admin/edit-video" element={<UploadVideo isAdminEdit={true} />} />
        <Route path="/admin/edit-challenge" element={<UploadChallenge isAdminEdit={true} />} />
        <Route path="/admin/edit-event" element={<HostEvent isAdminEdit={true} />} />
      </Route>

      {/* Default Fallbacks */}
      <Route path="/" element={<Navigate to={getRoleRedirect()} replace />} />
      <Route path="*" element={<Navigate to={getRoleRedirect()} replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
