import { StationRepository } from '../ports/StationRepository';
import { Station } from '../../domain/models/Station';

export class InitializeStationUseCase {
  constructor(private stationRepo: StationRepository) {}

  async execute(stationId: string): Promise<Station> {
    return await this.stationRepo.getStationStatus(stationId);
  }
}
