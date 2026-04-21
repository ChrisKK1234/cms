import type { PayloadRequest } from 'payload'

export async function requireAuth(req: PayloadRequest): Promise<Response | null> {
  const { user } = await req.payload.auth({ headers: req.headers })
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
