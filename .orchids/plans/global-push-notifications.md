# Global Push Notifications (Background/Offline)

## Requirements
Implementasi sistem **Web Push Notification** yang memungkinkan notifikasi tetap muncul meskipun pengguna sudah menutup browser atau situs. Notifikasi akan dikirim dari server ke semua pengguna yang berlangganan, bahkan saat mereka offline.

**Key Features:**
- Notifikasi muncul meski browser/situs ditutup
- Push dari server menggunakan Web Push API dengan VAPID keys
- Aktivasi push notification secara manual dari Settings
- Konten notifikasi: Foto + Judul + Deskripsi
- Klik notifikasi mengarahkan ke URL tujuan

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Create Event Page]                                            │
│         │                                                        │
│         ▼                                                        │
│  [API: /api/notifications/send]                                 │
│         │                                                        │
│         ├──► [Supabase: notifications table] ◄── Scheduled      │
│         │                                                        │
│         ▼                                                        │
│  [web-push library]                                             │
│         │                                                        │
│         ▼                                                        │
│  [Push Service (Browser)]                                       │
│         │                                                        │
│         ▼                                                        │
│  [Service Worker: sw.js]  ◄── Works even browser closed!        │
│         │                                                        │
│         ▼                                                        │
│  [Native Notification]                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema Changes

### New Table: `push_subscriptions`
```sql
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
```

## Implementation Phases

### Phase 1: Setup VAPID Keys & Dependencies
- Install `web-push` package via `bun add web-push`
- Generate VAPID keys using `npx web-push generate-vapid-keys`
- Add environment variables:
  - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
  - `VAPID_PRIVATE_KEY`
- Update `next.config.ts` dengan headers untuk Service Worker

### Phase 2: Create Push Subscription Database Table
- Create `push_subscriptions` table di Supabase untuk menyimpan subscription data pengguna
- Table menyimpan: endpoint, p256dh key, auth key per user

### Phase 3: Upgrade Service Worker (`public/sw.js`)
- Tambahkan event listener `push` untuk menerima push dari server
- Parse payload JSON (title, body, icon, url)
- Tampilkan notifikasi menggunakan `self.registration.showNotification()`
- Upgrade `notificationclick` handler untuk buka URL dari payload

### Phase 4: Create Push Subscription API
- Buat `/api/push/subscribe` untuk menyimpan subscription ke database
- Buat `/api/push/unsubscribe` untuk menghapus subscription
- Validasi dan simpan endpoint, p256dh, auth keys

### Phase 5: Create Push Send API
- Buat `/api/notifications/send` untuk mengirim push ke semua subscribers
- Loop semua subscriptions dari database
- Gunakan `web-push.sendNotification()` untuk setiap subscriber
- Handle error 410 (expired subscription) dengan auto-delete

### Phase 6: Update Settings UI untuk Push Subscription
- Modifikasi `interaction-preferences.tsx`
- Saat toggle ON: Request permission + Subscribe ke PushManager + Kirim subscription ke API
- Saat toggle OFF: Unsubscribe dari PushManager + Hapus dari database
- Tampilkan status subscription (aktif/tidak)

### Phase 7: Update Create Event Page
- Modifikasi `/create-event/page.tsx`
- Saat "Create Notification": Insert ke `notifications` table + Trigger push API
- Untuk scheduled notifications: Gunakan server-side cron atau Supabase Edge Functions

### Phase 8: Background Notification Scheduler (Optional)
- Implement Supabase Edge Function untuk scheduled notifications
- Cron job yang cek `notifications` table setiap menit
- Kirim push untuk notifikasi yang `scheduled_for <= NOW()` dan belum terkirim
- Mark notification as sent setelah berhasil

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `package.json` | MODIFY | Add `web-push` dependency |
| `.env.local` | MODIFY | Add VAPID keys |
| `next.config.ts` | MODIFY | Add SW headers |
| `public/sw.js` | MODIFY | Add `push` event handler |
| `src/app/api/push/subscribe/route.ts` | CREATE | Handle push subscription |
| `src/app/api/push/unsubscribe/route.ts` | CREATE | Handle unsubscription |
| `src/app/api/notifications/send/route.ts` | CREATE | Send push to all subscribers |
| `src/app/components/layout/settings/appearance/interaction-preferences.tsx` | MODIFY | Add push subscription logic |
| `src/app/create-event/page.tsx` | MODIFY | Trigger push on create |
| `src/lib/push/index.ts` | CREATE | Push utilities & VAPID config |

## Technical Considerations

### HTTPS Requirement
- Web Push API requires HTTPS
- Development: Use `next dev --experimental-https` or ngrok

### Browser Compatibility
- Chrome, Firefox, Edge: Full support
- Safari (iOS 16.4+): Requires PWA install to home screen first
- Safari macOS: Supported since Ventura

### Error Handling
- 410 Gone: Subscription expired, auto-delete from DB
- 404: Subscription not found
- Network errors: Retry with exponential backoff

### Security
- VAPID private key: Server-only, never expose to client
- Validate subscription endpoints
- Rate limiting on send API

## Testing Checklist
- [ ] Subscribe to push notifications from Settings
- [ ] Close browser completely
- [ ] Send notification from Create Event page
- [ ] Verify notification appears in system tray
- [ ] Click notification and verify redirect to correct URL
- [ ] Test unsubscribe flow
- [ ] Test on multiple browsers

## Dependencies
- `web-push`: ^4.0.0+ (Web Push protocol implementation)
