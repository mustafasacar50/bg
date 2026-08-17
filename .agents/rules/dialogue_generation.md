---
name: dialogue_generation
description: Kural, "diyalog hazırla", "senaryo ekle" vb. isteklerde 10 adet detaylı ve seviyeli diyalog üretmek içindir.
trigger: model_decision
---

Kullanıcı senden "Bana yeni diyaloglar hazırla", "Diyalog merkezine 10 senaryo ekle" veya "Simülasyon üret" gibi bir istekte bulunduğunda, şu kurallara kesinlikle uymalısın:

1. ÜRETİM YÖNTEMİ: Senaryoları elle tek tek yazmak yerine, `exam-app/scripts/gen_10_simulations.js` benzeri bir Node.js betiği oluştur (veya var olanı güncelle) ve projede çalıştırarak `src/data/modules/` klasörüne JSON dosyaları olarak kaydet.
2. SEVİYE SİSTEMİ: Her üretimde tam 10 adet yeni simülasyon dosyası oluştur. Bu dosyalar 5 farklı güçlük kademesine (1'den 5'e kadar) dengeli bir şekilde yayılmış olmalı (her seviyeden 2'şer tane).
3. EĞİTSEL KALİTE (ÇOK ÖNEMLİ): Diyaloglar kesinlikle kısa ve basit olmamalıdır. Son derece detaylı, gerçek hayatı birebir yansıtan, sürükleyici hikayeler kurgula. 
4. KELİME VE GRAMER ÖĞRETİMİ: Diyalogların içindeki kelime hazinesi her seviyede giderek zenginleşmeli. "explanation" (açıklama) alanını sadece durumu anlatmak için değil, o cümlede geçen bir gramer kuralını, deyimi veya zor bir kelimenin kökenini öğretmek için de kullan! Kullanıcı o seçeneği neden seçmesi gerektiğini gramer kurallarıyla öğrensin.
5. VERİ FORMATI: JSON dosyalarında `type: "dialogue"` olmalı. Her soru mutlaka `speaker` (konuşan kişi), `sentence` (söylenen söz veya bot mesajı, eğer kullanıcı başlıyorsa "..."), `options` (en az 4 zorlu ve çeldirici seçenek), `answer` (doğru seçenek), `hint` (ipucu veya çeviri) ve `explanation` (durum görevi ve dilbilgisi açıklaması) alanlarını içermelidir.
6. ÇEVİRİ DESTEĞİ (SİHİRLİ GÖZ İÇİN): Her sorudaki 'options' (şıklar) dizisindeki tüm Bulgarca cümlelerin sırasıyla birebir Türkçe çevirisini içeren yeni bir "optionsTr" dizisi (array) oluşturacaksın ve aynı question objesinin içine ekleyeceksin. Ayrıca bot cümlesinin çevirisini "explanation" içine, doğru cevabın özel ipucunu ise "hint" içine yazmaya devam edeceksin. Bu sayede arayüzdeki "Çeviri Modu" tüm şıkları sorunsuz çevirecektir.
