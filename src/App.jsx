import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Home from './pages/Home';
import SubmitStory from './pages/SubmitStory';
import StoryDetails from './pages/StoryDetails';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Search from './pages/Search';
import UserDashboard from './components/UserDashboard';
import LearningPathways from './components/LearningPathways';
import StoryPulseDashboard from './components/StoryPulseDashboard';
import NavBar from './components/NavBar';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <NavBar />
      <main className="">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/submit" element={<SubmitStory />} />
          <Route path="/story/:id" element={<StoryDetails />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/pathways" element={<LearningPathways />} />
          <Route path="/pulse" element={<StoryPulseDashboard />} />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <UserDashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin" 
            element={user?.isAdmin ? <AdminDashboard /> : <Navigate to="/login" />} 
          />
          <Route path="*" element={
            <div className="section-ksg-padding">
              <div className="container-ksg-max">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
                  <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
                  <Link to="/" className="btn-ksg-primary">Return Home</Link>
                </div>
              </div>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}