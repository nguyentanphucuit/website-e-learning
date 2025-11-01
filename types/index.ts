export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  image: string;
  category: string;
  lessons: Lesson[];
  rating: number;
  students: number;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'quiz' | 'assignment';
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

