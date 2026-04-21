import type { Endpoint } from 'payload'
import type { MuxPluginOptions } from '../mux/plugin'
import { getMuxClient } from '../mux/lib/muxClient'
import { requireAuth } from '../lib/requireAuth'
import { v2 as cloudinary } from 'cloudinary'
// @ts-ignore
import DigestFetch from 'digest-fetch'

interface DashboardOptions {
  muxOptions: MuxPluginOptions
}

const RAILWAY_PRICES = {
  memoryPerGBMin: 0.000231,
  cpuPerVCPUMin: 0.000463,
  networkPerGB: 0.1,
}

export const dashboardStatsEndpoint = ({ muxOptions }: DashboardOptions): Endpoint => ({
  path: '/dashboard-stats',
  method: 'get',
  handler: async (req) => {
    const authError = await requireAuth(req)
    if (authError) return authError

    const stats: Record<string, unknown> = {}

    try {
      const mux = getMuxClient(muxOptions)
      const assets = await mux.video.assets.list({ limit: 100 })
      const totalDurationSeconds = assets.data.reduce((acc, a) => acc + (a.duration ?? 0), 0)
      stats.mux = {
        totalVideos: assets.data.length,
        readyVideos: assets.data.filter((a) => a.status === 'ready').length,
        totalDurationSeconds: Math.round(totalDurationSeconds),
        totalDurationMinutes: Math.round(totalDurationSeconds / 60),
        limits: { storageGB: 500 },
      }
    } catch (err) {
      console.error('[Dashboard] Mux fejlede:', err)
      stats.mux = null
    }

    try {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      })
      const usage = await cloudinary.api.usage()
      stats.cloudinary = {
        creditsUsed: Math.max(0, usage.credits?.usage ?? 0),
        creditsLimit: usage.credits?.limit ?? 25,
        storageBytes: Math.max(0, usage.storage?.usage ?? 0),
        bandwidthBytes: Math.max(0, usage.bandwidth?.usage ?? 0),
        totalResources: Math.max(0, usage.resources ?? 0),
        plan: usage.plan ?? 'Free',
      }
    } catch (err) {
      console.error('[Dashboard] Cloudinary fejlede:', err)
      stats.cloudinary = null
    }

    try {
      const publicKey = process.env.ATLAS_PUBLIC_KEY
      const privateKey = process.env.ATLAS_PRIVATE_KEY
      const groupId = process.env.ATLAS_GROUP_ID
      const processId = process.env.ATLAS_PROCESS_ID

      if (!publicKey || !privateKey || !groupId || !processId) {
        stats.mongodb = { error: 'Mangler Atlas API credentials i .env' }
      } else {
        const client = new DigestFetch(publicKey, privateKey)
        const url = `https://cloud.mongodb.com/api/atlas/v2/groups/${groupId}/processes/${encodeURIComponent(processId)}/measurements?granularity=PT1H&period=PT2H&m=LOGICAL_SIZE`
        const res = await client.fetch(url, {
          headers: { Accept: 'application/vnd.atlas.2023-01-01+json' },
        })
        const data = (await res.json()) as {
          measurements?: Array<{
            dataPoints?: Array<{ value: number | null }>
          }>
        }
        const points = data?.measurements?.[0]?.dataPoints ?? []
        const latestBytes = [...points].reverse().find((p) => p.value !== null)?.value ?? 0
        stats.mongodb = {
          storageBytesUsed: latestBytes,
          storageMBUsed: Math.round(latestBytes / 1024 / 1024),
          storageMBLimit: 512,
        }
      }
    } catch (err) {
      console.error('[Dashboard] MongoDB Atlas fejlede:', err)
      stats.mongodb = null
    }

    // try {
    //   const railwayToken = process.env.RAILWAY_API_TOKEN
    //   const railwayProjectId = process.env.RAILWAY_PROJECT_ID

    //   if (!railwayToken || !railwayProjectId) {
    //     stats.railway = { error: 'Mangler Railway credentials i .env' }
    //   } else {
    //     const now = new Date()
    //     const startDate = new Date(now.getTime() - 10 * 60 * 1000).toISOString()

    //     const metricsQuery = `{
    //       metrics(
    //         projectId: "${railwayProjectId}",
    //         measurements: [MEMORY_USAGE_GB, CPU_USAGE, NETWORK_RX_GB, NETWORK_TX_GB],
    //         startDate: "${startDate}",
    //         sampleRateSeconds: 60,
    //         averagingWindowSeconds: 300
    //       ) { measurement values { value } }
    //       usage(
    //         projectId: "${railwayProjectId}",
    //         measurements: [MEMORY_USAGE_GB, CPU_USAGE, NETWORK_RX_GB, NETWORK_TX_GB]
    //       ) { measurement value }
    //       estimatedUsage(
    //         projectId: "${railwayProjectId}",
    //         measurements: [MEMORY_USAGE_GB, CPU_USAGE, NETWORK_RX_GB, NETWORK_TX_GB]
    //       ) { measurement estimatedValue }
    //     }`

    //     const res = await fetch('https://backboard.railway.app/graphql/v2', {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //         Authorization: `Bearer ${railwayToken}`,
    //       },
    //       body: JSON.stringify({ query: metricsQuery }),
    //     })

    //     const data = (await res.json()) as {
    //       data: {
    //         metrics: Array<{ measurement: string; values: Array<{ value: number }> }>
    //         usage: Array<{ measurement: string; value: number }>
    //         estimatedUsage: Array<{ measurement: string; estimatedValue: number }>
    //       }
    //     }

    //     const getLatest = (key: string) => {
    //       const series = data.data.metrics.find((m) => m.measurement === key)
    //       const values = series?.values ?? []
    //       return values[values.length - 1]?.value ?? 0
    //     }

    //     const getUsage = (key: string) =>
    //       data.data.usage.find((u) => u.measurement === key)?.value ?? 0

    //     const getEstimated = (key: string) =>
    //       data.data.estimatedUsage.find((u) => u.measurement === key)?.estimatedValue ?? 0

    //     const currentMemoryCost = getUsage('MEMORY_USAGE_GB') * RAILWAY_PRICES.memoryPerGBMin
    //     const currentCPUCost = getUsage('CPU_USAGE') * RAILWAY_PRICES.cpuPerVCPUMin
    //     const currentNetworkCost =
    //       (getUsage('NETWORK_TX_GB') + getUsage('NETWORK_RX_GB')) * RAILWAY_PRICES.networkPerGB
    //     const estimatedMemoryCost = getEstimated('MEMORY_USAGE_GB') * RAILWAY_PRICES.memoryPerGBMin
    //     const estimatedCPUCost = getEstimated('CPU_USAGE') * RAILWAY_PRICES.cpuPerVCPUMin
    //     const estimatedNetworkCost =
    //       (getEstimated('NETWORK_TX_GB') + getEstimated('NETWORK_RX_GB')) *
    //       RAILWAY_PRICES.networkPerGB

    //     stats.railway = {
    //       creditCap: parseFloat(process.env.RAILWAY_CREDIT_CAP ?? '5'),
    //       current: {
    //         memoryGB: getLatest('MEMORY_USAGE_GB'),
    //         cpu: getLatest('CPU_USAGE'),
    //         memoryCost: currentMemoryCost,
    //         cpuCost: currentCPUCost,
    //         networkCost: currentNetworkCost,
    //         totalCost: currentMemoryCost + currentCPUCost + currentNetworkCost,
    //       },
    //       estimated: {
    //         memoryCost: estimatedMemoryCost,
    //         cpuCost: estimatedCPUCost,
    //         networkCost: estimatedNetworkCost,
    //         totalCost: estimatedMemoryCost + estimatedCPUCost + estimatedNetworkCost,
    //       },
    //     }
    //   }
    // } catch (err) {
    //   console.error('[Dashboard] Railway fejlede:', err)
    //   stats.railway = null
    // }

    return Response.json(stats)
  },
})
