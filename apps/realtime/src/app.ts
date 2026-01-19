import { HttpServer } from '@/core/server/HttpServer';
import { WebSocketServer } from '@/core/server/WebSocketServer';

export class App {
  private httpServer: HttpServer;
  private wsServer: WebSocketServer;

  constructor() {
    this.httpServer = new HttpServer();
    this.wsServer = new WebSocketServer(this.httpServer.getServer());
  }

  start() {
    this.httpServer.start();
    this.wsServer.start();
  }
}
