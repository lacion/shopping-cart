import { Cart, Category, Customer, Product } from '@prisma/client'
import * as Factory from 'factory.ts'
import { address, commerce, datatype, date, internet, name } from 'faker'

export const productFactory = Factory.Sync.makeFactory<Product>({
  id: `${Factory.each((i) => i)}`,
  name: commerce.productName(),
  price: 2500,
  description: commerce.productDescription(),
  expiresAt: date.future(),
  sku: datatype.number(),
  stockLevel: 20,
  categoryId: `${Factory.each((i) => i)}`,
})

export const categoryFactory = Factory.Sync.makeFactory<Category>({
  id: `${Factory.each((i) => i)}`,
  name: 'Food',
})

export const cartFactory = Factory.Sync.makeFactory<Cart>({
  id: `${Factory.each((i) => i)}`,
  customerId: `1`,
  isCheckedOut: false,
  createdAt: Factory.Sync.each(() => new Date()),
  updatedAt: Factory.Sync.each(() => new Date()),
})

export const cartItemFactory = Factory.Sync.makeFactory<Category>({
  id: `${Factory.each((i) => i)}`,
  name: 'Food',
})

export const customerFactory = Factory.Sync.makeFactory<Customer>({
  id: `${Factory.each((i) => i)}`,
  email: internet.email(),
  name: name.findName(),
  address: address.streetAddress(),
})
