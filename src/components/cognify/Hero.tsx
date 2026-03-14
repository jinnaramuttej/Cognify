'use client';

import { 
  BookOpen, 
  BarChart3,
  TrendingUp,
  Target,
  Clock,
} from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative w-full">
      {/* Hero Gradient Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700" />
        <div className="absolute inset-0 w-full h-full bg-[url('/patterns/grid.svg')] opacity-10" />
        <div className="absolute inset-0 w-full h-[800px] flex items-center justify-center">
          <div className="text-center z-10">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-in fade-in-up">
              <span className="text-blue-200">Unlock Your</span>
              <span className="text-white"> Potential</span>
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              AI-powered learning platform with flashcards, tests, and more.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300">
                Get Started
              </button>
              <button className="bg-transparent border border-white text-white hover:bg-white/10 px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300">
                View All Courses
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 pt-32 pb-12 px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            <span className="text-blue-200">Dashboard</span>
          </h2>
          <p className="text-white/60 mb-8">
            AI-generated notes, flashcards, and tests from your documents
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stat Card 1 */}
          <div className="bg-white border border-blue-100 rounded-2xl shadow-lg p-6">
            <div className="mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-slate-900 mb-2">
                  Streak
                </h3>
                <p className="text-slate-600 text-4xl font-bold mt-1">
                  47
                </p>
                <p className="text-blue-600/80">
                  Days
                </p>
              </div>
            </div>
            <div className="text-slate-500">
              <div className="flex justify-between mb-2">
                <span>Goal:</span>
                <span className="text-blue-600">90 Days</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-blue-600 w-[52%]" />
              </div>
            </div>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-white border border-blue-100 rounded-2xl shadow-lg p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Clock className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-900 mb-2">
                Study Time
              </h3>
              <p className="text-blue-600/80 mb-2">
                This Month: 124h 30m
              </p>
            </div>
            <p className="text-slate-500">
              +15% vs last month
            </p>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-white border border-blue-100 rounded-2xl shadow-lg p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-900 mb-2">
                Average
              </h3>
              <p className="text-blue-600/80 mb-2">
                4.1h
              </p>
            </div>
            <p className="text-slate-500">
              per day
            </p>
          </div>

          {/* Stat Card 4 */}
          <div className="bg-white border border-blue-100 rounded-2xl shadow-lg p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-900 mb-2">
                Accuracy
              </h3>
              <p className="text-blue-600/80 mb-2">
                87.4%
              </p>
            </div>
            <p className="text-slate-500">
              Top 15% Rate
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {/* Subject Performance */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Physics
            </h3>
            <p className="text-slate-500">
              Top 3 Subjects needing attention
            </p>
          </div>

          {/* Physics */}
          <div className="bg-white border border-blue-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                72%
              </div>
              <div className="text-blue-600/60 text-sm">
                Physics
              </div>
            </div>
          </div>

          {/* Chemistry */}
          <div className="bg-white border border-blue-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                81%
              </div>
              <div className="text-blue-600/60 text-sm">
                Chemistry
              </div>
            </div>
          </div>

          {/* Biology */}
          <div className="bg-white border border-blue-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                65%
              </div>
              <div className="text-blue-600/60 text-sm">
                Biology
              </div>
            </div>
          </div>

          {/* Math */}
          <div className="bg-white border border-blue-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                89%
              </div>
              <div className="text-slate-500">
                Mathematics
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mt-8">
          <button className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300">
            View Detailed Report
          </button>
        </div>

        {/* Continue Learning */}
        <div className="bg-white border border-blue-100 rounded-2xl p-6 mt-8">
          <div className="flex items-center gap-3">
            <BookOpen className="w-12 h-12 text-blue-600" />
            <div>
              <div className="text-slate-900 font-bold">Continue Learning</div>
              <div className="text-slate-500">Last chapter: Electrostatics</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute inset-0 w-full z-0 pointer-events-none">
        <div className="absolute bottom-0 w-full h-[300px] bg-gradient-to-b from-transparent via-white to-white" />
      </div>
    </div>
  );
}