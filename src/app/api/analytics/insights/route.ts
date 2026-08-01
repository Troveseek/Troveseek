import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === '') {
      return NextResponse.json({ error: 'Gemini API key is missing' }, { status: 400 });
    }

    const body = await req.json();
    const { analyticsData } = body;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an expert business analyst and AI consultant for an e-commerce and SaaS platform.
      Review the following store analytics data and provide exactly 3 brief, actionable insights.
      Format the output as a JSON array of objects with 'type', 'title', and 'description'.
      - 'type' should be one of: 'opportunity', 'warning', 'trend'.
      - 'title' should be a short, catchy title (e.g. "Revenue Spiking", "User Drop-off").
      - 'description' should be a 1-2 sentence explanation or recommendation.

      Data:
      Total Revenue: $${analyticsData.totalRevenue}
      Total Users: ${analyticsData.totalUsers}
      Avg Order Value: $${analyticsData.avgOrderValue}
      Daily Data: ${JSON.stringify(analyticsData.dailyData)}
      Sales by Category: ${JSON.stringify(analyticsData.salesData)}

      Only return the raw JSON array. No markdown formatting, no backticks.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Clean up potential markdown formatting if model didn't listen
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let insights;
    try {
      insights = JSON.parse(cleanText);
    } catch (e) {
      console.error('Failed to parse Gemini response', cleanText);
      throw new Error('Invalid response from AI');
    }

    return NextResponse.json({ data: insights });
  } catch (error) {
    console.error('Insights API Error:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}
