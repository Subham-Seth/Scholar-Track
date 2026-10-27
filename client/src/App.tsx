import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { Navbar } from './components/common/Navbar.js';
import { Footer } from './components/common/Footer.js';
import { ProtectedRoute } from './components/common/ProtectedRoute.js';
import { ScholarBotWidget } from './components/scholarbot/ScholarBotWidget.js';

import { HomePage } from './pages/HomePage.js';
import { ScholarshipsPage } from './pages/ScholarshipsPage.js';
import { ScholarshipDetailPage } from './pages/ScholarshipDetailPage.js';
import { EligibilityCheckerPage } from './pages/EligibilityCheckerPage.js';
import { ScholarBotPage } from './pages/ScholarBotPage.js';
import { GuidancePage } from './pages/GuidancePage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { AboutPage } from './pages/AboutPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans antialiased text-slate-800">
          <Navbar />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/scholarships" element={<ScholarshipsPage />} />
              <Route path="/scholarships/:id" element={<ScholarshipDetailPage />} />
              <Route path="/eligibility" element={<EligibilityCheckerPage />} />
              <Route path="/scholarbot" element={<ScholarBotPage />} />
              <Route path="/guidance" element={<GuidancePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Catch-all */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          {/* Floating ScholarBot Chat Widget */}
          <ScholarBotWidget />

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
