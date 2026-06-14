import { app } from '../app';
import { Migrator } from '../storage/Migrator';

export class ApiServer {
  private port: number;

  constructor(port: number = parseInt(process.env.PORT || '3000', 10)) {
    this.port = port;
  }

  async start(): Promise<void> {
    await Migrator.run();
    app.listen(this.port, () => {
      console.log(`Afen API server running on port ${this.port}`);
    });
  }
}

export { app };