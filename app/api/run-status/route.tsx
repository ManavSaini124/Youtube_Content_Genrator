import { NextResponse } from 'next/server';
import { RunStatus } from '@/services/GlobalApi'; // Adjust path if needed

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id'); // Pass as ?id=your-event-id

  if (!id) {
    return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
  }

  try {
    const status = await RunStatus(id);
    return NextResponse.json({ status });
  } catch (error: any) {
    console.error('Error in run-status API:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch run status' }, { status: 500 });
  }
}