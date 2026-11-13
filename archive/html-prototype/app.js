const key = 'nexus-profile-v1';
const defaults = { name: 'Player One', bio: '', avatar: '', url: '' };
function safeUrl(value) {
  if (!value) return '';
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
}
function normalizeProfile(value) {
  return { name: typeof value?.name === 'string' && value.name.trim() ? value.name.trim().slice(0, 50) : defaults.name, bio: typeof value?.bio === 'string' ? value.bio.slice(0, 300) : '', avatar: safeUrl(value?.avatar), url: safeUrl(value?.url) };
}
let profile = defaults;
try { profile = normalizeProfile(JSON.parse(localStorage.getItem(key))); } catch { /* Keep the profile usable when browser storage is unavailable. */ }
const dialog = document.querySelector('#profile');
const form = document.querySelector('#profile-form');
function renderProfile() {
  document.querySelector('#creator').textContent = `By ${profile.name}`;
  const avatar = document.querySelector('#avatar');
  avatar.textContent = profile.name.charAt(0).toUpperCase();
  if (profile.avatar) { const img = document.createElement('img'); img.alt = ''; img.src = profile.avatar; img.onerror = () => { avatar.textContent = profile.name.charAt(0).toUpperCase(); }; avatar.replaceChildren(img); }
  document.querySelector('#mvp-visit').textContent = profile.url ? 'Visit project ↗' : 'Add project link ↗';
}
function openProfile() {
  for (const field of ['name', 'bio', 'avatar', 'url']) form.elements[field].value = profile[field];
  document.querySelector('#form-error').textContent = '';
  dialog.showModal();
}
document.querySelector('#profile-open').addEventListener('click', openProfile);
document.querySelector('#profile-close').addEventListener('click', () => dialog.close());
document.querySelector('#mvp-visit').addEventListener('click', () => profile.url ? window.open(profile.url, '_blank', 'noopener,noreferrer') : openProfile());
let toastTimer;
form.addEventListener('submit', event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const error = document.querySelector('#form-error');
  if (!data.name.trim()) { error.textContent = 'Enter a display name.'; return; }
  if (['url', 'avatar'].some(field => data[field] && !safeUrl(data[field]))) { error.textContent = 'Use an http or https URL for your project and avatar.'; return; }
  const next = normalizeProfile(data);
  try { localStorage.setItem(key, JSON.stringify(next)); } catch { error.textContent = 'Your browser could not save this profile. Allow site storage and try again.'; return; }
  profile = next;
  renderProfile(); dialog.close();
  const toast = document.querySelector('#toast'); toast.textContent = 'Profile saved'; toast.style.display = 'block';
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.style.display = 'none'; }, 3000);
});
let category = 'All';
function filterProjects() {
  const query = document.querySelector('#search').value.trim().toLowerCase();
  let count = 0;
  document.querySelectorAll('[data-category]').forEach(card => { card.hidden = !((category === 'All' || card.dataset.category === category) && card.dataset.search.includes(query)); if (!card.hidden) count++; });
  document.querySelector('#count').textContent = `Showing ${count} project${count === 1 ? '' : 's'}`;
  document.querySelector('#empty').hidden = count !== 0;
}
document.querySelector('#search').addEventListener('input', filterProjects);
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { category = button.dataset.filter; document.querySelectorAll('[data-filter]').forEach(item => { const active = item === button; item.classList.toggle('selected', active); item.setAttribute('aria-pressed', String(active)); }); filterProjects(); }));
renderProfile();
