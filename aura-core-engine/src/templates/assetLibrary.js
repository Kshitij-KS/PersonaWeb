/**
 * @file assetLibrary.js
 * Small built-in asset catalog (placeholder URLs for demo).
 */

export const IMAGES = Object.freeze([
  { id: 'img-1', url: 'https://picsum.photos/seed/aura1/1200/700', alt: 'Product hero 1' },
  { id: 'img-2', url: 'https://picsum.photos/seed/aura2/1200/700', alt: 'Product hero 2' },
  { id: 'img-3', url: 'https://picsum.photos/seed/aura3/1200/700', alt: 'Product hero 3' },
  { id: 'img-4', url: 'https://picsum.photos/seed/aura4/1200/700', alt: 'Product hero 4' },
  { id: 'img-5', url: 'https://picsum.photos/seed/aura5/1200/700', alt: 'Product hero 5' },
  { id: 'img-6', url: 'https://picsum.photos/seed/aura6/1200/700', alt: 'Product hero 6' },
  { id: 'img-7', url: 'https://picsum.photos/seed/aura7/1200/700', alt: 'Product hero 7' },
  { id: 'img-8', url: 'https://picsum.photos/seed/aura8/1200/700', alt: 'Product hero 8' },
  { id: 'img-9', url: 'https://picsum.photos/seed/aura9/1200/700', alt: 'Product hero 9' },
  { id: 'img-10', url: 'https://picsum.photos/seed/aura10/1200/700', alt: 'Product hero 10' }
]);

export const BADGES = Object.freeze([
  { id: 'badge-1', label: 'Fast setup' },
  { id: 'badge-2', label: 'Best value' },
  { id: 'badge-3', label: 'Top rated' },
  { id: 'badge-4', label: 'Limited time' },
  { id: 'badge-5', label: 'Secure' },
  { id: 'badge-6', label: 'Free trial' },
  { id: 'badge-7', label: 'New arrival' },
  { id: 'badge-8', label: 'Editor’s pick' }
]);

/**
 * Lookup helper.
 * @param {'image'|'badge'} type
 * @param {string} id
 * @returns {any|null}
 */
export function getAsset(type, id) {
  const list = type === 'image' ? IMAGES : BADGES;
  return list.find((a) => a.id === id) || null;
}

