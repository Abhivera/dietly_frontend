import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Heart, Users } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold text-emerald-700 flex items-center justify-center gap-2">
              <Sparkles className="w-7 h-7 text-emerald-500" />
              About Dietly
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Empowering healthier lives with AI-driven nutrition and fitness
              insights.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              <Badge
                variant="secondary"
                className="bg-emerald-100 text-emerald-800 px-4 py-2"
              >
                AI Nutrition
              </Badge>
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-800 px-4 py-2"
              >
                Personalized Health
              </Badge>
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-800 px-4 py-2"
              >
                Community
              </Badge>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed text-center">
              <span className="font-semibold text-emerald-700">Dietly</span> is
              on a mission to make healthy living accessible and effortless for
              everyone. By harnessing the power of artificial intelligence, we
              provide instant food recognition, detailed nutrition analysis, and
              actionable exercise recommendations—all from a simple photo of
              your meal.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="flex flex-col items-center text-center">
                <Heart className="w-8 h-8 text-pink-500 mb-2" />
                <h4 className="font-bold text-emerald-700 mb-1">Our Mission</h4>
                <p className="text-gray-600 text-sm">
                  To inspire and empower people to make better food choices,
                  track their nutrition, and achieve their health goals with
                  ease.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Users className="w-8 h-8 text-blue-500 mb-2" />
                <h4 className="font-bold text-emerald-700 mb-1">Why Dietly?</h4>
                <p className="text-gray-600 text-sm">
                  Unlike generic calorie trackers, Dietly uses advanced AI to
                  analyze your actual meals, offering personalized insights and
                  a supportive community to help you stay motivated.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
