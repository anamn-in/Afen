#!/usr/bin/env node
import 'module-alias/register';
import { Command } from 'commander';
import { startCommand } from './commands/start';
import { stopCommand } from './commands/stop';
import { statusCommand } from './commands/status';
import { ingestCommand } from './commands/ingest';
import { rootCausesCommand } from './commands/root-causes';
import { graphCommand } from './commands/graph';
import { queryCommand } from './commands/query';

const program = new Command();

program
  .name('afen')
  .description('AFEN Hybrid Native CLI')
  .version('1.0.4');

program
  .command('start')
  .description('Start the AFEN runtime service')
  .action(startCommand);

program
  .command('stop')
  .description('Stop the AFEN runtime service')
  .action(stopCommand);

program
  .command('status')
  .description('Check AFEN runtime status')
  .action(statusCommand);

program
  .command('ingest <file>')
  .description('Ingest error data into AFEN')
  .action(ingestCommand);

program
  .command('send-error <file>')
  .description('Alias for ingest; sends error data to AFEN')
  .action(ingestCommand);

program
  .command('root-causes')
  .description('List root causes')
  .action(rootCausesCommand);

program
  .command('graph')
  .description('Show error graph')
  .action(graphCommand);

program
  .command('query <aql>')
  .description('Execute an AQL query')
  .action(queryCommand);

program.parse(process.argv);
