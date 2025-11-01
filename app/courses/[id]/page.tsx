'use client';

import { use } from 'react';
import { courses } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Users, Star, CheckCircle2, PlayCircle, FileText, HelpCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const course = courses.find(c => c.id === id);

  if (!course) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Course not found</h1>
        <Link href="/courses">
          <Button className="cursor-pointer">Back to Courses</Button>
        </Link>
      </div>
    );
  }

  const handleEnroll = () => {
    // Get enrolled courses from localStorage
    const enrolled = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
    
    // Check if already enrolled
    if (!enrolled.find((c: { id: string }) => c.id === course.id)) {
      enrolled.push(course);
      localStorage.setItem('enrolledCourses', JSON.stringify(enrolled));
    }
    
    router.push('/dashboard');
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="h-5 w-5 text-blue-500" />;
      case 'quiz':
        return <HelpCircle className="h-5 w-5 text-purple-500" />;
      case 'assignment':
        return <FileText className="h-5 w-5 text-green-500" />;
      default:
        return <PlayCircle className="h-5 w-5" />;
    }
  };

  return (
    <div className="py-12 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Header */}
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={course.image}
                alt={course.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <span className="inline-block px-4 py-2 rounded-full bg-blue-500/90 backdrop-blur-sm text-sm font-semibold mb-4">
                  {course.category}
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">{course.title}</h1>
                <p className="text-lg opacity-90">by {course.instructor}</p>
              </div>
            </div>

            {/* Description */}
            <Card className="rounded-2xl shadow-md border-0">
              <CardHeader>
                <CardTitle>About This Course</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{course.description}</p>
              </CardContent>
            </Card>

            {/* Course Content */}
            <Card className="rounded-2xl shadow-md border-0">
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {course.lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="flex items-center space-x-4 p-4 rounded-xl border hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <div className="flex-shrink-0">
                        {getLessonIcon(lesson.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{lesson.title}</h4>
                          <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">{lesson.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 rounded-2xl shadow-xl border-0">
              <CardHeader>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  ${course.price}
                </div>
                <Button
                  onClick={handleEnroll}
                  className="w-full cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg py-6"
                >
                  Enroll Now
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span>Rating</span>
                  </div>
                  <span className="font-semibold">{course.rating} / 5.0</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Users className="h-5 w-5" />
                    <span>Students</span>
                  </div>
                  <span className="font-semibold">{course.students.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <PlayCircle className="h-5 w-5" />
                    <span>Lessons</span>
                  </div>
                  <span className="font-semibold">{course.lessons.length}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Clock className="h-5 w-5" />
                    <span>Total Duration</span>
                  </div>
                  <span className="font-semibold">
                    {Math.round(
                      course.lessons.reduce((acc, lesson) => {
                        const [hours, minutes] = lesson.duration.split(':').map(Number);
                        return acc + hours * 60 + minutes;
                      }, 0) / 60
                    )}h
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

