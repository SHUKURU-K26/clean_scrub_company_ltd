import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const MAX_SIZE_MB = 2;

export default function AvatarUpload({ name, avatarUrl, onChange }) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_SIZE_MB}MB`);
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result);
      setLoading(false);
    };
    reader.onerror = () => {
      toast.error('Could not read that image — try another one');
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative w-24 h-24 mx-auto sm:mx-0 shrink-0">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-navy-700 to-green-600 flex items-center justify-center overflow-hidden shadow-lg shadow-navy-900/10">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-white font-display font-bold text-2xl">{(name || 'U').charAt(0).toUpperCase()}</span>
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-xl glass-strong flex items-center justify-center text-navy-600 dark:text-white hover:text-green-500"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}