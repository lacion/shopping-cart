import merge from 'lodash/merge'
import Auth from './Auth'
import Cart from './Cart'
import CartItem from './CartItem'
import Product from './Product'

export default merge({}, Auth, Cart, CartItem, Product)
