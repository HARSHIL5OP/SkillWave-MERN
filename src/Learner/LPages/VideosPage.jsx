import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Play, ThumbsUp, Eye, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { videosAPI } from "../../api/videosAPI";
import { usersAPI } from "../../api/usersAPI";

const VideoCard = ({ video, getUserName }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const categoryName = video.category || "General";
  const subcategoryName = video.subcategory || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 flex flex-col cursor-pointer group"
      onClick={() => navigate(`/learner/videos/${video.id || video._id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-gray-900">
        {!imageError ? (
          <img
            src={video.thumbnail || video.thumbnailUrl || video.ThumbnailURL || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800"}
            alt={video.video_title || video.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
            <Play className="w-12 h-12 opacity-50" />
          </div>
        )}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs font-medium text-white">
          {video.duration || "12:34"}
        </div>
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 flex items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full bg-purple-600/90 text-white flex items-center justify-center">
                <Play className="w-6 h-6 fill-current ml-1" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex gap-2 mb-2 flex-wrap">
            {categoryName && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {categoryName}
              </span>
            )}
            {subcategoryName && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {subcategoryName}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors line-clamp-2">
            {video.video_title || video.title}
          </h3>
          <p className="text-sm text-gray-400 mt-1 line-clamp-2">
            {video.description || video.video_description}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700/50 flex items-center justify-between text-xs text-gray-400">
          <span>{video.teacherName || getUserName(video.user_id)}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {video.views || 0}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4" />
              {video.likes || video.likeCount || video.like_count || 0}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("all"); // 'all' or 'preferences'
  const [isLoading, setIsLoading] = useState(true);
  const [preferredCategories, setPreferredCategories] = useState([]);
  const [preferredSubcategories, setPreferredSubcategories] = useState([]);
  const { userId } = useAuth();

  const getUserName = (teacherId) => {
    return "SkillWave Instructor";
  };

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        const fetchedVideos = await videosAPI.getVideos();
        setVideos(fetchedVideos || []);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchPreferences = async () => {
      if (!userId) return;
      try {
        const prefs = await usersAPI.getPreferences(userId);
        if (prefs) {
          setPreferredCategories(prefs.category ? [prefs.category] : []);
          setPreferredSubcategories(prefs.subcategory ? [prefs.subcategory] : []);
        }
      } catch (error) {
        console.error("Error fetching preferences:", error);
      }
    };

    fetchVideos();
    if (viewMode === "preferences") fetchPreferences();
  }, [userId, viewMode]);

  // Extract unique categories
  const categories = [
    "all",
    ...new Set(videos.map((v) => v.category).filter(Boolean)),
  ];

  // Filter videos based on search, category, and view mode
  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      (video.video_title || video.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (video.description || video.video_description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (video.topic || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || video.category === selectedCategory;

    if (viewMode === "preferences") {
      const matchesPrefCategory =
        preferredCategories.length === 0 ||
        preferredCategories.includes(video.category);
      const matchesPrefSubcategory =
        preferredSubcategories.length === 0 ||
        preferredSubcategories.includes(video.subcategory);

      return matchesSearch && matchesPrefCategory && matchesPrefSubcategory;
    }

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header and Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Explore Video Courses
            </h1>
            <p className="text-gray-400 mt-1">
              Level up your developer skills with expert-led tutorials
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode("all")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                viewMode === "all"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              All Courses
            </button>
            <button
              onClick={() => setViewMode("preferences")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                viewMode === "preferences"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              <Filter className="w-4 h-4" />
              For You
            </button>
          </div>
        </div>

        {/* Search and Category Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-800/40 p-4 rounded-2xl border border-gray-700/50">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses by title, topic, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>

          {viewMode === "all" && (
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto py-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {cat === "all" ? "All Tracks" : cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Video Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-gray-800/30 rounded-xl h-72 animate-pulse border border-gray-800"
              />
            ))}
          </div>
        ) : filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredVideos.map((video) => (
                <VideoCard
                  key={video.id || video._id}
                  video={video}
                  getUserName={getUserName}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-800/20 rounded-2xl border border-gray-800">
            <Play className="w-12 h-12 mx-auto text-gray-600 mb-3" />
            <h3 className="text-lg font-medium text-gray-300">No courses found</h3>
            <p className="text-sm text-gray-500 mt-1">
              Try adjusting your search terms or category filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
