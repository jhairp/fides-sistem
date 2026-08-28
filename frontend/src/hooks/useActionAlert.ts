import { useState, useCallback } from 'react';
import type { ActionOverlayType } from '../components/common/ActionOverlay';

export const useActionAlert = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [alertType, setAlertType] = useState<ActionOverlayType>('creado');
  const [alertMessage, setAlertMessage] = useState('');

  const triggerAlert = useCallback((type: ActionOverlayType, message: string, durationMs: number = 1800) => {
    setAlertType(type);
    setAlertMessage(message);
    setIsVisible(true);

    setTimeout(() => {
      setIsVisible(false);
    }, durationMs);
  }, []);

  return {
    isVisible,
    alertType,
    alertMessage,
    triggerAlert,
  };
};
