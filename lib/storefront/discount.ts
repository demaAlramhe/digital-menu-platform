export function calculateDiscount(
  price: number,
  originalPrice: number | null
): { hasDiscount: boolean; percentage: number } {
  if (!originalPrice || originalPrice <= price) {
    return { hasDiscount: false, percentage: 0 };
  }
  const percentage = Math.round(
    ((originalPrice - price) / originalPrice) * 100
  );
  return { hasDiscount: true, percentage };
}
