import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import db from "@/lib/db";
import { ResultSetHeader } from "mysql2";
import { getAuthUser } from "@/lib/auth";
import crypto from "crypto";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are EduBot, an intelligent AI learning assistant for the EduLearn online learning platform. 

Your role:
- Help students find the right courses for their learning goals
- Answer questions about course content, difficulty levels, and prerequisites
- Provide study tips, learning strategies, and motivation
- Explain complex concepts in simple terms
- Recommend learning paths based on student interests
- Help with technical questions related to web development, programming, and technology

Personality:
- Friendly, encouraging, and patient
- Use emojis occasionally to keep the conversation engaging 😊
- Keep responses concise but helpful (2-4 paragraphs max)
- If you don't know something, be honest about it
- Always encourage continuous learning

Available courses on EduLearn:
1. Web Development Bootcamp - Full-stack web development with HTML, CSS, JavaScript, React, Node.js
2. Python for Data Science - Data analysis, visualization, machine learning with Python
3. UI/UX Design Fundamentals - User interface and experience design principles
4. Mobile App Development - Build iOS and Android apps with React Native
5. Cloud Computing & DevOps - AWS, Docker, Kubernetes, CI/CD
6. Cybersecurity Essentials - Network security, ethical hacking, security best practices

Respond in the same language the user uses. If they write in Vietnamese, respond in Vietnamese.`;

export async function POST(request: NextRequest) {
    try {
        const { messages } = await request.json();

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: "OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env.local file." },
                { status: 500 }
            );
        }

        // Get logged-in user (optional - chat works without login too)
        const user = await getAuthUser();

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...messages,
            ],
            temperature: 0.7,
            max_tokens: 1000,
        });

        const reply = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

        // Save to DB if user is logged in
        if (user) {
            try {
                const lastUserMsg = messages[messages.length - 1];
                if (lastUserMsg && lastUserMsg.role === "user") {
                    // Save user message
                    await db.execute<ResultSetHeader>(
                        "INSERT INTO chat_messages (id, role, content, user_id) VALUES (?, 'USER', ?, ?)",
                        [crypto.randomUUID(), lastUserMsg.content, user.id]
                    );
                }
                // Save AI response
                await db.execute<ResultSetHeader>(
                    "INSERT INTO chat_messages (id, role, content, user_id) VALUES (?, 'ASSISTANT', ?, ?)",
                    [crypto.randomUUID(), reply, user.id]
                );
            } catch (dbError) {
                console.error("Failed to save chat to DB:", dbError);
                // Don't fail the response if DB save fails
            }
        }

        return NextResponse.json({ message: reply });
    } catch (error: unknown) {
        console.error("Chat API Error:", error);

        if (error instanceof OpenAI.APIError) {
            if (error.status === 401) {
                return NextResponse.json(
                    { error: "Invalid API key. Please check your OPENAI_API_KEY." },
                    { status: 401 }
                );
            }
            if (error.status === 429) {
                return NextResponse.json(
                    { error: "Rate limit exceeded. Please try again in a moment." },
                    { status: 429 }
                );
            }
        }

        return NextResponse.json(
            { error: "An error occurred while processing your request." },
            { status: 500 }
        );
    }
}

