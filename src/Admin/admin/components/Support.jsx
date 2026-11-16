import React, { useEffect, useState } from "react";
import { MessageCircle, Trash2, ExternalLink, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { videosAPI } from "../../../api/videosAPI";

const Support = () => {
  const [reportedVideos, setReportedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const navigate = useNavigate();

  const fetchReportedVideos = async () => {
    try {
      setLoading(true);
      const res = await videosAPI.getVideos();
      const allVideos = res.data || res || [];
      // Filter videos that have reports or show flagged videos
      const flagged = allVideos.filter(v => (v.reports_count || v.reports?.length || 0) > 0);
      setReportedVideos(flagged.length > 0 ? flagged : allVideos.slice(0, 5)); // show recent if none reported
    } catch (error) {
      console.error("Error fetching reported videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportedVideos();
  }, []);

  const handleVideoReports = (videoId) => {
    navigate(`/learner/video/${videoId}`);
  };

  const handleDeleteVideo = async () => {
    if (!selectedVideo) return;
    try {
      const vId = selectedVideo._id || selectedVideo.id;
      await videosAPI.deleteVideo(vId);
      setShowDeleteModal(false);
      setSelectedVideo(null);
      setReportedVideos(prev => prev.filter(vid => (vid._id || vid.id) !== vId));
    } catch (error) {
      console.error("Error deleting video:", error);
      alert("Failed to delete video");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reported & Moderated Content</h2>
          <p className="text-gray-500 text-sm mt-1">Review flagged videos, user complaints, and moderation actions.</p>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading reported videos...</div>
        ) : reportedVideos.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-lg font-medium">All clear!</p>
            <p className="text-sm">There are currently no flagged or reported videos requiring review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Video Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Likes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reports
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportedVideos.map((video) => {
                  const vId = video._id || video.id;
                  const uploader = typeof video.user_id === "object" ? video.user_id?.name : (video.userName || "Instructor");
                  const dateStr = video.createdAt || video.upload_date;
                  const formattedDate = dateStr ? new Date(dateStr).toLocaleDateString() : "N/A";
                  const reportCount = video.reports_count || video.reports?.length || 0;

                  return (
                    <tr key={vId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <MessageCircle className="h-5 w-5 text-indigo-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {video.video_title || video.title}
                            </div>
                            <div className="text-xs text-gray-400">ID: {vId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{uploader}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formattedDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {video.like_count || video.likes?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ⭐ {video.average_rating ? Number(video.average_rating).toFixed(1) : "0.0"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-rose-600">
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          <AlertTriangle className="h-3 w-3" />
                          {reportCount} Reports
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1"
                            onClick={() => handleVideoReports(vId)}
                          >
                            <ExternalLink className="h-4 w-4" /> View
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                            onClick={() => {
                              setSelectedVideo(video);
                              setShowDeleteModal(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {showDeleteModal && selectedVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Video</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-red-600">
                  "{selectedVideo.video_title || selectedVideo.title}"
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedVideo(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteVideo}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Support;
