export const formatError = (nameOfFunction: string, error: Error) => {
  return process.env.NODE_ENV === 'test'
    ? ''
    : console.log(`----${nameOfFunction}----`, error)
}

export const formatPrice = (price: number): string => {
  if (!price) {
    return 'R' + (0).toFixed(2)
  }

  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  })
    .format(price / 100)
    .replace(',', '.')
}
