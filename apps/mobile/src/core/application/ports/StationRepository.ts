import { Station } from '../../domain/models/Station';

export interface StationRepository {
  getStationStatus(id: string): Promise<Station>;
}
