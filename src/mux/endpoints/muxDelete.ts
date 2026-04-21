import type { Endpoint } from 'payload'
import type { MuxPluginOptions } from '../plugin'
import { getMuxClient } from '../lib/muxClient'
import { requireAuth } from '../../lib/requireAuth'

export const muxDeleteEndpoint = ({ options }: { options: MuxPluginOptions }): Endpoint => ({
  path: '/mux-delete',
  method: 'post',
  handler: async (req) => {
    const authError = await requireAuth(req)
    if (authError) return authError

    try {
      const text = await req.text?.()
      const body = JSON.parse(text ?? '{}') as { assetId?: string }
      if (!body?.assetId) return Response.json({ error: 'assetId required' }, { status: 400 })
      const mux = getMuxClient(options)
      await mux.video.assets.delete(body.assetId)
      return Response.json({ ok: true })
    } catch (err) {
      console.error('[Mux] Delete failed:', err)
      return Response.json({ error: 'Delete failed' }, { status: 500 })
    }
  },
})
