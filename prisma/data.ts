import { Prisma, PrismaClient, PrismaPromise } from '@prisma/client'
import * as Factory from 'factory.ts'
import { address, commerce, datatype, date, internet, name } from 'faker'

const prisma = new PrismaClient()

interface TableList {
  TABLE_NAME: string
}

export const categoryFactory =
  Factory.Sync.makeFactory<Prisma.CategoryCreateManyInput>({
    name: Factory.Sync.each(() => commerce.department()),
  })

export const productFactory =
  Factory.Sync.makeFactory<Prisma.ProductCreateManyInput>({
    name: Factory.Sync.each(() => commerce.productName()),
    price: 2500,
    description: Factory.Sync.each(() => commerce.productDescription()),
    expiresAt: date.future(),
    sku: Factory.Sync.each(() => datatype.number()),
    stockLevel: 20,
    categoryId: 1,
  })

export const cartFactory = Factory.Sync.makeFactory<Prisma.CartCreateManyInput>(
  {
    customerId: 1,
    isCheckedOut: false,
    createdAt: Factory.Sync.each(() => new Date()),
    updatedAt: Factory.Sync.each(() => new Date()),
  },
)

export const customerFactory =
  Factory.Sync.makeFactory<Prisma.CustomerCreateManyInput>({
    email: Factory.Sync.each(() => internet.exampleEmail()),
    name: Factory.Sync.each(() => name.findName()),
    address: Factory.Sync.each(() => address.streetAddress()),
  })

export const clearData = async () => {
  try {
    const transactions: PrismaPromise<any>[] = []
    transactions.push(prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`)

    const tables: Array<TableList> =
      await prisma.$queryRaw`SELECT TABLE_NAME from information_schema.TABLES WHERE TABLE_SCHEMA = 'shopping-test';`

    console.log({ tables })
    for (const { TABLE_NAME } of tables) {
      if (TABLE_NAME !== '_prisma_migrations') {
        try {
          transactions.push(prisma.$executeRaw`TRUNCATE TABLE ${TABLE_NAME};`)
        } catch (error) {
          console.log({ error })
        }
      }
    }

    transactions.push(prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`)

    console.log({ transactions })
    await prisma.$transaction(transactions)
  } catch (error) {
    console.error(error)
  }
}
