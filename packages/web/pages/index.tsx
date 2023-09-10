import { useEffect } from 'react';
import { useAppStore } from 'stores';

export function Bot() {
  const { getBotInfo } = useAppStore();

  useEffect(() => {
    getBotInfo('64fb53b6e28b54f06f2852f9');
  }, []);

  return (
    <div className="flex flex-col md:!flex-row h-full md:!p-10 md:gap-10">
      Welcome!
    </div>
  );
}

export default Bot;
