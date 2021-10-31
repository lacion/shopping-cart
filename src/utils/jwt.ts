import { sign, verify } from 'jsonwebtoken'
import { clone } from 'lodash'
import { Context } from './prisma'

interface Token {
  id: number
}

type User = {
  id: number
}
// get user id from auth token
export function getUserId({ req }: Context): number | undefined {
  if (req) {
    const Authorization = req.headers.authorization || req.headers.Authorization

    if (Authorization) {
      const token = Authorization.replace('Bearer ', '')

      const verifiedToken = verify(
        token,
        process.env.JWT_SECRET as string,
      ) as Token

      return verifiedToken && verifiedToken.id
    }
  }
  return undefined
}

// issue new token based on payload
export const issue = (payload: string | User | Buffer, jwtOptions = {}) => {
  return sign(clone(payload), process.env.JWT_SECRET as string, {
    ...jwtOptions,
    expiresIn: '1d',
  })
}
