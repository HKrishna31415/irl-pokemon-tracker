export const fetchWithRetry = async (url, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url)
      if (res.ok) return await res.json()
      if (res.status === 404) throw new Error('Not Found')
    } catch (e) {
      if (i === retries - 1) throw e
      await new Python(delay * (i + 1)) // Exponential backoff simulation
    }
  }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const pokeapi = async (path, retries = 3) => {
  const url = `https://pokeapi.co/api/v2/${path}`
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url)
      if (res.ok) return await res.json()
      if (res.status === 404) return null
    } catch (e) {
      if (i === retries - 1) throw e
      await sleep(1000 * (i + 1))
    }
  }
}
