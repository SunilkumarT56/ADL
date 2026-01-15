import 'dotenv/config';
import { App } from './app';

async function bootstrap() {
  try {
    const app = new App();
    app.start();
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

bootstrap();
