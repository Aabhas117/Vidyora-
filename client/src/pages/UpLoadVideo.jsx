import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, Image as ImageIcon, CheckCircle2, Film } from "lucide-react";
import { uploadVideo } from "../Services/uploadService";
import { useAuth } from "../Hooks/useAuth";
import { useUserVideos } from "../Hooks/useUserVideos";

const CATEGORIES = ["Education", "Technology", "Gaming", "Music", "Entertainment", "Sports", "News", "Other"];
const VISIBILITY_OPTIONS = ["Public", "Unlisted", "Private"];
const TITLE_LIMIT = 100;
const DESCRIPTION_LIMIT = 500;

export default function UpLoadVideo() {
  const navigate = useNavigate();

  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [videoDuration, setVideoDuration] = useState(null);

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [visibility, setVisibility] = useState("Public");

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | uploading | success | error
  const [progress, setProgress] = useState(0);
  const [serverError, setServerError] = useState(null);

  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  const { user } = useAuth();
  const { addUserVideo } = useUserVideos();

  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
    };
  }, [videoPreviewUrl, thumbnailPreviewUrl]);

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);

    setVideoFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
    setVideoDuration(null);
    setErrors((prev) => ({ ...prev, video: undefined }));
  };

  const removeVideo = () => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setVideoDuration(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleThumbnailSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);

    setThumbnailFile(file);
    setThumbnailPreviewUrl(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, thumbnail: undefined }));
  };

  const removeThumbnail = () => {
    if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
    setThumbnailFile(null);
    setThumbnailPreviewUrl(null);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const validate = () => {
    const next = {};
    if (!videoFile) next.video = "Select a video file to upload.";
    if (!thumbnailFile) next.thumbnail = "Select a thumbnail image.";
    if (!title.trim()) next.title = "Title is required.";
    else if (title.length > TITLE_LIMIT) next.title = `Title must be under ${TITLE_LIMIT} characters.`;
    if (!description.trim()) next.description = "Description is required.";
    else if (description.length > DESCRIPTION_LIMIT)
      next.description = `Description must be under ${DESCRIPTION_LIMIT} characters.`;
    if (!category) next.category = "Choose a category.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePublish = async () => {
    setServerError(null);
    if (!validate()) return;

    setStatus("uploading");
    setProgress(0);

    try {
      const result = await uploadVideo(
        { videoFile, thumbnailFile, title, description, category, visibility },
        (pct) => setProgress(pct)
      );

      addUserVideo({
        ...result,
        channel: user.fullName,
        avatar: user.avatar,
        views: "0 views",
        uploaded: "Just now",
      });

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setServerError(err.message || "Something went wrong. Try again.");
    }
  };

  const handleCancel = () => navigate("/");

  const resetForm = () => {
    removeVideo();
    removeThumbnail();
    setTitle("");
    setDescription("");
    setCategory("");
    setVisibility("Public");
    setErrors({});
    setStatus("idle");
    setProgress(0);
  };

  if (status === "success") {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <CheckCircle2 size={48} className="text-violet-400 mx-auto mb-4" />
        <h1 className="text-lg font-semibold text-zinc-100">Video published</h1>
        <p className="text-sm text-zinc-500 mt-1">
          This is a mock success — nothing was actually uploaded to a server yet.
        </p>
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={resetForm}
            className="px-5 py-2 rounded-full border border-zinc-700 text-sm text-zinc-300 hover:border-zinc-500 transition-colors"
          >
            Upload another
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2 rounded-full bg-violet-500 text-white text-sm font-medium hover:bg-violet-400 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const uploading = status === "uploading";

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold text-zinc-100 mb-6">Upload Video</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm font-medium text-zinc-300 mb-2">Video</p>

            {videoFile ? (
              <div>
                <div className="aspect-video w-full bg-black rounded-xl overflow-hidden">
                  <video
                    src={videoPreviewUrl}
                    controls
                    className="h-full w-full"
                    onLoadedMetadata={(e) => setVideoDuration(e.target.duration)}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-zinc-500 truncate flex items-center gap-1.5">
                    <Film size={13} className="shrink-0" />
                    {videoFile.name}
                    {videoDuration != null && ` · ${formatDuration(videoDuration)}`}
                  </p>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => videoInputRef.current?.click()}
                      className="text-xs text-violet-400 hover:underline"
                    >
                      Replace
                    </button>
                    <button onClick={removeVideo} className="text-xs text-red-400 hover:underline">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className={`w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors ${
                  errors.video
                    ? "border-red-500/50 bg-red-500/5"
                    : "border-zinc-800 bg-zinc-900 hover:border-violet-500/50"
                }`}
              >
                <UploadCloud size={28} className="text-zinc-500" />
                <span className="text-sm text-zinc-400">Choose a video file</span>
                <span className="text-xs text-zinc-600">MP4, MOV, WebM</span>
              </button>
            )}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              className="hidden"
            />
            {errors.video && <p className="text-xs text-red-400 mt-1.5">{errors.video}</p>}
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-300 mb-2">Thumbnail</p>

            {thumbnailFile ? (
              <div>
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
                  <img src={thumbnailPreviewUrl} alt="Thumbnail preview" className="h-full w-full object-cover" />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-zinc-500 truncate">{thumbnailFile.name}</p>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="text-xs text-violet-400 hover:underline"
                    >
                      Replace
                    </button>
                    <button onClick={removeThumbnail} className="text-xs text-red-400 hover:underline">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => thumbnailInputRef.current?.click()}
                className={`w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors ${
                  errors.thumbnail
                    ? "border-red-500/50 bg-red-500/5"
                    : "border-zinc-800 bg-zinc-900 hover:border-violet-500/50"
                }`}
              >
                <ImageIcon size={22} className="text-zinc-500" />
                <span className="text-sm text-zinc-400">Choose a thumbnail image</span>
              </button>
            )}
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailSelect}
              className="hidden"
            />
            {errors.thumbnail && <p className="text-xs text-red-400 mt-1.5">{errors.thumbnail}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <label className="text-xs text-zinc-400">Title</label>
              <span className="text-xs text-zinc-600">{title.length}/{TITLE_LIMIT}</span>
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={TITLE_LIMIT}
              placeholder="Give your video a title"
              className={`w-full bg-zinc-900 border rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none transition-colors ${
                errors.title ? "border-red-500/60" : "border-zinc-800 focus:border-violet-500"
              }`}
            />
            {errors.title && <p className="text-xs text-red-400 mt-1.5">{errors.title}</p>}
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <label className="text-xs text-zinc-400">Description</label>
              <span className="text-xs text-zinc-600">{description.length}/{DESCRIPTION_LIMIT}</span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={DESCRIPTION_LIMIT}
              rows={5}
              placeholder="Tell viewers about your video"
              className={`w-full bg-zinc-900 border rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none resize-none transition-colors ${
                errors.description ? "border-red-500/60" : "border-zinc-800 focus:border-violet-500"
              }`}
            />
            {errors.description && <p className="text-xs text-red-400 mt-1.5">{errors.description}</p>}
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full bg-zinc-900 border rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none transition-colors ${
                errors.category ? "border-red-500/60" : "border-zinc-800 focus:border-violet-500"
              }`}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-red-400 mt-1.5">{errors.category}</p>}
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1.5">Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-violet-500 transition-colors"
            >
              {VISIBILITY_OPTIONS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {uploading && (
        <div className="mt-8">
          <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
            <span>Uploading… (mock progress only)</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {status === "error" && (
        <p className="mt-6 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {serverError}
        </p>
      )}

      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-zinc-800">
        <button
          onClick={handleCancel}
          disabled={uploading}
          className="px-5 py-2.5 rounded-full border border-zinc-700 text-sm text-zinc-300 hover:border-zinc-500 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handlePublish}
          disabled={uploading}
          className="px-6 py-2.5 rounded-full bg-violet-500 text-white text-sm font-semibold hover:bg-violet-400 transition-colors disabled:opacity-60 flex items-center gap-2"
        >
          {uploading ? `Publishing… ${progress}%` : "Publish Video"}
        </button>
      </div>
    </div>
  );
}