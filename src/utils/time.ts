const durationRegex = /^(\d+)([smhd])$/i;

export const parseDurationToSeconds = (value: string, fallbackSeconds: number) => {
  const match = durationRegex.exec(value.trim());
  if (!match) {
    return fallbackSeconds;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case 's':
      return amount;
    case 'm':
      return amount * 60;
    case 'h':
      return amount * 60 * 60;
    case 'd':
      return amount * 60 * 60 * 24;
    default:
      return fallbackSeconds;
  }
};
