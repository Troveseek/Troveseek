import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === '') {
      return NextResponse.json({ error: 'Gemini API key is missing. Add it to your .env file.' }, { status: 400 });
    }

    const body = await req.json();
    const { question, analyticsData } = body;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an expert AI business advisor for an e-commerce platform.
      The user is the store administrator. They have a question about their business.
      Use the provided analytics data context to give a helpful, concise answer.
      
      Store Context:
      Total Revenue: $${analyticsData.totalRevenue}
      Total Users: ${analyticsData.totalUsers}
      Avg Order Value: $${analyticsData.avgOrderValue}
      Top Categories: ${JSON.stringify(analyticsData.salesData)}
      
      User Question: "${question}"
      
      Provide a direct and helpful answer. You can use markdown.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ answer: text });
  } catch (error) {
    console.error('Gemini Chat API Error:', error);
    return NextResponse.json({ error: 'Failed to communicate with AI' }, { status: 500 });
  }
}
