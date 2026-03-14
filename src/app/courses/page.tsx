'use client';

import Sidebar from '@/components/cognify/Sidebar';
import { Search, Clock, Star, User, PlayCircle, BookOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const courses = [
  {
    id: 1,
    title: "Complete JEE Physics",
    instructor: "Dr. Amit Kumar",
    rating: 4.8,
    students: 12500,
    duration: "120h",
    lectures: 150,
    price: "₹2999",
    image:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=400&auto=format&fit=crop",
    tags: ["Physics", "JEE", "Advanced"],
  },
  {
    id: 2,
    title: "Organic Chemistry Masterclass",
    instructor: "Prof. Sarah Wilson",
    rating: 4.9,
    students: 8400,
    duration: "85h",
    lectures: 95,
    price: "₹1999",
    image:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=400&auto=format&fit=crop",
    tags: ["Chemistry", "NEET", "Intermediate"],
  },
  {
    id: 3,
    title: "Calculus for Engineering",
    instructor: "Er. Rajesh Singh",
    rating: 4.7,
    students: 15000,
    duration: "95h",
    lectures: 110,
    price: "₹2499",
    image:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=400&auto=format&fit=crop",
    tags: ["Math", "Engineering", "Calculus"],
  },
  {
    id: 4,
    title: "Biology: Human Anatomy",
    instructor: "Dr. Priya Patel",
    rating: 4.8,
    students: 9200,
    duration: "70h",
    lectures: 80,
    price: "₹1499",
    image:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=400&auto=format&fit=crop",
    tags: ["Biology", "NEET", "Anatomy"],
  },
  {
    id: 5,
    title: "Python for Data Science",
    instructor: "Alex Johnson",
    rating: 4.6,
    students: 22000,
    duration: "60h",
    lectures: 75,
    price: "₹999",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=400&auto=format&fit=crop",
    tags: ["CS", "Python", "Data Science"],
  },
  {
    id: 6,
    title: "Physical Chemistry Essentials",
    instructor: "Dr. R.K. Gupta",
    rating: 4.5,
    students: 6500,
    duration: "55h",
    lectures: 60,
    price: "₹1299",
    image:
      "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?q=80&w=400&auto=format&fit=crop",
    tags: ["Chemistry", "JEE", "NEET"],
  },
];

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      <main className="flex-1 p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-8 h-8 text-blue-600" />
                Explore Courses
              </h1>
              <p className="text-slate-500 mt-1">
                Master new skills with our expert-led courses.
              </p>
            </div>

            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search for courses..."
                className="pl-10 bg-white border-slate-200 focus-visible:ring-blue-600"
              />
            </div>
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="overflow-hidden hover:shadow-lg transition-all duration-300 border-slate-200 bg-white group cursor-pointer"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white/90 text-slate-900 shadow-sm backdrop-blur-sm">
                      {course.tags[0]}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </CardTitle>

                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    <User className="w-4 h-4" />
                    {course.instructor}
                  </div>
                </CardHeader>

                <CardContent className="pb-3">
                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center gap-1 text-yellow-500 font-medium">
                      <Star className="w-4 h-4 fill-current" />
                      {course.rating}
                      <span className="text-slate-400 font-normal">
                        ({course.students})
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-4 h-4" />
                      {course.duration} • {course.lectures} Lectures
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {course.tags.slice(1).map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs bg-slate-100 text-slate-600"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="flex items-center justify-between border-t border-slate-100 p-4 bg-slate-50/50">
                  <div className="text-xl font-bold text-slate-900">
                    {course.price}
                  </div>

                  <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
                    Enroll Now
                    <PlayCircle className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
