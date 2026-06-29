import { GraphStore } from './GraphStore';
import { GraphDao } from '@storage/daos/GraphDao';
import { DialectClient } from '@storage/DialectClient';

// Use the singleton DialectClient (default DB path from env or ./data/afen.db)
const client = DialectClient.getInstance();
const graphDao = new GraphDao(client);

export const graphStoreInstance = new GraphStore(graphDao);
graphStoreInstance.loadFromDb(); // hydrate on startup