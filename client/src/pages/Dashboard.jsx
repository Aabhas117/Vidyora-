import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  ThumbsUp,
  MessageSquare,
  Users,
  TrendingUp,
  ArrowLeft,
  RotateCw,
  BarChart2,
  Calendar,
  Filter,
} from "lucide-react";
import {
  getOverview,
  getViewsOverTime,
  getTopVideos,
  getSubscriberGrowth,
} from "../Services/analyticsService";
import LineChart from "../Components/Analytics/LineChart";
import BarChart from "../Components/Analytics/BarChart";

function formatNumber(num = 0) {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [viewsData, setViewsData] = useState([]);
  const [topVideos, setTopVideos] = useState([]);
  const [subscriberData, setSubscriberData] = useState([]);

  const [days, setDays] = useState(30);
  const [topSort, setTopSort] = useState("views");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const [overviewRes, viewsRes, topVideosRes, subGrowthRes] = await Promise.allSettled([
        getOverview(),
        getViewsOverTime(days),
        getTopVideos(topSort),
        getSubscriberGrowth(),
      ]);

      if (overviewRes.status === "fulfilled") setOverview(overviewRes.value);
      if (viewsRes.status === "fulfilled") setViewsData(viewsRes.value?.data || []);
      if (topVideosRes.status === "fulfilled") setTopVideos(topVideosRes.value?.videos || []);
      if (subGrowthRes.status === "fulfilled") setSubscriberData(subGrowthRes.value?.data || []);

      // If all failed, mark global error
      if (
        overviewRes.status === "rejected" &&
        viewsRes.status === "rejected" &&
        topVideosRes.status === "rejected" &&
        subGrowthRes.status === "rejected"
      ) {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [days, topSort]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-violet-400 transition-colors mb-2"
          >
            <ArrowLeft size={14} /> Back to Profile
          </Link>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2.5">
            <BarChart2 className="text-violet-400" size={26} />
            Creator Analytics Dashboard
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time channel performance, views over time, top performing videos, and subscriber growth.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-violet-400 hover:border-violet-500/50 transition-colors disabled:opacity-50"
        >
          <RotateCw size={14} className={loading ? "animate-spin text-violet-400" : ""} />
          Refresh Data
        </button>
      </div>

      {error ? (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-12 text-center my-6">
          <p className="text-zinc-300 font-medium text-base mb-1">Unable to load creator analytics</p>
          <p className="text-xs text-zinc-500 mb-6 max-w-md mx-auto">
            We encountered a problem loading your channel metrics. Check that the backend server is running properly.
          </p>
          <button
            onClick={fetchAnalytics}
            className="px-5 py-2.5 rounded-xl bg-violet-500 text-white text-xs font-semibold hover:bg-violet-400 transition-colors inline-flex items-center gap-2"
          >
            <RotateCw size={14} /> Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Views"
              value={formatNumber(overview?.totalViews)}
              icon={Eye}
              color="text-violet-400"
              bgColor="bg-violet-500/10"
              borderColor="border-violet-500/20"
              loading={loading}
            />
            <StatCard
              title="Total Likes"
              value={formatNumber(overview?.totalLikes)}
              icon={ThumbsUp}
              color="text-indigo-400"
              bgColor="bg-indigo-500/10"
              borderColor="border-indigo-500/20"
              loading={loading}
            />
            <StatCard
              title="Total Comments"
              value={formatNumber(overview?.totalComments)}
              icon={MessageSquare}
              color="text-pink-400"
              bgColor="bg-pink-500/10"
              borderColor="border-pink-500/20"
              loading={loading}
            />
            <StatCard
              title="Subscribers"
              value={formatNumber(overview?.totalSubscribers)}
              icon={Users}
              color="text-emerald-400"
              bgColor="bg-emerald-500/10"
              borderColor="border-emerald-500/20"
              loading={loading}
            />
          </div>

          {/* Views Over Time Section */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                  <TrendingUp size={18} className="text-violet-400" />
                  Views Over Time
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Daily aggregate views logged across your video uploads.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 p-1 rounded-xl self-start sm:self-auto">
                <Calendar size={14} className="text-zinc-500 ml-2" />
                {[7, 30, 90].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      days === d
                        ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {d} Days
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center bg-zinc-950/40 rounded-xl">
                <p className="text-xs text-zinc-500 animate-pulse">Loading view trend graph…</p>
              </div>
            ) : viewsData.length === 0 ? (
              <div className="h-64 flex items-center justify-center bg-zinc-950/40 rounded-xl">
                <p className="text-xs text-zinc-500">No view events recorded yet for this period.</p>
              </div>
            ) : (
              <LineChart data={viewsData} xKey="date" yKey="views" label="Views" color="#a855f7" />
            )}
          </div>

          {/* Grid: Top Videos & Subscriber Growth */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Videos Chart & List */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-base font-semibold text-zinc-100">Top Performing Videos</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Your highest-performing video uploads ranked by metric.
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 p-1 rounded-xl self-start sm:self-auto">
                    <Filter size={13} className="text-zinc-500 ml-1.5" />
                    {[
                      { key: "views", label: "Views" },
                      { key: "likes", label: "Likes" },
                      { key: "engagement", label: "Engagement" },
                    ].map((s) => (
                      <button
                        key={s.key}
                        onClick={() => setTopSort(s.key)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                          topSort === s.key
                            ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {loading ? (
                  <div className="h-48 flex items-center justify-center bg-zinc-950/40 rounded-xl">
                    <p className="text-xs text-zinc-500 animate-pulse">Loading top videos…</p>
                  </div>
                ) : topVideos.length === 0 ? (
                  <div className="h-48 flex items-center justify-center bg-zinc-950/40 rounded-xl">
                    <p className="text-xs text-zinc-500">No video data available.</p>
                  </div>
                ) : (
                  <>
                    <BarChart data={topVideos} xKey="title" yKey={topSort} label={topSort} color="#8b5cf6" />

                    {/* Ranked Video List */}
                    <div className="mt-6 flex flex-col gap-3">
                      {topVideos.slice(0, 5).map((v, idx) => (
                        <div
                          key={v._id}
                          className="flex items-center gap-3 p-2.5 bg-zinc-950/60 border border-zinc-800/80 rounded-xl"
                        >
                          <span className="text-xs font-bold text-zinc-500 w-4 text-center">{idx + 1}</span>
                          <div className="h-10 w-16 bg-zinc-800 rounded-lg overflow-hidden shrink-0">
                            {v.thumbnail ? (
                              <img src={v.thumbnail} alt={v.title} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full bg-zinc-800" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-zinc-200 truncate">{v.title}</p>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                              {v.views.toLocaleString()} views · {v.likes} likes · {v.comments} comments
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-semibold text-violet-400">
                              {v[topSort].toLocaleString()}
                            </span>
                            <p className="text-[10px] text-zinc-500 capitalize">{topSort}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Subscriber Growth Chart */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="mb-6">
                  <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                    <Users size={18} className="text-emerald-400" />
                    Subscriber Growth (30 Days)
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Daily new channel subscribers acquired over the last month.
                  </p>
                </div>

                {loading ? (
                  <div className="h-64 flex items-center justify-center bg-zinc-950/40 rounded-xl">
                    <p className="text-xs text-zinc-500 animate-pulse">Loading subscriber growth…</p>
                  </div>
                ) : subscriberData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center bg-zinc-950/40 rounded-xl">
                    <p className="text-xs text-zinc-500">No subscriber data recorded yet.</p>
                  </div>
                ) : (
                  <LineChart
                    data={subscriberData}
                    xKey="date"
                    yKey="newSubscribers"
                    label="Subscribers"
                    color="#10b981"
                  />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Reusable Metric Overview Card
function StatCard({ title, value, icon: Icon, color, bgColor, borderColor, loading }) {
  return (
    <div className={`bg-zinc-900 border ${borderColor} rounded-2xl p-5 flex items-center justify-between`}>
      <div>
        <p className="text-xs text-zinc-400 font-medium mb-1">{title}</p>
        {loading ? (
          <div className="h-7 w-20 bg-zinc-800 rounded animate-pulse my-1" />
        ) : (
          <p className="text-2xl font-bold text-zinc-100">{value ?? "0"}</p>
        )}
      </div>
      <div className={`h-11 w-11 rounded-xl ${bgColor} flex items-center justify-center shrink-0`}>
        <Icon size={20} className={color} />
      </div>
    </div>
  );
}
