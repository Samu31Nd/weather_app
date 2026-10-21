import { StationRepository } from '../../core/application/ports/StationRepository';
import { Station } from '../../core/domain/models/Station';

export class MockStationRepository implements StationRepository {
  async getStationStatus(id: string): Promise<Station> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id, name: 'Meteo Base', status: 'online' });
      }, 4000);
    });
  }
}
