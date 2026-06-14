import { Migrator } from '../../src/storage/Migrator';
import { DialectClient } from '../../src/storage/DialectClient';
import { Deduplicator } from '../../src/core/engines/Deduplicator';

beforeAll(async () => {
  process.env.DB_PATH = ':memory:';
  await Migrator.run();
});

afterAll(() => {
  const client = DialectClient.getInstance();
  client.close();
  Deduplicator.shutdownAll();
});