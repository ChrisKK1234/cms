const NETLIFY_HOOK = 'https://api.netlify.com/build_hooks/69e934a93c1656a7511710de'

export async function triggerNetlifyRebuild() {
  try {
    await fetch(NETLIFY_HOOK, { method: 'POST' })
  } catch (e) {
    console.error('[Netlify] Rebuild hook fejlede:', e)
  }
}