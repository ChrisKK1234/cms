import type { Endpoint } from 'payload'
import type { MuxPluginOptions } from '../plugin'
import { getMuxClient } from '../lib/muxClient'
import { requireAuth } from '../../lib/requireAuth'

interface MuxUploadEndpointOptions {
  options: MuxPluginOptions
}

export const muxUploadEndpoint = ({ options }: MuxUploadEndpointOptions): Endpoint => ({
  path: '/mux-upload-url',
  method: 'post',
  handler: async (req) => {
    const authError = await requireAuth(req)
    if (authError) return authError

    try {
      const mux = getMuxClient(options)
      let passthrough = ''
      if (req.body && typeof req.body === 'object') {
        const body = req.body as unknown as Record<string, string>
        passthrough = body.title ?? ''
      }
      const upload = await mux.video.uploads.create({
        cors_origin: '*',
        new_asset_settings: {
          playback_policy: [options.publicPlayback === false ? 'signed' : 'public'],
          passthrough,
        },
      })
      return Response.json({ uploadId: upload.id, url: upload.url })
    } catch (err: unknown) {
      console.error('[Mux] Failed to create upload URL:', err)
      return Response.json({ error: 'Failed to create Mux upload URL' }, { status: 500 })
    }
  },
})
