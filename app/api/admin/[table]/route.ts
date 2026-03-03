import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { getAuthUser } from "@/lib/auth";

async function checkAdmin() {
    const user = await getAuthUser();
    if (!user || user.role !== "ADMIN") return null;
    return user;
}

// GET: fetch rows from a table
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ table: string }> }
) {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { table } = await params;
    const allowedTables = ["users", "courses", "categories", "lessons", "enrollments", "reviews", "orders", "chat_messages", "lesson_progress"];
    if (!allowedTables.includes(table)) {
        return NextResponse.json({ error: "Table not allowed" }, { status: 400 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = (page - 1) * limit;

        const [rows] = await db.execute<RowDataPacket[]>(
            `SELECT * FROM \`${table}\` ORDER BY created_at DESC LIMIT ? OFFSET ?`,
            [String(limit), String(offset)]
        );

        const [countResult] = await db.execute<RowDataPacket[]>(
            `SELECT COUNT(*) as total FROM \`${table}\``
        );
        const total = countResult[0]?.total || 0;

        // Get column info
        const [columns] = await db.execute<RowDataPacket[]>(
            `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'edulearn' AND TABLE_NAME = ?`,
            [table]
        );

        return NextResponse.json({ rows, total, columns, page, limit });
    } catch (error) {
        console.error(`Admin table ${table} error:`, error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}

// PUT: update a row
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ table: string }> }
) {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { table } = await params;
    const allowedTables = ["users", "courses", "categories", "lessons", "enrollments", "reviews"];
    if (!allowedTables.includes(table)) {
        return NextResponse.json({ error: "Table not allowed" }, { status: 400 });
    }

    try {
        const { id, data } = await request.json();
        if (!id || !data) {
            return NextResponse.json({ error: "ID and data required" }, { status: 400 });
        }

        const setClauses = Object.keys(data).map((key) => `\`${key}\` = ?`).join(", ");
        const values = [...Object.values(data), id];

        const [result] = await db.execute<ResultSetHeader>(
            `UPDATE \`${table}\` SET ${setClauses} WHERE id = ?`,
            values
        );

        return NextResponse.json({ affectedRows: result.affectedRows });
    } catch (error: unknown) {
        const err = error as { sqlMessage?: string; message?: string };
        return NextResponse.json({ error: err.sqlMessage || err.message || "Update failed" }, { status: 400 });
    }
}

// DELETE: delete a row
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ table: string }> }
) {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { table } = await params;
    const allowedTables = ["users", "courses", "categories", "lessons", "enrollments", "reviews", "chat_messages", "lesson_progress"];
    if (!allowedTables.includes(table)) {
        return NextResponse.json({ error: "Table not allowed" }, { status: 400 });
    }

    try {
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        const [result] = await db.execute<ResultSetHeader>(
            `DELETE FROM \`${table}\` WHERE id = ?`,
            [id]
        );

        return NextResponse.json({ affectedRows: result.affectedRows });
    } catch (error: unknown) {
        const err = error as { sqlMessage?: string; message?: string };
        return NextResponse.json({ error: err.sqlMessage || err.message || "Delete failed" }, { status: 400 });
    }
}
