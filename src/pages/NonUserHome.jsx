import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Trash,
  Camera,
  TrendingUp,
  Target,
  Clock,
  Pizza,
  Sparkles,
  BarChart3,
  User,
  Calendar,
  History,
  Trophy,
  Heart,
  Apple,
  BarChart,
  Dumbbell,
  LineChart,
  Upload,
} from "lucide-react";
import { publicAnalyzeFood } from "@/api/images";

const NonUserHome = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [rateLimit, setRateLimit] = useState(null);
  const [description, setDescription] = useState("");

  const showToast = (message, type = "info") => {
    // Simple toast notification
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 ${
      type === "error"
        ? "bg-red-500"
        : type === "success"
        ? "bg-green-500"
        : "bg-blue-500"
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/bmp",
        "image/svg+xml",
      ];
      if (!allowedTypes.includes(file.type)) {
        showToast(
          "Only image files (jpg, png, gif, webp, bmp, svg) are allowed",
          "error"
        );
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast("Image size should be less than 10MB", "error");
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeFood = async () => {
    if (!selectedImage) {
      showToast("Please select an image first", "error");
      return;
    }

    setIsAnalyzing(true);

    try {
      const data = await publicAnalyzeFood(selectedImage, description);

      if (data.success) {
        setAnalysis(data.analysis);
        setRateLimit(data.rate_limit);
        showToast("Food analysis completed!", "success");
      } else {
        throw new Error("Analysis failed");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      showToast("Failed to analyze food. Please try again.", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysis(null);
    setDescription(""); // clear description
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-2">
        <div className="text-center mb-2 sm:mb-2">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Pizza className="w-4 h-4 animate-bounce" />
            Your Personalised Calorie Tracker
          </div>
        </div>
        <div className="text-center mb-2">
          <div className="text-center pb-2">
            <h2 className="federo-font  text-emerald-800 text-4xl font-bold mb-4">
              Why Choose Dietly?
            </h2>
            <p className="text-emerald-600 text-lg px-4 sm:px-8 text-center">
              Smart nutrition tracking with AI-powered insights and
              comprehensive reporting
            </p>
          </div>
        </div>

        <div className="w-full mt-4 text-emerald-700 px-4 sm:px-8">
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="bg-emerald-600 text-white hover:bg-emerald-300 font-semibold px-8 py-4 rounded-xl transition-all transform hover:scale-105"
              >
                <a href="/register">
                  <User className="w-5 h-5 mr-2" />
                  Sign Up for Free
                </a>
              </Button>
            </div>
          </div>
        </div>

        <Card className="group max-w-4xl mx-auto bg-transparent border-none shadow-none rounded-none">
          <CardContent className="space-y-8">
            {/* Image Upload Section */}
            {!imagePreview ? (
              <div className="border-2 border-dashed border-emerald-500 rounded-xl p-6 text-center bg-transparent">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-120">
                      <Upload className="w-10 h-10 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-xl mb-2">
                        Upload Food Image for Analysis
                      </p>
                      <p className="hidden sm:block text-gray-500 mb-2">
                        Click to select or drag and drop your image here
                      </p>
                      <p className="hidden sm:block text-sm text-gray-400">
                        Supports JPG, PNG (max 10MB)
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative group w-full max-w-md mx-auto rounded-xl overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Selected food"
                    className="w-full h-auto object-cover rounded-xl"
                  />

                  {/* Overlay with transparent background */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={resetAnalysis}
                      className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-lg transition-colors duration-200"
                    >
                      <Trash size={20} />
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional : Add a description e.g. 2 chocolates bar "
                    className="w-full max-w-md mx-auto mt-2 px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-700 bg-white"
                  />
                </div>

                {!analysis && (
                  <div className="text-center">
                    <Button
                      onClick={analyzeFood}
                      disabled={isAnalyzing}
                      size="lg"
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-xl font-semibold"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                          Analyzing Magic...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Analyze Food
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Analysis Results */}
            {analysis && (
              <div className="space-y-6 animate-fade-in">
                <Separator className="bg-gradient-to-r from-emerald-200 to-teal-200 h-0.5" />

                {analysis.is_food ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Food Items & Description */}
                    <Card className="bg-transparent border-none shadow-none rounded-none">
                      <CardHeader>
                        <CardTitle className="text-lg text-emerald-800 flex items-center gap-2">
                          <Target className="w-5 h-5" />
                          Food Detected
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {analysis.food_items.map((item, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            >
                              {item}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {analysis.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-gray-500">
                            Confidence: {Math.round(analysis.confidence * 100)}%
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Nutrition Facts */}
                    <Card className="bg-transparent border-none shadow-none rounded-none">
                      <CardHeader>
                        <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5" />
                          Nutrition Facts
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold text-blue-800 mb-4 text-center">
                          {analysis.calories}{" "}
                          <span className="text-lg font-normal text-gray-600">
                            calories
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 rounded-lg">
                            <div className="font-semibold text-gray-800 text-lg">
                              {analysis.nutrients.protein}g
                            </div>
                            <div className="text-sm text-gray-600">Protein</div>
                          </div>
                          <div className="text-center p-3 rounded-lg">
                            <div className="font-semibold text-gray-800 text-lg">
                              {analysis.nutrients.carbs}g
                            </div>
                            <div className="text-sm text-gray-600">Carbs</div>
                          </div>
                          <div className="text-center p-3 rounded-lg">
                            <div className="font-semibold text-gray-800 text-lg">
                              {analysis.nutrients.fat}g
                            </div>
                            <div className="text-sm text-gray-600">Fat</div>
                          </div>
                          <div className="text-center p-3 rounded-lg">
                            <div className="font-semibold text-gray-800 text-lg">
                              {analysis.nutrients.sugar}g
                            </div>
                            <div className="text-sm text-gray-600">Sugar</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Exercise Recommendations */}
                    <Card className="bg-transparent border-none shadow-none rounded-none md:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-lg text-purple-800 flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          Exercise Recommendations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-6 justify-center">
                          <div className="flex-1 min-w-[200px] text-center">
                            <div className="text-3xl font-bold text-purple-800 mb-2">
                              {analysis.exercise_recommendations.steps}
                            </div>
                            <div className="text-sm text-gray-600">
                              Steps to burn these calories
                            </div>
                          </div>
                          <div className="flex-1 min-w-[200px] text-center">
                            <div className="text-3xl font-bold text-purple-800 mb-2">
                              {analysis.exercise_recommendations.walking_km} km
                            </div>
                            <div className="text-sm text-gray-600">
                              Walking distance needed
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card className="bg-transparent border-none shadow-none rounded-none">
                    <CardContent className="text-center py-8">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Camera className="w-8 h-8 text-red-600" />
                      </div>
                      <p className="text-red-800 font-semibold text-lg mb-2">
                        No food detected in this image
                      </p>
                      <p className="text-red-600 text-sm">
                        Please upload an image containing food for analysis
                      </p>
                    </CardContent>
                  </Card>
                )}

                {rateLimit && (
                  <div className="text-center p-4">
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold text-emerald-600">
                        {rateLimit.remaining_requests}
                      </span>{" "}
                      analysis remaining today
                      <span className="text-gray-400">
                        {" "}
                        ({rateLimit.limit} limit per {rateLimit.period})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        <div className="flex flex-wrap justify-center gap-4 mb-2">
          <Badge className="bg-transparent border-none text-emerald-800 px-4 shadow-none flex items-center gap-2">
            <Apple size={16} /> Instant Recognition
          </Badge>
          <Badge className="bg-transparent border-none text-emerald-800 px-4 shadow-none flex items-center gap-2">
            <BarChart size={16} /> Smart Tracking
          </Badge>
          <Badge className="bg-transparent border-none text-emerald-800 px-4 shadow-none flex items-center gap-2">
            <Dumbbell size={16} /> Workout Plans
          </Badge>
          <Badge className="bg-transparent border-none text-emerald-800 px-4 shadow-none flex items-center gap-2">
            <LineChart size={16} /> Progress Reports
          </Badge>
        </div>

        <div className="mt-2 bg-white bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          <div className="px-4 sm:px-8  bg-white text-gray-800">
            {/* Premium Features Highlight */}
            <div className="mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-200">
              <div className="text-center mb-8">
                <Trophy className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h3 className="federo-font  text-2xl font-bold text-emerald-800 mb-2">
                  Unlock Your Full Potential
                </h3>
                <p className="text-emerald-700">
                  Sign up now to access advanced tracking and comprehensive
                  reporting
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white/80 rounded-xl">
                  <Calendar className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-800 mb-1">
                    Daily Tracking
                  </h4>
                  <p className="text-sm text-gray-600">
                    Log every meal with automatic calorie counting
                  </p>
                </div>
                <div className="text-center p-4 bg-white/80 rounded-xl">
                  <BarChart3 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-800 mb-1">
                    Progress Analytics
                  </h4>
                  <p className="text-sm text-gray-600">
                    Visual charts and trends over time
                  </p>
                </div>
                <div className="text-center p-4 bg-white/80 rounded-xl">
                  <Heart className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-800 mb-1">
                    Health Insights
                  </h4>
                  <p className="text-sm text-gray-600">
                    Personalized recommendations and tips
                  </p>
                </div>
              </div>
            </div>
            {/* Login CTA */}
            <div className="w-full mt-6  text-emerald-700 px-4 sm:px-8 py-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="w-8 h-8 text-emerald-700" />
                </div>

                <h3 className="federo-font text-3xl font-bold mb-4">
                  Ready to Transform Your Health?
                </h3>
                <p className="text-emerald-600 text-lg px-4 mb-8 sm:px-8 text-center">
                  Join thousands of users already tracking their nutrition with
                  AI. Save your meal history,
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    variant="secondary"
                    className="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold px-8 py-4 rounded-xl transition-all transform hover:scale-105"
                  >
                    <a href="/register">
                      <User className="w-5 h-5 mr-2" />
                      Sign Up for Free
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-10 text-center text-gray-500 text-sm">
          <p>© 2025 Dietly. Transforming health and fitness analysis.</p>
        </footer>
      </div>
    </div>
  );
};

export default NonUserHome;
