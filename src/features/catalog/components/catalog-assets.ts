const catalogImages = [
  '/images/home/welding-sparks.webp',
  '/images/home/pump-connector.webp',
  '/images/home/circuit-board.webp',
  '/images/home/circuit-repair.webp',
  '/images/home/cordless-drill.webp',
  '/images/home/floor-lamp.webp',
  '/images/home/battery-cables.webp',
  '/images/home/angle-grinder.webp',
  '/images/home/hero-generator.webp',
] as const;

function getCatalogImage(index: number): string {
  return catalogImages[index % catalogImages.length] ?? catalogImages[0];
}

export { getCatalogImage };
