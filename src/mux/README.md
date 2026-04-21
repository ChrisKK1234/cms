# Payload CMS v3 — Mux Integration

A self-contained integration that adds a **Mux Videos** collection to your Payload v3 app with direct file uploads from the admin UI.

## Features

- 🎬 Upload videos directly from the Payload admin panel to Mux
- 📊 Stores `muxAssetId`, `playbackId`, `status`, `duration`, `aspectRatio`, and `thumbnailUrl` automatically
- 🗑️ Deletes the Mux asset when you delete the Payload document
- ⏱️ Shows real-time upload progress with chunked uploading (via `@mux/upchunk`)
- 🔄 Polls Mux until the asset is ready and writes the playback metadata back into the form

---

## 1. Install dependencies

```bash
npm install @mux/mux-node @mux/upchunk
```

---

## 2. Copy the plugin files

Copy the `src/` folder from this repo into your Payload project, e.g. at `src/mux/`.

Your structure should look like:

```
src/
  mux/
    index.ts                          ← re-export
    plugin/
      index.ts                        ← plugin factory
      components/
        MuxUploadField.tsx            ← client upload component
    collections/
      MuxVideos.ts                    ← collection config
    endpoints/
      muxUpload.ts                    ← POST /api/mux-upload-url
      muxAssetStatus.ts               ← GET  /api/mux-asset-status
    lib/
      muxClient.ts                    ← Mux SDK singleton
```

---

## 3. Add the plugin to your Payload config

```ts
// payload.config.ts
import { buildConfig } from 'payload'
import { muxPlugin } from './src/mux'

export default buildConfig({
  // ... your other config
  plugins: [
    muxPlugin({
      accessTokenId: process.env.MUX_TOKEN_ID!,
      secretKey: process.env.MUX_TOKEN_SECRET!,
      // collectionSlug: 'mux-videos',  // optional, this is the default
      // publicPlayback: true,           // optional, default true
    }),
  ],
})
```

---

## 4. Set environment variables

```bash
# .env.local
MUX_TOKEN_ID=your_token_id_here
MUX_TOKEN_SECRET=your_token_secret_here
```

Get these from **Mux Dashboard → Settings → Access Tokens**.
Make sure the token has **"Mux Video" — Full Access** permission.

---

## 5. Fix the component path in the collection

In `src/mux/collections/MuxVideos.ts`, the `Field` component path must be an **absolute import path** that Next.js/Payload can resolve. Update this line to match where you placed the component:

```ts
// In MuxVideos.ts → fields → uploadField → admin.components.Field
Field: '/src/mux/plugin/components/MuxUploadField#MuxUploadField',
//      ^ adjust this to your actual path
```

---

## Usage

1. Go to **Mux Videos** in the Payload admin sidebar
2. Create a new document, give it a title, and click **Choose video file**
3. The video uploads directly to Mux in chunked segments
4. Once Mux finishes processing, `playbackId`, `status`, and other metadata are filled in automatically
5. Save the document — everything is persisted to your database

---

## Using a video on the frontend

```tsx
import MuxPlayer from '@mux/mux-player-react'

// Fetch from Payload API
const { playbackId } = await payload.findByID({
  collection: 'mux-videos',
  id: '...',
})

export default function VideoPage() {
  return <MuxPlayer playbackId={playbackId} />
}
```

Install the player: `npm install @mux/mux-player-react`

---

## Relating videos to other collections

```ts
// e.g. in a Posts collection
{
  name: 'video',
  type: 'relationship',
  relationTo: 'mux-videos',
  hasMany: false,
}
```

---

## Options reference

| Option | Type | Default | Description |
|---|---|---|---|
| `accessTokenId` | `string` | — | **Required.** Mux token ID |
| `secretKey` | `string` | — | **Required.** Mux token secret |
| `collectionSlug` | `string` | `'mux-videos'` | Slug for the collection |
| `publicPlayback` | `boolean` | `true` | `false` = signed (private) playback |

---

## CORS note

The `muxUpload.ts` endpoint sets `cors_origin: '*'` for simplicity. In production, replace this with your actual domain:

```ts
cors_origin: 'https://yourdomain.com',
```
