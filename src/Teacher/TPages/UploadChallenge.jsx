import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "../TComponents/UI/Card";
import { Button } from "../TComponents/UI/Button";
import { Upload, ArrowLeft, Loader2, X, Check, FileText } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { challengesAPI } from "../../api/challengesAPI";
import { uploadPDFToCloudinary } from "../TUploads/Cloudinary";

export default function UploadChallenge({ isAdminEdit }) {
  const location = useLocation();
  const propEditData = location.state?.editData || null;
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    problemStatement: null,
    solution: null,
  });

  const onDrop = (fileType) => (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type === "application/pdf") {
      setFormData((prev) => ({ ...prev, [fileType]: file }));
    }
  };

  useEffect(() => {
    if (propEditData) {
      setFormData({
        title: propEditData.title || propEditData.content_title || "",
        description: propEditData.description || propEditData.content_description || "",
        problemStatement: propEditData.problemStatementUrl || propEditData.problemStatementURL || null,
        solution: propEditData.solutionUrl || propEditData.solutionURL || null,
      });
    }
  }, [propEditData]);

  const {
    getRootProps: getProblemStatementRootProps,
    getInputProps: getProblemStatementInputProps,
  } = useDropzone({
    onDrop: onDrop("problemStatement"),
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const {
    getRootProps: getSolutionRootProps,
    getInputProps: getSolutionInputProps,
  } = useDropzone({
    onDrop: onDrop("solution"),
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.title.trim()) {
      setErrorMsg("Challenge title is required");
      return;
    }
    if (!formData.problemStatement) {
      setErrorMsg("Please upload a Problem Statement PDF");
      return;
    }

    setIsLoading(true);
    setUploadProgress(20);

    try {
      let problemURL = typeof formData.problemStatement === "string" ? formData.problemStatement : "";
      let solutionURL = typeof formData.solution === "string" ? formData.solution : "";

      if (formData.problemStatement && typeof formData.problemStatement !== "string") {
        setUploadProgress(40);
        problemURL = await uploadPDFToCloudinary(formData.problemStatement);
      }

      if (formData.solution && typeof formData.solution !== "string") {
        setUploadProgress(70);
        solutionURL = await uploadPDFToCloudinary(formData.solution);
      }

      setUploadProgress(90);

      const payload = {
        title: formData.title,
        description: formData.description,
        problemStatementUrl: problemURL,
        solutionUrl: solutionURL,
      };

      if (propEditData) {
        await challengesAPI.updateChallenge(propEditData.id || propEditData._id, payload);
        setShowSuccess(true);
        setTimeout(() => {
          if (isAdminEdit) {
            navigate("/admin/content");
          } else {
            navigate("/teacher/challenges");
          }
        }, 1500);
      } else {
        await challengesAPI.createChallenge(payload);
        setShowSuccess(true);
        setTimeout(() => navigate("/teacher/challenges"), 1500);
      }

      setUploadProgress(100);
    } catch (error) {
      console.error("Error uploading challenge:", error);
      setErrorMsg(error.response?.data?.message || error.message || "Failed to save challenge");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {propEditData ? "Edit Coding Challenge" : "Upload New Coding Challenge"}
          </h1>
          <p className="text-sm text-gray-500">
            Publish interactive programming challenges with problem statements and solution guides
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {errorMsg}
        </div>
      )}

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2 text-sm font-medium"
          >
            <Check className="w-5 h-5 text-green-600" />
            <span>Challenge saved successfully! Redirecting...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Challenge Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Reverse Linked List Algorithm"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Challenge Description
            </label>
            <textarea
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Brief overview of the algorithm, complexity goals, or constraints..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white text-sm"
            />
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Problem Statement PDF */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Problem Statement (PDF) *
              </label>
              <div
                {...getProblemStatementRootProps()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                  formData.problemStatement
                    ? "border-green-400 bg-green-50/20"
                    : "border-gray-200 hover:border-purple-400 bg-gray-50"
                }`}
              >
                <input {...getProblemStatementInputProps()} />
                {formData.problemStatement ? (
                  <div className="space-y-2">
                    <FileText className="w-8 h-8 text-green-600 mx-auto" />
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {typeof formData.problemStatement === "string"
                        ? "PDF Document Attached"
                        : formData.problemStatement.name}
                    </p>
                    <p className="text-xs text-gray-500">Click to change document</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-sm font-medium text-gray-700">Drop problem PDF here</p>
                    <p className="text-xs text-gray-400">PDF up to 25MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Solution PDF */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Solution Guide (PDF)
              </label>
              <div
                {...getSolutionRootProps()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                  formData.solution
                    ? "border-green-400 bg-green-50/20"
                    : "border-gray-200 hover:border-purple-400 bg-gray-50"
                }`}
              >
                <input {...getSolutionInputProps()} />
                {formData.solution ? (
                  <div className="space-y-2">
                    <FileText className="w-8 h-8 text-green-600 mx-auto" />
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {typeof formData.solution === "string"
                        ? "Solution Guide Attached"
                        : formData.solution.name}
                    </p>
                    <p className="text-xs text-gray-500">Click to change document</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-sm font-medium text-gray-700">Drop solution PDF here</p>
                    <p className="text-xs text-gray-400">PDF up to 25MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress */}
          {isLoading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500 font-medium">
                <span>Uploading documents to cloud...</span>
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
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Challenge...
                </>
              ) : propEditData ? (
                "Update Challenge"
              ) : (
                "Publish Challenge"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
