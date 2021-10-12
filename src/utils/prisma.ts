import { PrismaClient, PrismaPromise } from '@prisma/client'
import { mockDeep } from 'jest-mock-extended'
import { DeepMockProxy } from 'jest-mock-extended/lib/mjs/Mock'
import { getUserId } from './jwt'

interface TableList {
  TABLE_NAME: string
}

// context object in resolver
interface ContextEvent {
  headers: {
    authorization: string
    Authorization: string
  }
}

export interface Context {
  req?: ContextEvent
  prisma: PrismaClient
  userId?: number
}

export type MockContext = {
  prisma: DeepMockProxy<PrismaClient>
}

export const createMockContext = (): MockContext => {
  return {
    prisma: mockDeep<PrismaClient>(),
  }
}

export const prisma = new PrismaClient()

// add prisma to context for resolvers
export function createContext(request: any) {
  const userId = getUserId(request)
  return {
    ...request,
    userId,
    prisma,
  }
}

export const clearData = async () => {
  try {
    const transactions: PrismaPromise<any>[] = []
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`

    const tables: Array<TableList> =
      await prisma.$queryRaw`SELECT TABLE_NAME from information_schema.TABLES WHERE TABLE_SCHEMA = 'shopping-test';`

    //console.log({ tables })
    for (const { TABLE_NAME } of tables) {
      //console.log({ TABLE_NAME })
      if (TABLE_NAME !== '_prisma_migrations') {
        try {
          transactions.push(prisma.$executeRawUnsafe(`TRUNCATE ${TABLE_NAME};`))
        } catch (error) {
          console.log({ error })
        }
      }
    }

    transactions.forEach(async (transaction) => {
      try {
        await transaction
        //console.log('Transaction executed')
      } catch (error) {
        console.log({ error })
      }
    })
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`
    //const stuff = await prisma.$transaction(transactions)
    //console.log('done')
  } catch (error) {
    console.error(error)
    return error
  }
}
