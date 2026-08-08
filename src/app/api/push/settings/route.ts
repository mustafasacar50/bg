import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');

  if (!studentId) {
    return NextResponse.json({ error: 'studentId required' }, { status: 400 });
  }

  try {
    const data = await kv.get(`push_${studentId}`);
    return NextResponse.json(data || {});
  } catch (error) {
    console.error('KV get error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, subscription, settings } = body;

    if (!studentId || !subscription) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const payload = {
      subscription,
      settings: settings || { startTime: '09:00', endTime: '21:00', interval: 60 },
      lastPushedAt: Date.now()
    };

    await kv.set(`push_${studentId}`, payload);
    
    // Add to a global list of subscribed users for the cron job to iterate
    await kv.sadd('push_subscribers', studentId);

    return NextResponse.json({ success: true, payload });
  } catch (error) {
    console.error('KV set error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');

  if (!studentId) {
    return NextResponse.json({ error: 'studentId required' }, { status: 400 });
  }

  try {
    await kv.del(`push_${studentId}`);
    await kv.srem('push_subscribers', studentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
