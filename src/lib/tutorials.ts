/**
 * Helpers for reading the tutorial collection: ordering, track grouping,
 * categories and formatting. Kept in one place so the homepage, the course
 * pages, the category pages, search and the article template all agree.
 */

import { getCollection, type CollectionEntry } from 'astro:content';
import { tracks, trackById, type Track } from './curriculum';

export type Tutorial = CollectionEntry<'tutorials'>;

/** Every lesson, in curriculum order. */
export async function allTutorials(): Promise<Tutorial[]> {
  const list = await getCollection('tutorials');
  return list.sort((a, b) => a.data.order - b.data.order);
}

/** Newest first, for the homepage feed. */
export async function recentTutorials(): Promise<Tutorial[]> {
  const list = await getCollection('tutorials');
  return list.sort((a, b) => (a.data.date < b.data.date ? 1 : -1));
}

export interface TrackGroup {
  track: Track;
  lessons: Tutorial[];
}

/** Tracks in order, each with its lessons in order. */
export async function trackGroups(): Promise<TrackGroup[]> {
  const list = await allTutorials();
  return tracks
    .map((track) => ({ track, lessons: list.filter((l) => l.data.track === track.id) }))
    .filter((g) => g.lessons.length > 0);
}

export function lessonCount(): Promise<number> {
  return getCollection('tutorials').then((l) => l.length);
}

/** The track a lesson belongs to, if it is defined. */
export function trackOf(lesson: Tutorial): Track | undefined {
  return trackById(lesson.data.track);
}

/** Position of a lesson within its own track, and the track size. */
export async function positionInTrack(lesson: Tutorial): Promise<{ index: number; total: number }> {
  const list = await allTutorials();
  const siblings = list.filter((l) => l.data.track === lesson.data.track);
  return { index: siblings.findIndex((l) => l.id === lesson.id) + 1, total: siblings.length };
}

/** The lesson that comes before and after this one in curriculum order. */
export async function neighbours(lesson: Tutorial): Promise<{ prev?: Tutorial; next?: Tutorial }> {
  const list = await allTutorials();
  const i = list.findIndex((l) => l.id === lesson.id);
  return { prev: list[i - 1], next: list[i + 1] };
}

export function categorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export interface CategoryGroup {
  name: string;
  slug: string;
  items: Tutorial[];
}

/** All categories, alphabetical, with their lessons in curriculum order. */
export async function categoryGroups(): Promise<CategoryGroup[]> {
  const list = await allTutorials();
  const map = new Map<string, Tutorial[]>();
  for (const lesson of list) {
    const key = lesson.data.category;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(lesson);
  }
  return [...map.entries()]
    .map(([name, items]) => ({ name, slug: categorySlug(name), items }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
