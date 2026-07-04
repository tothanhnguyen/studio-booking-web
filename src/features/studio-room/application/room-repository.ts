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
  listAll(): Promise<RoomRecord[]>;
  upsert(input: RoomUpsertData): Promise<RoomRecord>;
  setActive(id: string, active: boolean): Promise<RoomRecord>;
}

export type RoomUpsertData = Omit<RoomRecord, "id"> & Readonly<{ id?: string }>;
