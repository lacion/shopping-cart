import { PrismaClient } from '@prisma/client'
import { categoryFactory, customerFactory, productFactory } from './data'

const prisma = new PrismaClient()

async function main() {
  const categoryA = categoryFactory.build({ id: 1 })
  const categoryB = categoryFactory.build({ id: 2 })

  // create product categories
  const categories = prisma.category.createMany({
    data: [categoryA, categoryB],
  })

  //create products dummy data
  const productA = productFactory.build({ id: 1 })
  const productB = productFactory.build({ id: 2 })

  // create products
  const products = prisma.product.createMany({
    data: [productA, productB],
  })

  // create customers dummy data
  const customerA = customerFactory.build({ id: 1, email: 'example@user.com' })

  // create customers
  const customers = prisma.customer.createMany({
    data: [customerA],
  })

  const res = await prisma.$transaction([categories, products, customers])

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
