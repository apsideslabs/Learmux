/**
 * Helpers for reading the tutorial collection: sorting, category grouping and
 * slugging. Kept in one place so the index, category, search and article pages
 * all agree on ordering and naming.
 */

import { getCollection, type CollectionEntry } from 'astro:content';

export type Tutorial = CollectionEntry<'tutorials'>;

export async function allTutorials(): Promise<Tutorial[]> {
  const list = await getCollection('tutorials');
  return list.sort((a, b) => a.data.order - b.data.order);
}

/** Newest first, for the homepage feed. */
export async function recentTutorials(): Promise<Tutorial[]> {
  const list = await getCollection('tutorials');
  return list.sort((a, b) => (a.data.date < b.data.date ? 1 : -1));
}

export function categorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function categoryGroups(): Promise<{ name: string; slug: string; items: Tutorial[] }[]> {
  const list = await allTutorials();
  const map = new Map<string, Tutorial[]>();
  for (const t of list) {
    const arr = map.get(t.data.category) ?? [];
    arr.push(t);
    map.set(t.data.category, arr);
  }
  return [...map.entries()]
    .map(([name, items]) => ({ name, slug: categorySlug(name), items }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function thumbnailFor(id: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '') + '/';
  return `${base}thumbs/${id}.svg`;
}
