import React, { useState, useEffect } from "react";
import { Card } from "../LComponents/UI/card";
import { Button } from "../LComponents/UI/Button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../LComponents/UI/select";
import { useAuth } from "../../context/AuthContext";
import { categoriesAPI } from "../../api/categoriesAPI";
import { usersAPI } from "../../api/usersAPI";

export default function PreferencesPage() {
  const { user, userId, updateUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [formData, setFormData] = useState({
    currentSkills: "",
    desiredSkills: "",
    futureGoals: "",
    category: "",
    subcategory: "",
  });

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesAPI.getCategories();
        setCategoriesList(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch user preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!userId) return;
      try {
        const prefs = await usersAPI.getPreferences(userId);
        if (prefs) {
          setFormData({
            currentSkills: (prefs.currentSkills || []).join(", "),
            desiredSkills: (prefs.wantToLearn || []).join(", "),
            futureGoals: prefs.futureGoals || "",
            category: prefs.category || "",
            subcategory: prefs.subcategory || "",
          });
        }
      } catch (error) {
        console.error("Error fetching preferences:", error);
      }
    };

    fetchPreferences();
  }, [userId]);

  // Update subcategories when category changes
  useEffect(() => {
    if (!formData.category) {
      setSubcategories([]);
      return;
    }

    const matchedCategory = categoriesList.find(
      (c) => c.name === formData.category || c._id === formData.category
    );

    if (matchedCategory && matchedCategory.subcategories) {
      setSubcategories(matchedCategory.subcategories.map((s) => ({
        id: s._id || s.name,
        name: s.name,
      })));
    } else {
      setSubcategories([]);
    }
  }, [formData.category, categoriesList]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const currentSkillsArray = formData.currentSkills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    const desiredSkillsArray = formData.desiredSkills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    try {
      if (userId) {
        const payload = {
          category: formData.category,
          subcategory: formData.subcategory,
          currentSkills: currentSkillsArray,
          wantToLearn: desiredSkillsArray,
          futureGoals: formData.futureGoals,
        };

        await usersAPI.updatePreferences(userId, payload);
        updateUserProfile({ preferences: payload });
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving preferences: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Learning Preferences
          </h1>
          <p className="text-gray-400 mt-2">
            Customize your learning journey and get personalized recommendations
          </p>
        </div>

        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-xl p-8 rounded-2xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">
                  Primary Learning Track
                </label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: value,
                      subcategory: "",
                    }))
                  }
                >
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white rounded-xl">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    {categoriesList.map((category) => (
                      <SelectItem
                        key={category._id || category.name}
                        value={category.name}
                        className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subcategory Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">
                  Specialization Focus
                </label>
                <Select
                  value={formData.subcategory}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, subcategory: value }))
                  }
                  disabled={!formData.category}
                >
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white rounded-xl disabled:opacity-50">
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    {subcategories.map((sub) => (
                      <SelectItem
                        key={sub.id || sub.name}
                        value={sub.name}
                        className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
                      >
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Current Skills */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Current Skills (comma-separated)
              </label>
              <input
                type="text"
                value={formData.currentSkills}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    currentSkills: e.target.value,
                  }))
                }
                placeholder="e.g., JavaScript, HTML, CSS, Git"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Desired Skills */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Skills You Want to Master (comma-separated)
              </label>
              <input
                type="text"
                value={formData.desiredSkills}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    desiredSkills: e.target.value,
                  }))
                }
                placeholder="e.g., React, Node.js, MongoDB, Docker"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Future Goals */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Career Goals & Vision
              </label>
              <textarea
                rows="4"
                value={formData.futureGoals}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    futureGoals: e.target.value,
                  }))
                }
                placeholder="Describe your target career role, dream projects, or learning milestones..."
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center text-green-400 gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Preferences updated successfully!</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                disabled={isLoading}
                className="ml-auto bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Preferences"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
