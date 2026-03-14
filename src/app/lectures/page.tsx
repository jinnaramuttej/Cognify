'use client';

import { useState } from 'react';
import Sidebar from '@/components/cognify/Sidebar';
import {
  Search,
  PlayCircle,
  User,
  BookOpen,
  Radio,
  Target,
  Play,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';

/* -------------------- Types -------------------- */
type Video = {
  id: number;
  title: string;
  instructor: string;
  duration: string;
  views: string;
  category: 'career' | 'subject' | 'live';
  thumbnail: string;
  tags: string[];
};

/* -------------------- Data -------------------- */
const categories = [
  { id: 'all', label: 'All', icon: PlayCircle },
  { id: 'career', label: 'Career Guidance', icon: Target },
  { id: 'subject', label: 'Subject Videos', icon: BookOpen },
  { id: 'live', label: 'Live Classes', icon: Radio },
] as const;

const allVideos: Video[] = [
  {
    id: 1,
    title: 'JEE 2025 Complete Roadmap',
    instructor: 'Dr. Amit Kumar',
    duration: '45:30',
    views: '15.4K',
    category: 'career',
    thumbnail:
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop',
    tags: ['Strategy', 'JEE'],
  },
  {
    id: 2,
    title: 'Electrostatics - Complete Chapter',
    instructor: 'Prof. Sarah Wilson',
    duration: '1:20:15',
    views: '10.2K',
    category: 'subject',
    thumbnail:
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop',
    tags: ['Physics', 'Class 12'],
  },
  {
    id: 3,
    title: 'Live: Organic Chemistry Doubt Clearing',
    instructor: 'Dr. R.K. Gupta',
    duration: 'Live Now',
    views: '1.5K Watching',
    category: 'live',
    thumbnail:
      'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?q=80&w=600&auto=format&fit=crop',
    tags: ['Chemistry', 'Live'],
  },
  {
    id: 4,
    title: 'How to Manage Time for NEET',
    instructor: 'Dr. Priya Patel',
    duration: '30:00',
    views: '8.9K',
    category: 'career',
    thumbnail:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop',
    tags: ['Strategy', 'NEET'],
  },
  {
    id: 5,
    title: 'Calculus: Limits and Continuity',
    instructor: 'Er. Rajesh Singh',
    duration: '55:45',
    views: '12K',
    category: 'subject',
    thumbnail:
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop',
    tags: ['Math', 'Calculus'],
  },
  {
    id: 6,
    title: 'Live: Physics Problem Solving',
    instructor: 'Dr. Amit Kumar',
    duration: 'Starts in 10m',
    views: 'Waiting',
    category: 'live',
    thumbnail:
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop',
    tags: ['Physics', 'Live'],
  },
];

/* -------------------- Page -------------------- */
export default function LecturesPage() {
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'career' | 'subject' | 'live'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const filteredVideos = allVideos.filter((video) => {
    const matchesCategory =
      activeCategory === 'all' || video.category === activeCategory;

    const matchesSearch =
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.instructor.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                <PlayCircle className="w-8 h-8 text-blue-600" />
                Video Lectures
              </h1>
              <p className="text-slate-500 mt-1">
                Watch expert-led video lectures and live classes.
              </p>
            </div>

            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search lectures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeCategory === id ? 'default' : 'outline'}
                onClick={() => setActiveCategory(id)}
                className={`gap-2 ${
                  activeCategory === id
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-white text-slate-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            ))}
          </div>

          {/* Videos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <Card
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className="cursor-pointer overflow-hidden hover:shadow-lg transition"
              >
                <div className="aspect-video relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </span>
                </div>

                <CardContent className="p-4">
                  <Badge className="mb-2">{video.tags[0]}</Badge>
                  <h3 className="font-bold line-clamp-2">{video.title}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                    <User className="w-4 h-4" />
                    {video.instructor}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Modal */}
      <Dialog
        open={!!selectedVideo}
        onOpenChange={(open) => !open && setSelectedVideo(null)}
      >
        <DialogContent className="max-w-4xl p-0">
          {selectedVideo && (
            <div>
              <div className="aspect-video bg-black flex items-center justify-center">
                <PlayCircle className="w-20 h-20 text-white/50" />
              </div>

              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">
                  {selectedVideo.title}
                </h2>
                <p className="text-slate-500">{selectedVideo.instructor}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
