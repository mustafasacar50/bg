import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import webpush from 'web-push';

export async function GET(request: Request) {
  try {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    
    if (publicKey && privateKey) {
      webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
        publicKey,
        privateKey
      );
    } else {
      console.warn("VAPID keys are missing in environment variables.");
    }

    // In production, secure this endpoint with a secret token
    const { searchParams } = new URL(request.url);
    if (searchParams.get('token') !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscribers = await kv.smembers('push_subscribers');
    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ message: 'No subscribers' });
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;
    
    let pushedCount = 0;

    for (const studentId of subscribers) {
      const data: any = await kv.get(`push_${studentId}`);
      if (!data) continue;

      const { subscription, settings, lastPushedAt } = data;
      if (!subscription || !settings) continue;

      // Parse start and end times
      const [startH, startM] = settings.startTime.split(':').map(Number);
      const [endH, endM] = settings.endTime.split(':').map(Number);
      
      const startTimeMinutes = startH * 60 + startM;
      const endTimeMinutes = endH * 60 + endM;

      // Check if current time is within bounds
      if (currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes) {
        // Check interval
        const intervalMs = (settings.interval || 60) * 60 * 1000;
        const timeSinceLastPush = Date.now() - (lastPushedAt || 0);

        if (timeSinceLastPush >= intervalMs) {
          // Time to push!
          try {
            await webpush.sendNotification(
              subscription,
              JSON.stringify({
                title: "Bulgarca Sınav Modülü",
                body: "Soru vakti geldi! Tıkla ve pratik yap.",
                data: { url: "/training/balgoc___Bulgarca_A1_Ders_5?mode=all" } // Or a dynamic random module url
              })
            );

            // Update lastPushedAt
            await kv.set(`push_${studentId}`, {
              ...data,
              lastPushedAt: Date.now()
            });

            pushedCount++;
          } catch (e: any) {
            console.error(`Error sending push to ${studentId}:`, e);
            if (e.statusCode === 410 || e.statusCode === 404) {
              // Subscription expired or unsubscribed
              await kv.del(`push_${studentId}`);
              await kv.srem('push_subscribers', studentId);
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, pushedCount });
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
