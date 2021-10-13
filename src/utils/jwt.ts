import { sign, verify } from 'jsonwebtoken'
import { clone } from 'lodash'
import { Context } from './prisma'

interface Token {
  id: string
}

interface Payload {
  toJSON?: Function
}

// get user id from auth token
export function getUserId({ req }: Context): string | undefined {
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
export const issue = (payload: Payload, jwtOptions = {}) => {
  return sign(
    clone(payload.toJSON ? payload.toJSON() : payload),
    process.env.JWT_SECRET as string,
    { ...jwtOptions, expiresIn: '1d' },
  )
}
