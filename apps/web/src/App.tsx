import { useEffect, useState, useRef, useCallback } from "react";
import "./App.css";

type ConnectionStatus = "connecting" | "connected" | "disconnected";

type MessageType = "sent" | "received" | "error" | "info";

type LogMessage = {
  id: string;
  timestamp: string;
  type: MessageType;
  data: unknown;
};

function App() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [messages, setMessages] = useState<LogMessage[]>([]);
  const [subscriptions, setSubscriptions] = useState<Set<string>>(new Set());
  const wsRef = useRef<WebSocket | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((type: MessageType, data: unknown) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString(),
        type,
        data,
      },
    ]);
  }, []);

  const connect = useCallback(() => {
    // Prevent multiple connections
    if (
      wsRef.current?.readyState === WebSocket.OPEN ||
      wsRef.current?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    setStatus("connecting");
    addLog("info", "Connecting to ws://localhost:8080...");

    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      setStatus("connected");
      addLog("info", "Connected");
    };

    ws.onclose = () => {
      setStatus("disconnected");
      addLog("info", "Disconnected");
      wsRef.current = null;
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      addLog("error", "WebSocket error occurred");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        addLog("received", data);

        if (data && typeof data === "object") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const typedData = data as any;
          if (
            typedData.type === "SUBSCRIBED" &&
            typeof typedData.channel === "string"
          ) {
            setSubscriptions((prev) => {
              const next = new Set(prev);
              next.add(typedData.channel);
              return next;
            });
          }
          if (
            typedData.type === "UNSUBSCRIBED" &&
            typeof typedData.channel === "string"
          ) {
            setSubscriptions((prev) => {
              const next = new Set(prev);
              next.delete(typedData.channel);
              return next;
            });
          }
        }
      } catch {
        addLog("received", event.data);
      }
    };

    wsRef.current = ws;
  }, [addLog]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
  }, []);

  useEffect(() => {
    // slight delay to ensure strict mode doesn't double connect aggressively
    const timeoutId = setTimeout(() => {
      connect();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Auto-scroll to bottom of logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const send = (payload: unknown) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      addLog("error", "Not connected");
      return;
    }
    wsRef.current.send(JSON.stringify(payload));
    addLog("sent", payload);
  };

  const handlePing = () => {
    send({ type: "PING" });
  };

  const handleUnsubscribe = (channel: string) => {
    send({ type: "UNSUBSCRIBE", channel });
  };

  return (
    <div className="container">
      <header className="header">
        <div className="header-left">
          <h1>WebSocket Debugger</h1>
          <div className={`status-badge ${status}`}>
            <span className="dot"></span>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        </div>
        <div className="header-actions">
          {status === "disconnected" ? (
            <button onClick={connect} className="primary">
              Reconnect
            </button>
          ) : (
            <button onClick={disconnect}>Disconnect</button>
          )}
        </div>
      </header>

      <main className="grid">
        <div className="controls-column">
          <div className="card">
            <h2>Actions</h2>
            <div className="actions-list">
              <div className="action-row">
                <button onClick={handlePing} className="full-width">
                  Send PING
                </button>
              </div>

              <div className="action-row">
                <button
                  onClick={() =>
                    send({ type: "SUBSCRIBE", channel: "dummy-channel" })
                  }
                  className="primary full-width"
                >
                  Subscribe "dummy-channel"
                </button>
              </div>

              <div className="action-row">
                <button
                  onClick={() =>
                    send({ type: "UNSUBSCRIBE", channel: "dummy-channel" })
                  }
                  className="secondary full-width" // Will style this as warning/error
                >
                  Unsubscribe "dummy-channel"
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Active Subscriptions</h2>
              <span className="count">{subscriptions.size}</span>
            </div>
            {subscriptions.size === 0 ? (
              <p className="empty-state">No active subscriptions</p>
            ) : (
              <ul className="sub-list">
                {Array.from(subscriptions).map((sub) => (
                  <li key={sub} className="sub-item">
                    <span>{sub}</span>
                    <button
                      onClick={() => handleUnsubscribe(sub)}
                      className="text-btn"
                      title="Unsubscribe"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="logs-column">
          <div className="card full-height">
            <div className="card-header">
              <h2>Logs</h2>
              <button onClick={() => setMessages([])} className="sm-btn">
                Clear
              </button>
            </div>
            <div className="logs-container" ref={logContainerRef}>
              {messages.length === 0 ? (
                <div className="empty-logs">Waiting for events...</div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`log-entry ${msg.type}`}>
                    <span className="timestamp">{msg.timestamp}</span>
                    <div className="log-badge">{msg.type.toUpperCase()}</div>
                    <pre className="log-data">
                      {typeof msg.data === "string"
                        ? msg.data
                        : JSON.stringify(msg.data, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
