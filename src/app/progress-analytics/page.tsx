'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Download, Calendar, Target, BookOpen } from 'lucide-react';

export default function ProgressAnalyticsPage() {
  const handleExport = () => {
    alert('Exporting analytics report as PDF...');
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Progress{' '}
                <span className="text-[#D4AF37]">Analytics</span>
              </h1>
              <p className="text-xl text-[#a0a0a0]">
                Detailed insights into your learning journey and performance metrics
              </p>
            </div>
            <Button
              onClick={handleExport}
              className="bg-[#D4AF37] text-black hover:bg-[#aa8c2c] flex items-center gap-2"
            >
              <Download size={20} />
              Export PDF
            </Button>
          </div>
        </div>
      </section>

      {/* Overview Stats */}
      <section className="py-8 px-4 bg-[#0a0a0a]">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-[#1a1a1a] border-[#D4AF37]/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-6 h-6 text-[#D4AF37]" />
                  <span className="text-[#a0a0a0] text-sm">Total Study Time</span>
                </div>
                <div className="text-3xl font-bold text-white">124h 30m</div>
                <p className="text-green-400 text-sm mt-1">+15% from last month</p>
              </CardContent>
            </Card>
            <Card className="bg-[#1a1a1a] border-[#D4AF37]/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-6 h-6 text-[#D4AF37]" />
                  <span className="text-[#a0a0a0] text-sm">Accuracy</span>
                </div>
                <div className="text-3xl font-bold text-white">87.4%</div>
                <p className="text-green-400 text-sm mt-1">+3.2% improvement</p>
              </CardContent>
            </Card>
            <Card className="bg-[#1a1a1a] border-[#D4AF37]/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-6 h-6 text-[#D4AF37]" />
                  <span className="text-[#a0a0a0] text-sm">Questions Attempted</span>
                </div>
                <div className="text-3xl font-bold text-white">2,295</div>
                <p className="text-[#a0a0a0] text-sm mt-1">500 this week</p>
              </CardContent>
            </Card>
            <Card className="bg-[#1a1a1a] border-[#D4AF37]/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-[#D4AF37]" />
                  <span className="text-[#a0a0a0] text-sm">Current Streak</span>
                </div>
                <div className="text-3xl font-bold text-white">47 days</div>
                <p className="text-[#D4AF37] text-sm mt-1">Keep it up!</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Subject Performance */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-8">Subject Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#0a0a0a] border-[#D4AF37]/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Physics</h3>
                  <span className="text-2xl font-bold text-[#D4AF37]">72%</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#a0a0a0]">Mechanics</span>
                      <span className="text-white">78%</span>
                    </div>
                    <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div className="h-full bg-[#D4AF37]" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#a0a0a0]">Thermodynamics</span>
                      <span className="text-white">65%</span>
                    </div>
                    <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div className="h-full bg-[#D4AF37]" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#a0a0a0]">Electricity</span>
                      <span className="text-white">73%</span>
                    </div>
                    <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div className="h-full bg-[#D4AF37]" style={{ width: '73%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0a0a0a] border-[#D4AF37]/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Chemistry</h3>
                  <span className="text-2xl font-bold text-[#D4AF37]">81%</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#a0a0a0]">Organic</span>
                      <span className="text-white">85%</span>
                    </div>
                    <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div className="h-full bg-[#D4AF37]" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#a0a0a0]">Inorganic</span>
                      <span className="text-white">76%</span>
                    </div>
                    <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div className="h-full bg-[#D4AF37]" style={{ width: '76%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#a0a0a0]">Physical</span>
                      <span className="text-white">82%</span>
                    </div>
                    <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div className="h-full bg-[#D4AF37]" style={{ width: '82%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0a0a0a] border-[#D4AF37]/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Mathematics</h3>
                  <span className="text-2xl font-bold text-[#D4AF37]">89%</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#a0a0a0]">Calculus</span>
                      <span className="text-white">92%</span>
                    </div>
                    <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div className="h-full bg-[#D4AF37]" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#a0a0a0]">Algebra</span>
                      <span className="text-white">88%</span>
                    </div>
                    <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div className="h-full bg-[#D4AF37]" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#a0a0a0]">Geometry</span>
                      <span className="text-white">87%</span>
                    </div>
                    <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div className="h-full bg-[#D4AF37]" style={{ width: '87%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0a0a0a] border-[#D4AF37]/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Biology</h3>
                  <span className="text-2xl font-bold text-[#D4AF37]">85%</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#a0a0a0]">Zoology</span>
                      <span className="text-white">82%</span>
                    </div>
                    <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div className="h-full bg-[#D4AF37]" style={{ width: '82%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#a0a0a0]">Botany</span>
                      <span className="text-white">88%</span>
                    </div>
                    <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div className="h-full bg-[#D4AF37]" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#a0a0a0]">Genetics</span>
                      <span className="text-white">85%</span>
                    </div>
                    <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div className="h-full bg-[#D4AF37]" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="py-16 px-4 bg-[#0a0a0a]">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-white mb-8">30-Day History</h2>
          <Card className="bg-[#1a1a1a] border-[#D4AF37]/20">
            <CardContent className="pt-6">
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 30 }).map((_, index) => {
                  const hours = Math.random() * 8;
                  const intensity = hours > 4 ? 'bg-[#D4AF37]' : hours > 2 ? 'bg-[#D4AF37]/60' : hours > 0 ? 'bg-[#D4AF37]/30' : 'bg-[#D4AF37]/10';
                  return (
                    <div
                      key={index}
                      className="aspect-square rounded flex items-center justify-center text-xs text-white"
                      title={`${hours.toFixed(1)} hours`}
                    >
                      {index + 1}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm text-[#a0a0a0]">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#D4AF37]/10"></div>
                  <span>0-2h</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#D4AF37]/30"></div>
                  <span>2-4h</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#D4AF37]/60"></div>
                  <span>4-6h</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#D4AF37]"></div>
                  <span>6h+</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
