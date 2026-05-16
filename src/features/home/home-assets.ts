const categoryImages = [
  '/images/home/welding-sparks.webp',
  '/images/home/pump-connector.webp',
  '/images/home/battery-cables.webp',
  '/images/home/circuit-board.webp',
  '/images/home/tool-wall.webp',
  '/images/home/floor-lamp.webp',
] as const;

const productImages = [
  '/images/home/welding-sparks.webp',
  '/images/home/pump-connector.webp',
  '/images/home/circuit-board.webp',
  '/images/home/circuit-repair.webp',
  '/images/home/cordless-drill.webp',
  '/images/home/floor-lamp.webp',
  '/images/home/battery-cables.webp',
  '/images/home/angle-grinder.webp',
] as const;

function getCategoryImage(index: number): string {
  return categoryImages[index % categoryImages.length] ?? categoryImages[0];
}

function getProductImage(index: number): string {
  return productImages[index % productImages.length] ?? productImages[0];
}

export { getCategoryImage, getProductImage };
