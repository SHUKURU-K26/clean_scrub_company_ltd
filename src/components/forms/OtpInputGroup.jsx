import { OTPInput, REGEXP_ONLY_DIGITS } from 'input-otp';
import { cn } from '../../utils/cn';

export default function OtpInputGroup({ value, onChange, length = 6, error }) {
  return (
    <div className="w-full">
      <OTPInput
        value={value}
        onChange={onChange}
        maxLength={length}
        pattern={REGEXP_ONLY_DIGITS}
        containerClassName="flex items-center justify-between gap-2"
        render={({ slots }) => (
          <>
            {slots.map((slot, idx) => (
              <div
                key={idx}
                className={cn(
                  'relative w-11 h-12 sm:w-12 sm:h-14 rounded-xl glass flex items-center justify-center text-lg font-bold text-navy-800 dark:text-white transition-all duration-150',
                  slot.isActive && 'ring-2 ring-green-400 border-green-400',
                  error && 'border-red-400'
                )}
              >
                {slot.char}
                {slot.hasFakeCaret && <div className="absolute w-px h-5 bg-green-500 animate-pulse" />}
              </div>
            ))}
          </>
        )}
      />
      {error && <p className="mt-2 text-xs text-red-500 font-medium text-center">{error}</p>}
    </div>
  );
}