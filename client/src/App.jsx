import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";
import Navbar from "./Components/Navbar";
import Sidebar from "./Components/Sidebar";
import ProtectedRoute from "./Components/ProtectedRoute";
import Home from "./pages/Home";
import WatchVideo from "./pages/WatchVideo";
import Search from "./pages/Search";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import UpLoadVideo from "./pages/UpLoadVideo";
import History from "./pages/History";
import LikedVideos from "./pages/LikedVideos";
import Playlist from "./pages/Playlist";
import { HistoryProvider } from "./Context/HistoryContext";
import { LikeProvider } from "./Context/LikeContext";
import { PlaylistProvider } from "./Context/PlaylistContext";
import PlaylistDetail from "./pages/PlaylistDetail";
import { SubscriptionProvider } from "./Context/SubscriptionContext";
import Channel from "./pages/Channel";
import Subscriptions from "./pages/Subscriptions";
import Trending from "./pages/Trending";
import { UserVideoProvider } from "./Context/UserVideoContext";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <HistoryProvider>
          <LikeProvider>
            <PlaylistProvider>
              <SubscriptionProvider>
                <UserVideoProvider>
                  <div className="min-h-screen bg-zinc-950">
                    <Navbar onMenuClick={() => setSidebarOpen((o) => !o)} />
                    <div className="md:flex">
                      <Sidebar
                        open={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                      />
                      <main className="flex-1 p-4 sm:p-6 min-w-0">
                        <Routes>
                          {/* Public */}
                          <Route path="/" element={<Home />} />
                          <Route
                            path="/watch/:videoId"
                            element={<WatchVideo />}
                          />
                          <Route path="/search" element={<Search />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/register" element={<Register />} />
                          <Route path="/trending" element={<Trending />} />
                          <Route
                            path="/channel/:channelId"
                            element={<Channel />}
                          />

                          {/* Protected */}
                          <Route
                            path="/profile"
                            element={
                              <ProtectedRoute>
                                <Profile />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/upload"
                            element={
                              <ProtectedRoute>
                                <UpLoadVideo />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/history"
                            element={
                              <ProtectedRoute>
                                <History />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/liked-videos"
                            element={
                              <ProtectedRoute>
                                <LikedVideos />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/playlists"
                            element={
                              <ProtectedRoute>
                                <Playlist />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/playlists/:playlistId"
                            element={
                              <ProtectedRoute>
                                <PlaylistDetail />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/subscriptions"
                            element={
                              <ProtectedRoute>
                                <Subscriptions />
                              </ProtectedRoute>
                            }
                          />
                        </Routes>
                      </main>
                    </div>
                  </div>
                </UserVideoProvider>
              </SubscriptionProvider>
            </PlaylistProvider>
          </LikeProvider>
        </HistoryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
