import type { Endpoint } from 'payload'
import type { MuxPluginOptions } from '../plugin'
import { getMuxClient } from '../lib/muxClient'
import { requireAuth } from '../../lib/requireAuth'

export const muxAssetsEndpoint = ({ options }: { options: MuxPluginOptions }): Endpoint => ({
  path: '/mux-assets',
  method: 'get',
  handler: async (req) => {
    const authError = await requireAuth(req)
    if (authError) return authError

    try {
      const mux = getMuxClient(options)
      const response = await mux.video.assets.list({ limit: 100 })
      const assets = response.data.map((asset) => {
        const playbackId = asset.playback_ids?.find((p) => p.policy === 'public')?.id ?? null
        return {
          id: asset.id,
          status: asset.status,
          duration: asset.duration ?? null,
          aspectRatio: asset.aspect_ratio ?? null,
          playbackId,
          thumbnailUrl: playbackId
            ? `https://image.mux.com/${playbackId}/thumbnail.jpg?width=400&time=2`
            : null,
          createdAt: asset.created_at,
          passthrough: asset.passthrough ?? null,
        }
      })
      return Response.json({ assets })
    } catch (err) {
      console.error('[Mux] Failed to list assets:', err)
      return Response.json({ error: 'Failed to fetch assets' }, { status: 500 })
    }
  },
})
