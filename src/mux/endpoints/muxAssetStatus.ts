import type { Endpoint } from 'payload'
import type { MuxPluginOptions } from '../plugin'
import { getMuxClient } from '../lib/muxClient'
import { requireAuth } from '../../lib/requireAuth'

export const muxAssetStatusEndpoint = ({ options }: { options: MuxPluginOptions }): Endpoint => ({
  path: '/mux-asset-status',
  method: 'get',
  handler: async (req) => {
    const authError = await requireAuth(req)
    if (authError) return authError

    const uploadId = new URL(req.url ?? '', 'http://localhost').searchParams.get('uploadId')
    if (!uploadId) return Response.json({ error: 'uploadId required' }, { status: 400 })

    try {
      const mux = getMuxClient(options)
      const upload = await mux.video.uploads.retrieve(uploadId)
      if (!upload.asset_id) return Response.json({ status: 'waiting' })
      const asset = await mux.video.assets.retrieve(upload.asset_id)
      return Response.json({
        id: asset.id,
        status: asset.status,
        duration: asset.duration,
        aspect_ratio: asset.aspect_ratio,
        playback_ids: asset.playback_ids,
        passthrough: asset.passthrough,
      })
    } catch (err) {
      console.error('[Mux] Asset status failed:', err)
      return Response.json({ error: 'Failed' }, { status: 500 })
    }
  },
})
