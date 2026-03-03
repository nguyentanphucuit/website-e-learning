'use client';

import { useState, useEffect, useCallback } from 'react';
import CourseCard from '@/components/CourseCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Course, Category } from '@/types';
import Pagination from '@/components/Pagination';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 9;

  // Fetch categories once
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data || []))
      .catch(console.error);
  }, []);

  // Fetch courses with pagination and category filter
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (selectedCategory !== 'All') params.set('category', selectedCategory);

      const res = await fetch(`/api/courses?${params}`);
      const data = await res.json();

      const mappedCourses = (data.courses || []).map((c: Course & { category_name?: string; instructor_name?: string }) => ({
        ...c,
        category: c.category_name || c.category,
        instructor: c.instructor_name || c.instructor,
      }));

      setCourses(mappedCourses);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1); // Reset to page 1 on category change
  };

  if (loading && courses.length === 0) {
    return (
      <div className="py-12 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              All Courses
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">Loading courses...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-96 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            All Courses
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse our complete catalog of {total} online courses
          </p>
        </div>

        <Tabs value={selectedCategory} className="w-full" onValueChange={handleCategoryChange}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 mb-8">
            <TabsTrigger value="All" className="cursor-pointer">All</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.name} className="cursor-pointer">
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-8">
            {courses.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-8 flex justify-center">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No courses found in this category.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
