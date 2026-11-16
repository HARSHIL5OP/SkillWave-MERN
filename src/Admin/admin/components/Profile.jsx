import React, { useState, useEffect, useRef } from "react";
import { Camera, Lock, Mail, Phone, MapPin, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { usersAPI } from "../../../api/usersAPI";
import { uploadThumbnailToCloudinary } from "../../../Teacher/TUploads/Cloudinary";

const Profile = () => {
  const { user, updateUserState } = useAuth();
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "••••••••",
    profileImage: ""
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        password: "••••••••",
        profileImage: user.profileImage || ""
      });
    }
  }, [user]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      setUploadError("Please upload a valid image (JPEG, PNG, GIF, WEBP)");
      return;
    }
    
    if (file.size > maxSize) {
      setUploadError("Image size must be less than 5MB");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");
      
      const imageUrl = await uploadThumbnailToCloudinary(file);
      const userId = user?._id || user?.id;

      if (userId) {
        await usersAPI.updateUser(userId, { profileImage: imageUrl });
        if (updateUserState) {
          updateUserState({ ...user, profileImage: imageUrl });
        }
      }

      setProfileData(prev => ({
        ...prev,
        profileImage: imageUrl
      }));

    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadError("Failed to upload profile image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handlePasswordUpdate = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setSaving(true);
      const userId = user?._id || user?.id;
      if (userId) {
        await usersAPI.updateUser(userId, { password: newPassword });
        alert("Password updated successfully");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      alert(error.response?.data?.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setSaving(true);
      const userId = user?._id || user?.id;
      if (userId) {
        const updatePayload = {
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          address: profileData.address
        };
        await usersAPI.updateUser(userId, updatePayload);
        if (updateUserState) {
          updateUserState({ ...user, ...updatePayload });
        }
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Profile Settings</h2>

      <div className="bg-white shadow-lg rounded-xl p-6">
        <div className="flex items-center space-x-8">
          <div className="relative">
            <img
              src={profileData.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-indigo-100"
            />
            <button 
              onClick={triggerFileInput}
              disabled={uploading}
              className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full text-white hover:bg-indigo-700 transition-colors disabled:bg-gray-400 shadow-md"
              title="Upload new photo"
            >
              {uploading ? (
                <span className="animate-spin inline-block text-xs">⏳</span>
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            {uploadError && (
              <p className="text-red-500 text-sm mt-2">{uploadError}</p>
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              {profileData.name || user?.name || "Administrator"}
            </h3>
            <p className="text-gray-500 capitalize">{user?.role || "Admin"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Personal Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                value={profileData.name}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  name="email"
                  className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  value={profileData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  type="tel"
                  name="phone"
                  className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  value={profileData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <MapPin className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="address"
                  className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  value={profileData.address}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleProfileUpdate}
                disabled={saving}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Update Details"}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Security Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Current Password Status
              </label>
              <div className="mt-1 flex rounded-md shadow-sm relative">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 pr-10 p-2 border bg-gray-50"
                  value={profileData.password}
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Passwords are securely hashed with bcrypt on the server.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1 flex rounded-md shadow-sm relative">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={newPasswordVisible ? "text" : "password"}
                  className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 pr-10 p-2 border"
                  placeholder="Enter new password (min. 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setNewPasswordVisible(!newPasswordVisible)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {newPasswordVisible ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="mt-1 flex rounded-md shadow-sm relative">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={confirmPasswordVisible ? "text" : "password"}
                  className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 pr-10 p-2 border"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {confirmPasswordVisible ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handlePasswordUpdate}
                disabled={saving}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {saving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
