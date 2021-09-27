## Example Flow

In order for the API to identify the user you are logging in as, you must provide a valid **email**. You can get this from the Customer table by using **npx prisma studio**.

##### Login as an existing user

```graphql
query {
  login(login: { email: "example@user.com" })
}
```

The response will be an auth token that you can add as a header to your requests.

You can use the following requests to test the cart functionality. The default stock level is **20** so you can add up to **20** items of the same product to the cart.

##### Add a product To Cart

```graphql
mutation {
  addToCart(
    input: {
      cartId: CART_ID_FROM_DB
      productId: PRODUCT_ID_FROM_DB
      quantity: QUANTITY
    }
  ) {
    id
    createdAt
    updatedAt
    isCheckedOut
    total
    cartItems {
      id
      createdAt
      updatedAt
      product {
        id
        name
      }
    }
  }
}
```

##### Remove a product from Cart

```graphql
mutation {
  removeFromCart(
    input: { cartId: CART_ID_FROM_DB, cartItemId: CART_ITEM_ID_FROM_DB }
  ) {
    id
    createdAt
    updatedAt
    isCheckedOut
    total
    cartItems {
      id
      createdAt
      updatedAt
      quantity
      price
      product {
        id
        name
        price
        stockLevel
      }
    }
  }
}
```

##### Update quantity for a product in Cart

```graphql
mutation {
  updateQuantity(
    input: { cartItemId: CART_ITEM_ID_FROM_DB, quantity: QUANTITY }
  ) {
    id
    createdAt
    updatedAt
    quantity
    price
    product {
      id
      name
      price
      stockLevel
    }
  }
}
```

##### Checkout Cart

```graphql
mutation {
  checkout(cartId: CART_ID_FROM_DB) {
    id
    isCheckedOut
  }
}
```
