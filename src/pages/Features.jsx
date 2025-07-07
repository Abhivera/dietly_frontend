import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, TrendingUp, Clock, Sparkles } from "lucide-react";

export default function Features() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm mb-12">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold text-emerald-700 flex items-center justify-center gap-2">
              <Sparkles className="w-7 h-7 text-emerald-500" />
              Features
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Discover what makes Dietly your ultimate health companion.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap justify-center gap-3 mb-4">
            <Badge
              variant="secondary"
              className="bg-emerald-100 text-emerald-800 px-4 py-2"
            >
              AI Powered
            </Badge>
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 px-4 py-2"
            >
              Nutrition & Calorie Tracking
            </Badge>
            <Badge
              variant="secondary"
              className="bg-purple-100 text-purple-800 px-4 py-2"
            >
              Personalized
            </Badge>
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 px-4 py-2"
            >
              Daily, Weekly, Monthly, Yearly Summaries
            </Badge>
          </CardContent>
        </Card>
        <div className="grid md:grid-cols-4 gap-8">
          <Card className="text-center border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <CardContent className="pt-8 pb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Camera className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-3 text-lg">
                AI Food Recognition
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Instantly identify ingredients and dishes from your meal photos
                with advanced computer vision.
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
                Track your daily meals, calories, and nutrients. Stay on top of
                your health with detailed nutrition analysis and calorie
                counting.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <CardContent className="pt-8 pb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Sparkles className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-3 text-lg">
                Daily, Weekly, Monthly, Yearly Summaries
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Get comprehensive summaries of your nutrition, calories, and
                fitness progress for any time period—daily, weekly, monthly, or
                yearly.
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
                Receive personalized workout suggestions to help you burn
                calories and stay active.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
