/**
 * Novunt Assistant Wrapper
 * Manages assistant state and listens for open events
 */

'use client';

import { useEffect, useState } from 'react';
import { NovuntAssistant } from './NovuntAssistant';

export function NovuntAssistantWrapper() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpenAssistant = () => {
      setIsOpen(true);
    };

    // Listen for custom event from HorizontalNav
    window.addEventListener('openNovuntAssistant', handleOpenAssistant);

    return () => {
      window.removeEventListener('openNovuntAssistant', handleOpenAssistant);
    };
  }, []);

  return <NovuntAssistant isOpen={isOpen} onClose={() => setIsOpen(false)} />;
}
