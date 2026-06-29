import { RuntimeServer } from './RuntimeServer';
import { Migrator } from '@storage/Migrator';
import { logger } from '@core/utils/Logger';

const port = parseInt(process.env.AFEN_RUNTIME_PORT || '8787', 10);

async function main() {
  try {
    await Migrator.run();
    const server = new RuntimeServer(port);
    server.start();
  } catch (err) {
    logger.error('[Runtime] Fatal error:', err);
    process.exit(1);
  }
}

main();