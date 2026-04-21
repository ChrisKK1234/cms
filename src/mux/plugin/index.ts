import type { Config } from 'payload'
import { MuxVideosCollection } from '../collections/MuxVideos'
import { muxUploadEndpoint } from '../endpoints/muxUpload'
import { muxAssetsEndpoint } from '../endpoints/muxAssets'
import { muxDeleteEndpoint } from '../endpoints/muxDelete'
import { muxRenameEndpoint } from '../endpoints/muxRename'
import { muxAssetStatusEndpoint } from '../endpoints/muxAssetStatus'
import { muxSyncEndpoint } from '../endpoints/muxSync'

export interface MuxPluginOptions {
  accessTokenId: string
  secretKey: string
  publicPlayback?: boolean
  collectionSlug?: string
}

export const muxPlugin =
  (options: MuxPluginOptions) =>
  (config: Config): Config => {
    const slug = options.collectionSlug ?? 'mux-videos'

    return {
      ...config,
      collections: [...(config.collections ?? []), MuxVideosCollection({ slug, options })],
      endpoints: [
        ...(config.endpoints ?? []),
        muxUploadEndpoint({ options }),
        muxAssetsEndpoint({ options }),
        muxDeleteEndpoint({ options }),
        muxRenameEndpoint({ options }),
        muxAssetStatusEndpoint({ options }),
        muxSyncEndpoint({ options, collectionSlug: slug }),
      ],
      admin: {
        ...config.admin,
        components: {
          ...config.admin?.components,
          afterNavLinks: [...(config.admin?.components?.afterNavLinks ?? [])],
        },
      },
    }
  }
