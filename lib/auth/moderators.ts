export const MODERATOR_USERNAMES = (process.env.MODERATOR_USERNAMES ?? '')
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean)
