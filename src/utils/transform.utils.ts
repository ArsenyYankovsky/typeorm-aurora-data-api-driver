const pad = (val: string | number, num = 2) => '0'.repeat(num - (val.toString()).length) + val

export const dateToDateTimeString = (date: Date) => {
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth() + 1 // Convert to human month
  const day = date.getUTCDate()

  const hours = date.getUTCHours()
  const minutes = date.getUTCMinutes()
  const seconds = date.getUTCSeconds()
  const ms = date.getUTCMilliseconds()

  const fraction = ms <= 0 ? '' : `.${pad(ms, 3)}`

  return `${year}-${pad(month)}-${pad(day)} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}${fraction}`
}

export const dateToDateString = (date: Date | string) => {
  if (typeof date === 'string') {
    return date
  }

  const year = date.getUTCFullYear()
  const month = date.getUTCMonth() + 1 // Convert to human month
  const day = date.getUTCDate()

  return `${year}-${pad(month)}-${pad(day)}`
}

export const dateToTimeString = (date: Date | string) => {
  if (typeof date === 'string') {
    return date
  }

  const hours = date.getUTCHours()
  const minutes = date.getUTCMinutes()
  const seconds = date.getUTCSeconds()
  const ms = date.getUTCMilliseconds()

  const fraction = ms <= 0 ? '' : `.${pad(ms, 3)}`

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}${fraction}`
}

export const simpleArrayToString = (value: any[]|any): string[]|any => {
  if (Array.isArray(value)) {
    return (value as any[])
      .map((i) => String(i))
      .join(',')
  }

  return value
}

export const stringToSimpleArray = (value: string|any): any[] => {
  if (value instanceof String || typeof value === 'string') {
    if (value.length > 0) {
      return value.split(',')
    }
    return []
  }

  return value
}
