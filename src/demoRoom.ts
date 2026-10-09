const ROOM_STORAGE = 'sunny-island-room-v1';
let activeRoom = '';
export function demoRoomToken() {
  if (activeRoom) return activeRoom;
  const supplied = new URLSearchParams(window.location.hash.slice(1)).get('island');
  const saved = window.localStorage.getItem(ROOM_STORAGE);
  const valid = (value: string | null): value is string => Boolean(value && /^[a-f0-9]{64}$/.test(value));
  activeRoom = valid(supplied) ? supplied : valid(saved) ? saved : Array.from(crypto.getRandomValues(new Uint8Array(32)), x => x.toString(16).padStart(2, '0')).join('');
  window.localStorage.setItem(ROOM_STORAGE, activeRoom);
  return activeRoom;
}
export function demoRoomLink() {
  const url = new URL(window.location.href);
  url.hash = new URLSearchParams({ island: demoRoomToken() }).toString();
  return url.href;
}
