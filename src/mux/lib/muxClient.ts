import Mux from '@mux/mux-node'
import type { MuxPluginOptions } from '../plugin'

let _client: Mux | null = null

export function getMuxClient(options: MuxPluginOptions): Mux {
  if (!_client) {
    _client = new Mux({
      tokenId: options.accessTokenId,
      tokenSecret: options.secretKey,
    })
  }
  return _client
}
