import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileVideo,
  Image,
  X,
  Check,
  ChevronDown,
  Loader2,
  Plus,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { categoriesAPI } from "../../api/categoriesAPI";
import { videosAPI } from "../../api/videosAPI";
import {
  uploadVideoToCloudinary,
  uploadThumbnailToCloudinary,
} from "../TUploads/Cloudinary";

export default function UploadVideo({ onUpdateComplete, isAdminEdit }) {
  const location = useLocation();
  const navigate = useNavigate();
  const propEditData = location.state?.editData || null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    subcategory: "",
    topic: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [showNewSubcategory, setShowNewSubcategory] = useState(false);
  const [newSubcategory, setNewSubcategory] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { userId } = useAuth();
  const isEditMode = !!propEditData;

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesAPI.getCategories();
        setCategories(data || []);

        if (propEditData?.category) {
          const matched = (data || []).find(
            (c) => c.name === propEditData.category || c._id === propEditData.category
          );
          if (matched && matched.subcategories) {
            setSubcategories(matched.subcategories);
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [propEditData]);

  // Update subcategories when category changes
  const handleCategoryChange = (categoryName) => {
    setFormData((prev) => ({
      ...prev,
      category: categoryName,
      subcategory: "",
      topic: "",
    }));

    const matched = categories.find((c) => c.name === categoryName);
    if (matched && matched.subcategories) {
      setSubcategories(matched.subcategories);
    } else {
      setSubcategories([]);
    }
  };

  // Dropzone for video
  const { getRootProps: getVideoRootProps, getInputProps: getVideoInputProps } =
    useDropzone({
      accept: { "video/*": [".mp4", ".webm", ".ogg"] },
      maxFiles: 1,
      onDrop: (acceptedFiles) => {
        setVideoFile(acceptedFiles[0]);
        setPreviewUrl(URL.createObjectURL(acceptedFiles[0]));
      },
    });

  // Dropzone for thumbnail
  const {
    getRootProps: getThumbnailRootProps,
    getInputProps: getThumbnailInputProps,
  } = useDropzone({
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setThumbnailFile(acceptedFiles[0]);
      setThumbnailPreview(URL.createObjectURL(acceptedFiles[0]));
    },
  });

  useEffect(() => {
    if (propEditData) {
      setTitle(propEditData.video_title || propEditData.title || "");
      setDescription(propEditData.video_description || propEditData.description || "");
      setFormData({
        category: propEditData.category || "",
        subcategory: propEditData.subcategory || "",
        topic: propEditData.topic || "",
      });
      if (propEditData.videoUrl || propEditData.VideoURL) {
        setPreviewUrl(propEditData.videoUrl || propEditData.VideoURL);
      }
      if (propEditData.thumbnail || propEditData.ThumbnailURL || propEditData.thumbnailUrl) {
        setThumbnailPreview(propEditData.thumbnail || propEditData.ThumbnailURL || propEditData.thumbnailUrl);
      }
    }
  }, [propEditData]);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const created = await categoriesAPI.createCategory({
        name: newCategory.trim(),
        subcategories: [],
      });
      setCategories((prev) => [...prev, created]);
      handleCategoryChange(created.name);
      setNewCategory("");
      setShowNewCategory(false);
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const handleAddSubcategory = async () => {
    if (!newSubcategory.trim() || !formData.category) return;
    try {
      const categoryDoc = categories.find((c) => c.name === formData.category);
      if (!categoryDoc) return;

      const updated = await categoriesAPI.addSubcategory(categoryDoc._id, {
        name: newSubcategory.trim(),
        topics: newTopic ? [newTopic.trim()] : [],
      });

      setCategories((prev) =>
        prev.map((c) => (c._id === updated._id ? updated : c))
      );
      setSubcategories(updated.subcategories || []);
      setFormData((prev) => ({
        ...prev,
        subcategory: newSubcategory.trim(),
        topic: newTopic ? newTopic.trim() : prev.topic,
      }));

      setNewSubcategory("");
      setNewTopic("");
      setShowNewSubcategory(false);
    } catch (error) {
      console.error("Error creating subcategory:", error);
    }
  };

  const getVideoDuration = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const minutes = Math.floor(video.duration / 60);
        const seconds = Math.floor(video.duration % 60);
        resolve(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
      };
      video.onerror = () => resolve("10:00");
      video.src = URL.createObjectURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!isEditMode && !videoFile) {
      setErrorMsg("Please select a video file to upload");
      return;
    }
    if (!title.trim()) {
      setErrorMsg("Please enter a video title");
      return;
    }
    if (!formData.category) {
      setErrorMsg("Please select a category");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      let videoURL = propEditData?.videoUrl || propEditData?.VideoURL || "";
      let thumbnailURL = propEditData?.thumbnail || propEditData?.ThumbnailURL || propEditData?.thumbnailUrl || "";
      let duration = propEditData?.duration || "10:00";

      if (videoFile) {
        duration = await getVideoDuration(videoFile);
        setUploadProgress(30);
        videoURL = await uploadVideoToCloudinary(videoFile);
        setUploadProgress(65);
      }

      if (thumbnailFile) {
        thumbnailURL = await uploadThumbnailToCloudinary(thumbnailFile);
        setUploadProgress(85);
      }

      const videoPayload = {
        title,
        description,
        videoUrl: videoURL,
        thumbnailUrl: thumbnailURL,
        category: formData.category,
        subcategory: formData.subcategory,
        topic: formData.topic,
        duration,
      };

      if (isEditMode) {
        await videosAPI.updateVideo(propEditData.id || propEditData._id, videoPayload);
        setShowSuccess(true);
        onUpdateComplete?.();
        if (isAdminEdit) {
          setTimeout(() => navigate('/admin/content'), 1500);
        } else {
          setTimeout(() => navigate('/teacher/videos'), 1500);
        }
      } else {
        await videosAPI.createVideo(videoPayload);
        setShowSuccess(true);
        setTimeout(() => navigate('/teacher/videos'), 1500);
      }

      setUploadProgress(100);
    } catch (error) {
      console.error("Error saving video:", error);
      setErrorMsg(error.response?.data?.message || error.message || "Failed to upload video");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit Video Course" : "Upload New Video Course"}
          </h1>
          <p className="text-gray-500 mt-1">
            Share your knowledge with learners around the world
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Complete Guide to React Hooks"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white text-sm"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what learners will achieve from this course..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white text-sm"
              />
            </div>

            {/* Dropzones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Video File Dropzone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video File {!isEditMode && "*"}
                </label>
                <div
                  {...getVideoRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                    videoFile || previewUrl
                      ? "border-green-400 bg-green-50/20"
                      : "border-gray-200 hover:border-purple-400 bg-gray-50"
                  }`}
                >
                  <input {...getVideoInputProps()} />
                  {previewUrl ? (
                    <div className="space-y-2">
                      <FileVideo className="w-8 h-8 text-green-600 mx-auto" />
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {videoFile ? videoFile.name : "Video Selected / Existing"}
                      </p>
                      <p className="text-xs text-gray-500">Click to change video</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-sm font-medium text-gray-700">
                        Drop video here or click to browse
                      </p>
                      <p className="text-xs text-gray-400">MP4, WebM, OGG up to 100MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail Dropzone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Thumbnail
                </label>
                <div
                  {...getThumbnailRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                    thumbnailPreview
                      ? "border-green-400 bg-green-50/20"
                      : "border-gray-200 hover:border-purple-400 bg-gray-50"
                  }`}
                >
                  <input {...getThumbnailInputProps()} />
                  {thumbnailPreview ? (
                    <div className="space-y-2">
                      <img
                        src={thumbnailPreview}
                        alt="Preview"
                        className="w-24 h-16 object-cover rounded-lg mx-auto"
                      />
                      <p className="text-xs text-gray-500">Click to change thumbnail</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Image className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-sm font-medium text-gray-700">
                        Drop thumbnail image or browse
                      </p>
                      <p className="text-xs text-gray-400">JPG, PNG, WebP</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Categories & Subcategories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">Category *</label>
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(!showNewCategory)}
                    className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> New
                  </button>
                </div>
                {showNewCategory ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Category name"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="px-3 bg-purple-600 text-white rounded-xl text-xs"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <select
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c._id || c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Subcategory */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">Subcategory</label>
                  {formData.category && (
                    <button
                      type="button"
                      onClick={() => setShowNewSubcategory(!showNewSubcategory)}
                      className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> New
                    </button>
                  )}
                </div>
                {showNewSubcategory ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubcategory}
                      onChange={(e) => setNewSubcategory(e.target.value)}
                      placeholder="Subcategory name"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubcategory}
                      className="px-3 bg-purple-600 text-white rounded-xl text-xs"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <select
                    value={formData.subcategory}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, subcategory: e.target.value }))
                    }
                    disabled={!formData.category}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  >
                    <option value="">Select subcategory</option>
                    {subcategories.map((s) => (
                      <option key={s._id || s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic / Tag
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, topic: e.target.value }))
                  }
                  placeholder="e.g. State Management"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Progress Bar */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span>Uploading media to cloud storage...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-green-600 text-sm font-medium"
                  >
                    <Check className="w-5 h-5" />
                    <span>{isEditMode ? "Video updated successfully!" : "Video uploaded successfully!"}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isUploading}
                className="ml-auto bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Video...
                  </>
                ) : isEditMode ? (
                  "Update Video Course"
                ) : (
                  "Publish Video Course"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
