import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { usePaginatedVideos } from "../Hooks/usePaginatedVideos";
import * as videoService from "../Services/videoService";

vi.mock("../Services/videoService", () => ({
  getVideos: vi.fn(),
}));

function TestComponent({ options }) {
  const { videos, currentPage, totalPages, totalCount, loading, loadingMore, error, hasMore, loadMore } =
    usePaginatedVideos(options);

  return (
    <div>
      <div data-testid="loading">{loading ? "Loading" : "Ready"}</div>
      <div data-testid="loading-more">{loadingMore ? "LoadingMore" : "Idle"}</div>
      <div data-testid="error">{error ? "Error" : "OK"}</div>
      <div data-testid="count">{totalCount}</div>
      <div data-testid="current-page">{currentPage}</div>
      <div data-testid="total-pages">{totalPages}</div>
      <div data-testid="has-more">{hasMore ? "Yes" : "No"}</div>
      <ul data-testid="video-list">
        {videos.map((v) => (
          <li key={v.id}>{v.title}</li>
        ))}
      </ul>
      <button data-testid="load-more-btn" onClick={loadMore}>
        Load More
      </button>
    </div>
  );
}

describe("usePaginatedVideos hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches page 1 videos on mount", async () => {
    videoService.getVideos.mockResolvedValueOnce({
      videos: [
        { id: "1", title: "Video 1" },
        { id: "2", title: "Video 2" },
      ],
      currentPage: 1,
      totalPages: 2,
      totalCount: 4,
    });

    render(<TestComponent options={{ limit: 2 }} />);

    expect(screen.getByTestId("loading")).toHaveTextContent("Loading");

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("Ready");
    });

    expect(screen.getByTestId("count")).toHaveTextContent("4");
    expect(screen.getByTestId("current-page")).toHaveTextContent("1");
    expect(screen.getByTestId("has-more")).toHaveTextContent("Yes");
    expect(screen.getByTestId("video-list").children.length).toBe(2);
    expect(videoService.getVideos).toHaveBeenCalledWith({ page: 1, limit: 2, search: "", sort: "" });
  });

  it("appends next page videos when loadMore is called", async () => {
    videoService.getVideos
      .mockResolvedValueOnce({
        videos: [{ id: "1", title: "Video 1" }],
        currentPage: 1,
        totalPages: 2,
        totalCount: 2,
      })
      .mockResolvedValueOnce({
        videos: [{ id: "2", title: "Video 2" }],
        currentPage: 2,
        totalPages: 2,
        totalCount: 2,
      });

    render(<TestComponent options={{ limit: 1 }} />);

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("Ready");
    });

    expect(screen.getByTestId("video-list").children.length).toBe(1);

    await act(async () => {
      screen.getByTestId("load-more-btn").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("video-list").children.length).toBe(2);
    });

    expect(screen.getByTestId("current-page")).toHaveTextContent("2");
    expect(screen.getByTestId("has-more")).toHaveTextContent("No");
  });

  it("resets pagination and fetches new page 1 when search query changes", async () => {
    videoService.getVideos
      .mockResolvedValueOnce({
        videos: [{ id: "1", title: "Initial Video" }],
        currentPage: 1,
        totalPages: 1,
        totalCount: 1,
      })
      .mockResolvedValueOnce({
        videos: [{ id: "2", title: "React Video" }],
        currentPage: 1,
        totalPages: 1,
        totalCount: 1,
      });

    const { rerender } = render(<TestComponent options={{ search: "" }} />);

    await waitFor(() => {
      expect(screen.getByTestId("video-list")).toHaveTextContent("Initial Video");
    });

    rerender(<TestComponent options={{ search: "React" }} />);

    await waitFor(() => {
      expect(screen.getByTestId("video-list")).toHaveTextContent("React Video");
    });

    expect(videoService.getVideos).toHaveBeenLastCalledWith({
      page: 1,
      limit: 10,
      search: "React",
      sort: "",
    });
  });
});
