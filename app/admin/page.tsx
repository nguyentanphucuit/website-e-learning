'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, BookOpen, FolderOpen, GraduationCap, Star, MessageSquare, Database } from 'lucide-react';

interface TableInfo {
    name: string;
    rows: number;
}

const tableIcons: Record<string, React.ReactNode> = {
    users: <Users className="h-5 w-5" />,
    courses: <BookOpen className="h-5 w-5" />,
    categories: <FolderOpen className="h-5 w-5" />,
    enrollments: <GraduationCap className="h-5 w-5" />,
    reviews: <Star className="h-5 w-5" />,
    lessons: <BookOpen className="h-5 w-5" />,
    chat_messages: <MessageSquare className="h-5 w-5" />,
    lesson_progress: <Database className="h-5 w-5" />,
};

const tableColors: Record<string, string> = {
    users: 'from-blue-500 to-blue-600',
    courses: 'from-purple-500 to-purple-600',
    categories: 'from-pink-500 to-pink-600',
    enrollments: 'from-green-500 to-green-600',
    reviews: 'from-amber-500 to-amber-600',
    lessons: 'from-indigo-500 to-indigo-600',
    chat_messages: 'from-teal-500 to-teal-600',
    lesson_progress: 'from-rose-500 to-rose-600',
};

export default function AdminPage() {
    const [tables, setTables] = useState<TableInfo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin')
            .then((res) => res.json())
            .then((data) => setTables(data.tables || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Database Overview</h1>
                <p className="text-gray-500 mt-1">Manage your MySQL database tables</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="h-28 bg-white rounded-xl animate-pulse shadow-sm" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {tables.map((table) => (
                        <Card key={table.name} className="rounded-xl border-0 shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">{table.name}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">{table.rows}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">records</p>
                                    </div>
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tableColors[table.name] || 'from-gray-500 to-gray-600'} flex items-center justify-center text-white`}>
                                        {tableIcons[table.name] || <Database className="h-5 w-5" />}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Quick Info */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="rounded-xl border-0 shadow-sm">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Info</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-500">Database</span>
                                <span className="font-medium text-gray-900">edulearn</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-500">Engine</span>
                                <span className="font-medium text-gray-900">MySQL</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-500">Host</span>
                                <span className="font-medium text-gray-900">localhost:3307</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-gray-500">Total Tables</span>
                                <span className="font-medium text-gray-900">{tables.length}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border-0 shadow-sm">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'SQL Query', href: '/admin/sql', color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
                                { label: 'Manage Users', href: '/admin/users', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
                                { label: 'Manage Courses', href: '/admin/courses', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
                                { label: 'Categories', href: '/admin/categories', color: 'bg-pink-50 text-pink-600 hover:bg-pink-100' },
                            ].map((action) => (
                                <a
                                    key={action.href}
                                    href={action.href}
                                    className={`px-4 py-3 rounded-lg text-sm font-medium text-center transition-colors ${action.color}`}
                                >
                                    {action.label}
                                </a>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
