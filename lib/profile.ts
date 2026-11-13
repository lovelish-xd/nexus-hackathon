export type Profile = { name: string; bio: string; avatar: string; url: string };
export const profileKey = 'nexus-profile-v1';
export const defaultProfile: Profile = { name: 'MVPicks', bio: 'Building better ways to play, predict, and connect.', avatar: '', url: '' };
export function safeUrl(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return '';
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
}
export function normalizeProfile(value: unknown): Profile {
  const data = value && typeof value === 'object' ? value as Partial<Profile> : {};
  return { name: typeof data.name === 'string' && data.name.trim() ? data.name.trim().slice(0, 50) : defaultProfile.name, bio: typeof data.bio === 'string' ? data.bio.slice(0, 300) : defaultProfile.bio, avatar: safeUrl(data.avatar), url: safeUrl(data.url) };
}
