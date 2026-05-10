import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardPage from './pages/dashboard/DashboardPage';
import DocumentListPage from './pages/documents/DocumentListPage';
import DocumentDetailPage from './pages/documents/DocumentDetailPage';
import FlashcardsListPage from './pages/flashcards/FlashcardsListPage';
import FlashcardPage from './pages/flashcards/FlashcardPage';
import QuizTakePage from './pages/quizzes/QuizTakePage';
import QuizResultPage from './pages/quizzes/QuizResultPage';
import ProfilePage from './pages/profile/ProfilePage';
import StudyPlannerPage from './pages/study-planner/StudyPlannerPage';
import MindMapPage from './pages/mind-map/MindMapPage';
import ProgressPage from './pages/progress/ProgressPage';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

// Status Pages & Components
import GlobalLoader from './components/status/GlobalLoader';
import NotFoundPage from './pages/status/NotFoundPage';
import ServerErrorPage from './pages/status/ServerErrorPage';
import UnauthorizedPage from './pages/status/UnauthorizedPage';
import ForbiddenPage from './pages/status/ForbiddenPage';
import OfflinePage from './pages/status/OfflinePage';
import MaintenancePage from './pages/status/MaintenancePage';
import SessionExpiredPage from './pages/status/SessionExpiredPage';
import TimeoutPage from './pages/status/TimeoutPage';
import ComingSoonPage from './pages/status/ComingSoonPage';

const App = () => {
  const { isAuthenticated, loading } = useAuth();

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#FAF9F6',
            color: '#1C1917',
            border: '1px solid #E7E5E4',
          },
          success: {
            iconTheme: {
              primary: '#E69A59',
              secondary: '#FAF9F6',
            },
          },
          error: {
            iconTheme: {
              primary: '#EA580C',
              secondary: '#ffffff',
            },
          },
        }}
      />

      {/* Global Loader with smooth exit animation */}
      <AnimatePresence mode="wait">
        {loading && <GlobalLoader key="global-loader" />}
      </AnimatePresence>

      {!loading && (
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />

          {/* Status & Error Testing Routes (Can be accessed directly) */}
          <Route path="/status/500" element={<ServerErrorPage />} />
          <Route path="/status/401" element={<UnauthorizedPage />} />
          <Route path="/status/403" element={<ForbiddenPage />} />
          <Route path="/status/offline" element={<OfflinePage />} />
          <Route path="/status/maintenance" element={<MaintenancePage />} />
          <Route path="/status/expired" element={<SessionExpiredPage />} />
          <Route path="/status/timeout" element={<TimeoutPage />} />
          <Route path="/status/coming-soon" element={<ComingSoonPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/documents" element={<DocumentListPage />} />
            <Route path="/documents/:id" element={<DocumentDetailPage />} />
            <Route path="/flashcards" element={<FlashcardsListPage />} />
            <Route path="/documents/:id/flashcards" element={<FlashcardPage />} />
            <Route path="/study-planner" element={<StudyPlannerPage />} />
            <Route path="/mind-map" element={<MindMapPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/quizzes/take" element={<QuizTakePage />} />
            <Route path="/quizzes/:quizId" element={<QuizTakePage />} />
            <Route path="/quizzes/result" element={<QuizResultPage />} />
            <Route path="/quizzes/:quizId/results" element={<QuizResultPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      )}
    </Router>
  );
};

export default App;