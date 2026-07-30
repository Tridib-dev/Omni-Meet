/* eslint-disable @typescript-eslint/no-require-imports */
const http = require("node:http");
const { parse } = require("node:url");
const next = require("next");
const { WebSocketServer } = require("ws");
const { attachRoomSocket, verifyRoomRealtimeToken } = require("./lib/realtime/room-realtime");

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const websocketServer = new WebSocketServer({ noServer: true });

websocketServer.on("connection", (socket, request, tokenPayload) => {
  attachRoomSocket(tokenPayload.roomId, socket);

  socket.send(
    JSON.stringify({
      type: "room.discussion.ready",
      roomId: tokenPayload.roomId,
      eventId: tokenPayload.eventId,
      role: tokenPayload.role,
    })
  );

  socket.on("message", (rawMessage) => {
    const text = rawMessage.toString();
    if (text === "ping") {
      socket.send("pong");
    }
  });
});

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  server.on("upgrade", (request, socket, head) => {
    try {
      const { pathname, query } = parse(request.url || "", true);
      const token = typeof query.token === "string" ? query.token : null;
      const match = pathname?.match(/^\/api\/rooms\/([^/]+)\/realtime$/);
      if (!match || !token) {
        socket.destroy();
        return;
      }

      const tokenPayload = verifyRoomRealtimeToken(token);
      if (!tokenPayload || tokenPayload.eventId !== decodeURIComponent(match[1])) {
        socket.destroy();
        return;
      }

      websocketServer.handleUpgrade(request, socket, head, (ws) => {
        websocketServer.emit("connection", ws, request, tokenPayload);
      });
    } catch {
      socket.destroy();
    }
  });

  server.listen(port, () => {
    console.log(`> Server listening at http://localhost:${port} as ${dev ? "development" : "production"}`);
  });
});
