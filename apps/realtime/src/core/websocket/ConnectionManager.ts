import { WebSocket } from 'ws';
import { Connection } from '@/core/websocket/Connection';
import { randomUUID } from 'crypto';

export class ConnectionManager {
  private connections = new Map<string, Connection>();

  register(socket: WebSocket) {
    const id = randomUUID();
    const conn = new Connection(socket, id);
    this.connections.set(id, conn);

    socket.on('message', (msg) => {
      console.log('Received:', msg.toString());
    });

    socket.on('close', () => {
      this.connections.delete(id);
    });
  }
}
