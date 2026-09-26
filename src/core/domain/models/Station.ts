export interface Station {
  id: string;
  name: string;
  status: 'initializing' | 'online' | 'offline';
}
