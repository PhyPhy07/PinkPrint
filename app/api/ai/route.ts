import { NextResponse } from 'next/server';
import { cachedGenerateText } from '@/app/lib/cache-ai';

export async function POST(request: Request) {
  try {
    const { input } = await request.json();
    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: 'Missing input' }, { status: 400 });
    }

    const response = await cachedGenerateText(
      input,
      'project-extraction',
      'You are a helpful DIY project assistant.',
      (userInput) => `User's project description: ${userInput}`
    );

    return NextResponse.json({ response });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 });
  }
}