import http from 'http';
import express from 'express';

export class HttpServer {
  private app = express();
  private server: http.Server;

  constructor() {
    this.server = http.createServer(this.app);
    this.app.get("/health", (_, res) => res.send("OK"));
  }

  start(port = 3004) {
    this.server.listen(port, () =>
      console.log(`HTTP running on ${port}`)
    );
  }

  getServer() {
    return this.server;
  }
}
