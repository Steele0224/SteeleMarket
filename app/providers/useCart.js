import { create } from "zustand";
import {
  validationCommitSession,
  validationGetSession,
} from "../sessions/validationStates.server";
import { getCookie } from "../utils/getCookie";

import { SET_COOKIE, CART_DATA, VALIDATION_STATE_SUCCESS } from "../types";

const CART_UPDATED_SUCCESS_MESSAGE = "Signed up successfully!";

export const useCartState = create((set, get) => ({
  cart: [],
  totalItems: 0,
  totalPrice: 0,
  showCart: false,
  toggleShowCart: () => set((state) => ({ showCart: !state.showCart })),
  addToCart: (product) => {
    const cart = get().cart;
    const cartItem = cart.find((item) => item.id === product.id);

    if (cartItem) {
      const updateCart = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );

      set((state) => ({
        cart: updateCart,
        totalItems: state.totalItems + 1,
        totalPrice: Number(state.totalPrice) + Number(product.price),
      }));
      return {
        cart: updateCart,
        totalItems: get().totalItems,
        totalPrice: get().totalPrice,
      };
    } else {
      const updatedCart = [...cart, { ...product, quantity: 1 }];

      set((state) => ({
        cart: updatedCart,
        totalItems: state.totalItems + 1,
        totalPrice: Number(state.totalPrice) + Number(product.price),
      }));
      return {
        cart: updatedCart,
        totalItems: get().totalItems,
        totalPrice: get().totalPrice,
      };
    }
  },

  removeFromCart: (product) => {
    const productToDelete = get().cart.find(
      (_product) => _product.id == product.id
    );
    if (productToDelete) {
      set((state) => ({
        cart: state.cart.filter((_product) => _product.id !== product.id),
        totalItems: state.totalItems - product.quantity,
        totalPrice:
          Number(state.totalPrice) - Number(product.price) * product.quantity,
      }));
    }
    return {
      cart: get().cart,
      totalItems: get().totalItems,
      totalPrice: get().totalPrice,
    };
  },
  subtractFromCart: (product) => {
    const productToSubtract = get().cart.find(
      (_product) => _product.id == product.id
    );
    if (productToSubtract) {
      if (productToSubtract.quantity <= 1) {
        return get().removeFromCart(product);
      } else {
        const updatedCart = get().cart.map((_product) =>
          _product.id === product.id
            ? { ..._product, quantity: _product.quantity - 1 }
            : _product
        );
        set((state) => ({
          cart: updatedCart,
          totalItems: state.totalItems - 1,
          totalPrice: Number(state.totalPrice) - Number(product.price),
        }));
      }
    }
    return {
      cart: get().cart,
      totalItems: get().totalItems,
      totalPrice: get().totalPrice,
    };
  },
  setCartData: (cartData) => {
    set((state) => ({
      cart: cartData.cart,
      totalItems: cartData.totalItems,
      totalPrice: cartData.totalPrice,
    }));
  },
}));

export const updatedCartCookieHeaders = async (request, cartData) => {
  if (request) {
    const validationSession = await validationGetSession(getCookie(request));

    validationSession.set(CART_DATA, cartData);

    const validationCommitedSession = await validationCommitSession(
      validationSession
    );
    return {
      headers: [[SET_COOKIE, validationCommitedSession]],
    };
  }
};
