import api from "./api";

export async function getOverview() {
  const res = await api.get("/analytics/overview");
  return res.data;
}

export async function getViewsOverTime(days = 30) {
  const res = await api.get("/analytics/views-over-time", { params: { days } });
  return res.data;
}

export async function getTopVideos(sort = "views") {
  const res = await api.get("/analytics/top-videos", { params: { sort } });
  return res.data;
}

export async function getSubscriberGrowth() {
  const res = await api.get("/analytics/subscriber-growth");
  return res.data;
}
