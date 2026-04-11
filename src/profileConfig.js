export const PROFILE_NAMES = ['Angie', 'Oliver', 'Mom'];

export const PROFILE_CONFIG = {
  Angie:  { photo: '/pic-profile/angie.jpg',  barColor: 'from-pink-400 to-fuchsia-500', glowColor: 'shadow-pink-400' },
  Oliver: { photo: '/pic-profile/oliver.jpg', barColor: 'from-blue-400 to-indigo-500',  glowColor: 'shadow-blue-400' },
  Mom:    { photo: '/pic-profile/mom.jpg',    barColor: 'from-violet-400 to-purple-500', glowColor: 'shadow-violet-400' },
};

export const ALL_PHOTOS = [
  { filename: 'angie.jpg',  src: '/pic-profile/angie.jpg',  label: 'Angie' },
  { filename: 'oliver.jpg', src: '/pic-profile/oliver.jpg', label: 'Oliver' },
  { filename: 'mom.jpg',    src: '/pic-profile/mom.jpg',    label: 'Mom' },
];

/** Returns the URL for a player's photo. Checks base64 upload first, then preset filename, then config default. */
export function getPlayerPhoto(playerName, playerPhoto, playerPhotoData) {
  if (playerPhotoData) return playerPhotoData;
  if (playerPhoto) return `/pic-profile/${playerPhoto}`;
  return PROFILE_CONFIG[playerName]?.photo ?? null;
}
