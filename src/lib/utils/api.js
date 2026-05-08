export const fetchWithRetry = async (url, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url)
      if (res.ok) return await res.json()
      if (res.status === 404) throw new Error('Not Found')
      throw new Error(`Status ${res.status}`)
    } catch (e) {
      if (i === retries - 1) throw e
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
    }
  }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const pokeapi = async (path, retries = 3) => {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  const url = `https://pokeapi.co/api/v2/${cleanPath}`
  
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url)
      if (res.ok) return await res.json()
      if (res.status === 404) return null
      
      // If not OK and not 404, throw to retry (e.g. 500, 503, 429)
      throw new Error(`Status ${res.status}`)
    } catch (e) {
      if (i === retries - 1) throw e
      await sleep(1000 * (i + 1))
    }
  }
}
