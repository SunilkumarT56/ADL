import { WebSocket } from "ws";

export class Connection {
  constructor(
    public readonly socket: WebSocket,
    public readonly clientId: string
  ) {}

  send(data: any) {
    this.socket.send(JSON.stringify(data));
  }
}
