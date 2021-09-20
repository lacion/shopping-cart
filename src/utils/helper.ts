export const formatError = (nameOfFunction: string, error: Error) => {
  return process.env.NODE_ENV === 'test'
    ? ''
    : console.log(`----${nameOfFunction}----`, error)
}
