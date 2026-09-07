import { useMemo } from 'react';
import { cn } from '../../utils/cn';

function getStrength(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

const LABELS = ['Weak', 'Fair', 'Good', 'Strong'];
const COLORS = ['bg-red-400', 'bg-amber-400', 'bg-green-400', 'bg-green-500'];

export default function PasswordStrengthMeter({ password }) {
  const strength = useMemo(() => getStrength(password), [password]);
  if (!password) return null;
  const level = Math.max(strength - 1, 0);

  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full bg-navy-100 dark:bg-white/10 transition-colors duration-300',
              i <= level && COLORS[level]
            )}
          />
        ))}
      </div>
      <p className="mt-1 text-[11px] font-medium text-navy-400 dark:text-navy-300">{LABELS[level]}</p>
    </div>
  );
}