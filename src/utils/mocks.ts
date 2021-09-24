import { Prisma } from '@prisma/client'
import * as Factory from 'factory.ts'
import { address, commerce, datatype, date, internet, name } from 'faker'

export const categoryFactory =
  Factory.Sync.makeFactory<Prisma.CategoryCreateManyInput>({
    name: commerce.department(),
  })

export const productFactory =
  Factory.Sync.makeFactory<Prisma.ProductCreateManyInput>({
    name: commerce.productName(),
    price: 2500,
    description: commerce.productDescription(),
    expiresAt: date.future(),
    sku: datatype.number(),
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
    name: name.findName(),
    address: address.streetAddress(),
  })
