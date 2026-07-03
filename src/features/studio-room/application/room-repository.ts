export type RoomRecord = Readonly<{
  id: string;
  name: string;
  slug: string;
  description: string | null;
  timezone: string;
  isActive: boolean;
  displayOrder: number;
}>;

export interface RoomRepository {
  findActiveBySlug(slug: string): Promise<RoomRecord | null>;
  listActive(): Promise<RoomRecord[]>;
}
