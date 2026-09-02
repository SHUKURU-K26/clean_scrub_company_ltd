import { cn } from '../../utils/cn';

export default function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-xl bg-navy-100/70 dark:bg-white/5', className)} />;
}