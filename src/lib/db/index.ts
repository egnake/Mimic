import Dexie, { type Table } from 'dexie';
import { KeyProfile, ProfileTemplate } from '@/types';

export class MimicDatabase extends Dexie {
  profiles!: Table<KeyProfile, string>;
  templates!: Table<ProfileTemplate, string>;
  settings!: Table<{ id: string; value: any }, string>;

  constructor() {
    super('MimicDatabase');
    this.version(1).stores({
      profiles: 'id, name, family, updatedAt, createdAt',
      templates: 'id, name, family',
      settings: 'id'
    });
  }
}

export const db = new MimicDatabase();
