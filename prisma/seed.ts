import { PrismaClient } from '@prisma/client'
import { categoryFactory, customerFactory, productFactory } from './data'

const prisma = new PrismaClient()

async function main() {
  // create product categories
  const categories = categoryFactory.buildList(2)

  //create products dummy data
  const products = productFactory.buildList(2)

  // create customers dummy data
  const customerA = customerFactory.build({ id: 1, email: 'example@user.com' })

  // create customers
  const customers = prisma.customer.createMany({
    data: [customerA],
  })

  const res = await prisma.$transaction([
    prisma.category.createMany({
      data: categories,
    }),
    prisma.product.createMany({
      data: products,
    }),
    customers,
  ])

  console.log('seed data created', { res })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
