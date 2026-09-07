import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { useThemeStore } from './store/themeStore';
import { useLanguageStore } from './store/languageStore';
import AppRoutes from './routes/AppRoutes';

function App() {
  const initTheme = useThemeStore((state) => state.initTheme);
  const initLanguage = useLanguageStore((state) => state.initLanguage);

  useEffect(() => {
    initTheme();
    initLanguage();
  }, [initTheme, initLanguage]);

  return (
    <>
      <AppRoutes />
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}

export default App;