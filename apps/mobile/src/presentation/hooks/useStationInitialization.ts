import { useState, useEffect } from 'react';
import { useDependencies } from '../../infrastructure/di/DependencyProvider';
import { Station } from '../../core/domain/models/Station';

export const useStationInitialization = (stationId: string) => {
  const { initializeStationUseCase } = useDependencies();
  const [station, setStation] = useState<Station | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const result = await initializeStationUseCase.execute(stationId);
        if (isMounted) {
          setStation(result);
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setIsLoading(false);
          // Handle error state here if needed
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [initializeStationUseCase, stationId]);

  return { station, isLoading };
};
