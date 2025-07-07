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
  Upload,
  Camera,
  TrendingUp,
  Target,
  Clock,
  Zap,
  Sparkles,
  BarChart3,
  User,
} from "lucide-react";

const Index = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [rateLimit, setRateLimit] = useState(null);

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
      const formData = new FormData();
      formData.append("file", selectedImage);

      const response = await fetch(
        "https://dietly-backend.onrender.com/api/v1/public/analyze-food",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="https://myabhibucket30june2025.s3.ap-south-1.amazonaws.com/default_media/dietly_logo.png"
                alt="Dietly Logo"
                className="w-8 h-8 rounded-lg object-contain"
              />
            </div>
            <div className="flex items-center gap-4">
              <Button
                asChild
                variant="ghost"
                className="text-gray-600 hover:text-emerald-600"
              >
                <a href="/about">About</a>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="text-gray-600 hover:text-emerald-600"
              >
                <a href="/features">Features</a>
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                <a href="/login">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-pulse">
            <Zap className="w-4 h-4" />
            AI-Powered Food Analysis
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
            Welcome to Dietly
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Analyze your meals instantly with AI, track calories automatically,
            and get personalized exercise recommendations. Simply snap a photo
            and let our AI do the rest.
            <br />
            <span className="font-semibold text-emerald-700">
              Track your nutrition, calories, and meals daily
            </span>
            —and view your{" "}
            <span className="font-semibold text-emerald-700">
              weekly, monthly, and yearly fitness summaries
            </span>{" "}
            to stay on top of your health journey.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge
              variant="secondary"
              className="bg-emerald-100 text-emerald-800 px-4 py-2"
            >
              🍎 Food Recognition
            </Badge>
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 px-4 py-2"
            >
              📊 Nutrition & Calorie Tracking
            </Badge>
            <Badge
              variant="secondary"
              className="bg-purple-100 text-purple-800 px-4 py-2"
            >
              🏃‍♂️ Exercise Recommendations
            </Badge>
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 px-4 py-2"
            >
              📅 Daily, Weekly, Monthly, Yearly Summaries
            </Badge>
          </div>
        </div>

        {/* Main Analysis Card */}
        <Card className="max-w-4xl mx-auto shadow-2xl border-0 bg-white/70 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <Camera className="w-6 h-6 text-emerald-600" />
              Food Image Analysis
            </CardTitle>
            <CardDescription className="text-gray-600">
              Upload a photo of your meal to get instant nutritional insights
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Image Upload Section */}
            {!imagePreview ? (
              <div className="border-2 border-dashed border-emerald-300 rounded-xl p-12 text-center bg-gradient-to-br from-emerald-50/50 to-teal-50/50 hover:from-emerald-50 hover:to-teal-50 transition-all duration-300 hover:scale-[1.02]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center shadow-lg">
                      <Camera className="w-10 h-10 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-gray-700 mb-2">
                        Upload Food Image
                      </p>
                      <p className="text-gray-500 mb-2">
                        Click to select or drag and drop your image here
                      </p>
                      <p className="text-sm text-gray-400">
                        Supports JPG, PNG (max 10MB)
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Selected food"
                    className="w-full max-w-md mx-auto rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={resetAnalysis}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Remove
                  </Button>
                </div>

                {!analysis && (
                  <div className="text-center">
                    <Button
                      onClick={analyzeFood}
                      disabled={isAnalyzing}
                      size="lg"
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
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
                    <Card className="border border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-emerald-50/30 hover:shadow-lg transition-all duration-300">
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
                              className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
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
                    <Card className="border border-blue-200 bg-gradient-to-br from-blue-50/50 to-blue-50/30 hover:shadow-lg transition-all duration-300">
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
                          <div className="text-center p-3 bg-white/80 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="font-semibold text-gray-800 text-lg">
                              {analysis.nutrients.protein}g
                            </div>
                            <div className="text-sm text-gray-600">Protein</div>
                          </div>
                          <div className="text-center p-3 bg-white/80 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="font-semibold text-gray-800 text-lg">
                              {analysis.nutrients.carbs}g
                            </div>
                            <div className="text-sm text-gray-600">Carbs</div>
                          </div>
                          <div className="text-center p-3 bg-white/80 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="font-semibold text-gray-800 text-lg">
                              {analysis.nutrients.fat}g
                            </div>
                            <div className="text-sm text-gray-600">Fat</div>
                          </div>
                          <div className="text-center p-3 bg-white/80 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="font-semibold text-gray-800 text-lg">
                              {analysis.nutrients.sugar}g
                            </div>
                            <div className="text-sm text-gray-600">Sugar</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Exercise Recommendations */}
                    <Card className="border border-purple-200 bg-gradient-to-br from-purple-50/50 to-purple-50/30 md:col-span-2 hover:shadow-lg transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="text-lg text-purple-800 flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          Exercise Recommendations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-6 justify-center">
                          <div className="flex-1 min-w-[200px] p-6 bg-white/80 rounded-lg shadow-sm hover:shadow-md transition-all text-center">
                            <div className="text-3xl font-bold text-purple-800 mb-2">
                              {analysis.exercise_recommendations.steps}
                            </div>
                            <div className="text-sm text-gray-600">
                              Steps to burn these calories
                            </div>
                          </div>
                          <div className="flex-1 min-w-[200px] p-6 bg-white/80 rounded-lg shadow-sm hover:shadow-md transition-all text-center">
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
                  <Card className="border border-red-200 bg-gradient-to-br from-red-50 to-red-50/50">
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

                {/* Rate Limit Info */}
                {rateLimit && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
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

        {/* Login CTA */}
        <Card className="max-w-4xl mx-auto mt-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white border-0 shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 animate-pulse"></div>
          <CardContent className="text-center py-12 relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold mb-4">
              Ready to Track Your Journey?
            </h3>
            <p className="text-emerald-100 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
              Create your free account to save meal history, track daily
              calories, set goals, and get personalized nutrition insights. Join
              thousands of users already transforming their eating habits!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="bg-white text-emerald-600 hover:bg-gray-100 font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <a href="/register">
                  <User className="w-5 h-5 mr-2" />
                  Sign Up for Free
                </a>
              </Button>
              {/* <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-xl"
              >
                Learn More
              </Button> */}
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <Card className="text-center border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <CardContent className="pt-8 pb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Camera className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-3 text-lg">
                AI Food Recognition
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Advanced computer vision identifies ingredients and dishes from
                photos with 95%+ accuracy
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <CardContent className="pt-8 pb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-3 text-lg">
                Nutrition & Calorie Tracking
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Track your daily meals, calories, and nutrients. Get insights
                and summaries for each day, week, month, and year to monitor
                your progress and stay motivated.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <CardContent className="pt-8 pb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-3 text-lg">
                Exercise Recommendations
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Personalized workout suggestions to help you balance calorie
                intake with physical activity
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center text-gray-500 text-sm">
          <p>© 2025 Dietly. Transforming health and fitness analysis.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
