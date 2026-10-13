export const FREE_SHIPPING_THRESHOLD = 2000;
export const SHIPPING_FEE = 150;

export function computeShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD || subtotal <= 0 ? 0 : SHIPPING_FEE;
}
