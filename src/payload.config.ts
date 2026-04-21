import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { cloudinaryStorage } from 'payload-cloudinary'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Projects } from './collections/Projects'
import { Profiles } from './collections/Profiles'
import { Work } from './globals/Work'
import { muxPlugin } from './mux'
import { dashboardStatsEndpoint } from './dashboard/dashboardStats'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      icons: [
        {
          url: '/tab_icon.svg',
          type: 'image/svg+xml',
        },
      ],
    },
    components: {
      views: {
        dashboard: {
          Component: '@/dashboard/DashboardView#DashboardView',
          path: '/',
        },
        contentDashboard: {
          Component: '@/dashboard/ContentDashboard#ContentDashboard',
          path: '/content',
        },
      },
      header: '@/components/EmptyHeader#EmptyHeader',
    },
  },
  collections: [Users, Media, Projects, Profiles],
  globals: [Work],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  sharp,
  plugins: [
    muxPlugin({
      accessTokenId: process.env.MUX_TOKEN_ID!,
      secretKey: process.env.MUX_TOKEN_SECRET!,
    }),
    cloudinaryStorage({
      config: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
        api_key: process.env.CLOUDINARY_API_KEY!,
        api_secret: process.env.CLOUDINARY_API_SECRET!,
      },
      collections: {
        media: true,
      },
      folder: 'portfolio',
    }),
  ],
  endpoints: [
    dashboardStatsEndpoint({
      muxOptions: {
        accessTokenId: process.env.MUX_TOKEN_ID!,
        secretKey: process.env.MUX_TOKEN_SECRET!,
      },
    }),
  ],
})