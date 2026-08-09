import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import WatchVideo from "./pages/WatchVideo";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import UpLoadVideo from "./pages/UpLoadVideo";
import History from "./pages/History";
import LikedVideos from "./pages/LikedVideos";
import Playlist from "./pages/Playlist";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-zinc-950">
          <Navbar onMenuClick={() => setSidebarOpen((o) => !o)} />
          <div className="md:flex">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="flex-1 p-4 sm:p-6 min-w-0">
              <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/watch/:videoId" element={<WatchVideo />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected */}
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/upload" element={<ProtectedRoute><UpLoadVideo /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                <Route path="/liked-videos" element={<ProtectedRoute><LikedVideos /></ProtectedRoute>} />
                <Route path="/playlists" element={<ProtectedRoute><Playlist /></ProtectedRoute>} />
              </Routes>
            </main>
          </div>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}