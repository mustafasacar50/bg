"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";

export default function PushSettings({ studentId }: { studentId: string }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("21:00");
  const [interval, setIntervalVal] = useState("60");

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      if (typeof navigator === 'undefined' || !("serviceWorker" in navigator) || typeof window === 'undefined' || !("PushManager" in window)) {
        setLoading(false);
        return;
      }
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        setLoading(false);
        return;
      }
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
      
      if (subscription) {
        // Fetch current settings from KV via API
        const res = await fetch(`/api/push/settings?studentId=${studentId}`);
        if (res.ok) {
           const data = await res.json();
           if (data.settings) {
              setStartTime(data.settings.startTime || "09:00");
              setEndTime(data.settings.endTime || "21:00");
              setIntervalVal(data.settings.interval?.toString() || "60");
           }
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribe = async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      if (permission !== "granted") {
        alert("Bildirim izni vermeniz gerekmektedir.");
        setLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
         alert("Service Worker bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.");
         setLoading(false);
         return;
      }
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string),
      });

      // Send subscription & settings to server
      await saveSettings(subscription);
      setIsSubscribed(true);
    } catch (error) {
      console.error("Subscription failed:", error);
      alert("Abonelik başarısız oldu. Cihazınız desteklemiyor olabilir veya VAPID anahtarı eksik.");
    }
    setLoading(false);
  };

  const saveSettings = async (subs?: PushSubscription | null) => {
    setLoading(true);
    try {
      let currentSub = subs;
      if (!currentSub) {
         const registration = await navigator.serviceWorker.getRegistration();
         if (registration) {
            currentSub = await registration.pushManager.getSubscription();
         }
      }
      
      if (!currentSub) {
         setLoading(false);
         return;
      }

      await fetch('/api/push/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          subscription: currentSub,
          settings: {
            startTime,
            endTime,
            interval: parseInt(interval)
          }
        })
      });
      alert("Ayarlar kaydedildi!");
    } catch (e) {
      alert("Hata oluştu");
    }
    setLoading(false);
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          await fetch(`/api/push/settings?studentId=${studentId}`, { method: 'DELETE' });
        }
      }
      setIsSubscribed(false);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const [mounted, setMounted] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && !("serviceWorker" in navigator)) {
      setIsSupported(false);
    }
    setMounted(true);
  }, []);
  
  if (!mounted) return <div className="card p-5 mb-6 h-32 animate-pulse bg-slate-100"></div>;

  if (!isSupported) {
    return (
      <div className="card p-5 mb-6 opacity-75">
        <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-2"><BellOff size={18} /> Otomatik Soru Bildirimleri</h3>
        <p className="text-sm text-slate-500">Cihazınız veya tarayıcınız bu özelliği desteklemiyor. (iOS'da uygulamayı 'Ana Ekrana Ekle' yaparak açmanız gerekebilir).</p>
      </div>
    );
  }

  return (
    <div className="card p-5 mb-6 border-indigo-100 bg-gradient-to-r from-indigo-50/50 to-white relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Bell size={120} />
      </div>
      <div className="relative z-10">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2 text-lg">
          <Bell size={20} className={isSubscribed ? "text-indigo-600" : "text-slate-400"} /> 
          Otomatik Soru Asistanı
        </h3>
        <p className="text-sm text-slate-600 mb-4 max-w-md">
          Uygulama kapalıyken bile telefonunuza bildirim göndererek pratik yapmanızı hatırlatırız. Tıkladığınızda doğrudan soru ekranı açılır.
        </p>

        {isSubscribed ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Başlangıç Saati</label>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="text-input p-2 text-sm w-full" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Bitiş Saati</label>
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="text-input p-2 text-sm w-full" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1">Hangi Sıklıkla Soru Gelsin?</label>
                <select value={interval} onChange={e => setIntervalVal(e.target.value)} className="text-input p-2 text-sm w-full">
                  <option value="15">15 dakikada bir</option>
                  <option value="30">Yarım saatte bir</option>
                  <option value="60">Saat başı</option>
                  <option value="120">İki saatte bir</option>
                  <option value="240">4 saatte bir</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => saveSettings()} 
                disabled={loading}
                className="btn btn-primary py-2 px-4 text-sm flex items-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null} Ayarları Kaydet
              </button>
              <button 
                onClick={unsubscribe} 
                disabled={loading}
                className="btn bg-red-50 text-red-600 hover:bg-red-100 py-2 px-4 text-sm"
              >
                Kapat
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={subscribe} 
            disabled={loading}
            className="btn btn-primary py-2 px-5 text-sm flex items-center gap-2 shadow-lg shadow-indigo-200"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Bell size={18} />} Bildirimleri Aç
          </button>
        )}
      </div>
    </div>
  );
}
