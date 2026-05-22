export const capitalise = (str, lowerRest = false) => {
  if (!str) return ''
  const [first, ...rest] = str
  return (
    first.toUpperCase() +
    (lowerRest ? rest.join('').toLowerCase() : rest.join(''))
  )
}

export const unslugify = (s = '') => s.replace(/-/g, ' ')
export const slugify = (s = '') =>
  s.toLowerCase().replace(/ +/g, '-').replace(/\./g, '')

export const normalise = (s = '') => {
  try {
    return (s || '').replace(/[-\.]/g, '')
  } catch (e) {
    console.error(e)
    console.log(s)
    return ''
  }
}

export const toKebabCase = (str) => {
  try {
    return (
      str &&
      str
        .match(
          /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
        )
        .map((x) => x.toLowerCase())
        .join('-')
    )
  } catch (e) {
    return str
  }
}

export const regionise = (str) =>
  str
    .replace(/(.*)-galar/, 'Galarian $1')
    .replace(/(.*)-alola/, 'Alolan $1')
    .replace(/(.*)-paldea/, 'Paldean $1')
    .replace(/(.*)-hisui/, 'Hisuian $1')
    .replace(/(.*)-hoenn/, 'Hoennian $1')
    .replace(/(.*)-sevii/, 'Seviian $1')
    .replace(/(.*)-mega/, 'Mega $1')
    .replace(/(.*)-f$/, '$1 ♀')
    .replace(/(.*)-m$/, '$1 ♂')

export const toSlug = (str = '') =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const toId = {
  encounter: (type) => toSlug(type + ' encounters'),
  boss: (boss, name) => toSlug(boss + ' ' + name)
}

export const toList = (arr, f = (i) => i, and = '&') => {
  if (!arr || arr.length === 0) return ''
  const front = arr.slice(0, -1)
  const last = arr.slice(-1)[0]
  return front.map(f).join(', ') + (front.length ? ` ${and} ` : '') + f(last)
}

export const toShowdownName = (name) => {
  if (!name) return ''
  const lower = name.toLowerCase().trim()
  
  // Special spelling/casing cases in Showdown:
  if (lower === 'mr-mime') return 'Mr. Mime'
  if (lower === 'mr-rime') return 'Mr. Rime'
  if (lower === 'mime-jr') return 'Mime Jr.'
  if (lower === 'type-null') return 'Type: Null'
  if (lower === 'farfetchd') return "Farfetch'd"
  if (lower === 'sirfetchd') return "Sirfetch'd"
  if (lower === 'ho-oh') return 'Ho-Oh'
  if (lower === 'porygon-z') return 'Porygon-Z'
  if (lower === 'flabebe') return 'Flabébé'
  
  // Regional forms
  if (lower.endsWith('-alola')) {
    return capitalise(lower.replace('-alola', '')) + '-Alola'
  }
  if (lower.endsWith('-galar')) {
    return capitalise(lower.replace('-galar', '')) + '-Galar'
  }
  if (lower.endsWith('-hisui')) {
    return capitalise(lower.replace('-hisui', '')) + '-Hisui'
  }
  if (lower.endsWith('-paldea')) {
    return capitalise(lower.replace('-paldea', '')) + '-Paldea'
  }
  if (lower.endsWith('-sevii')) {
    return capitalise(lower.replace('-sevii', '')) + '-Sevii'
  }
  if (lower.endsWith('-mega')) {
    return capitalise(lower.replace('-mega', '')) + '-Mega'
  }
  if (lower.endsWith('-gmax')) {
    return capitalise(lower.replace('-gmax', '')) + '-Gmax'
  }

  // Tapu Koko, Tapu Lele, etc.
  if (lower.startsWith('tapu-')) {
    return 'Tapu ' + capitalise(lower.replace('tapu-', ''))
  }

  // O-M, etc. (Jangmo-o, Hakamo-o, Kommo-o)
  if (lower === 'jangmo-o') return 'Jangmo-o'
  if (lower === 'hakamo-o') return 'Hakamo-o'
  if (lower === 'kommo-o') return 'Kommo-o'

  // Hyphenated forms/names that capitalise both parts in Showdown
  if (lower.includes('-')) {
    return lower.split('-').map(p => capitalise(p)).join('-')
  }

  return capitalise(lower)
}

export const toShowdownMove = (moveName) => {
  if (!moveName) return ''
  return moveName
    .split(/[\s-]+/)
    .map(word => capitalise(word))
    .join(' ')
}

export const toShowdownAbility = (abilityName) => {
  if (!abilityName) return ''
  return abilityName
    .split(/[\s-]+/)
    .map(word => capitalise(word))
    .join(' ')
}

export const toShowdownItem = (itemName) => {
  if (!itemName) return ''
  return itemName
    .split(/[\s-]+/)
    .map(word => capitalise(word))
    .join(' ')
}
