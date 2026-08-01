/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require("node:crypto");

const GLOBAL_KEY = "__roomRealtimeState__";
const DEFAULT_SECRET = "dev-room-realtime-secret";

function getState() {
  const globalScope = globalThis;
  if (!globalScope[GLOBAL_KEY]) {
    globalScope[GLOBAL_KEY] = {
      rooms: new Map(),
    };
  }

  return globalScope[GLOBAL_KEY];
}

function getSecret() {
  return (
    process.env.ROOM_REALTIME_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.CLERK_SECRET_KEY ||
    (process.env.NODE_ENV === "production" ? null : DEFAULT_SECRET)
  );
}

function base64UrlEncode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function base64UrlDecode(value) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
}

function sign(value) {
  const secret = getSecret();
  if (!secret) {
    throw new Error("[RoomRealtime] ROOM_REALTIME_SECRET is missing");
  }

  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function createRoomRealtimeToken(payload) {
  const secret = getSecret();
  if (!secret) {
    throw new Error("[RoomRealtime] ROOM_REALTIME_SECRET is missing");
  }

  const issuedAt = Date.now();
  const tokenPayload = {
    ...payload,
    iat: issuedAt,
    exp: issuedAt + 60_000,
  };

  const encoded = base64UrlEncode(tokenPayload);
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

function verifyRoomRealtimeToken(token) {
  if (typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  try {
    const expected = sign(encoded);
    const expectedBuffer = Buffer.from(expected);
    const receivedBuffer = Buffer.from(signature);
    if (expectedBuffer.length !== receivedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
      return null;
    }

    const payload = base64UrlDecode(encoded);
    if (!payload || typeof payload !== "object") return null;
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function getRoomSet(roomId) {
  const state = getState();
  const key = String(roomId);
  let roomSet = state.rooms.get(key);
  if (!roomSet) {
    roomSet = new Set();
    state.rooms.set(key, roomSet);
  }

  return roomSet;
}

function attachRoomSocket(roomId, socket) {
  const roomSet = getRoomSet(roomId);
  roomSet.add(socket);

  const detach = () => {
    roomSet.delete(socket);
    if (roomSet.size === 0) {
      getState().rooms.delete(String(roomId));
    }
  };

  socket.on("close", detach);
  socket.on("error", detach);
  return detach;
}

function broadcastRoomDiscussionUpdate(roomId, payload = {}) {
  const roomSet = getState().rooms.get(String(roomId));
  if (!roomSet || roomSet.size === 0) return;

  const message = JSON.stringify({
    type: "room.discussion.updated",
    roomId: String(roomId),
    ...payload,
    timestamp: Date.now(),
  });

  for (const socket of roomSet) {
    if (socket.readyState !== 1) {
      continue;
    }

    try {
      socket.send(message);
    } catch {
      roomSet.delete(socket);
    }
  }
}

function broadcastRoomStageEvent(roomId, payload = {}) {
  const roomSet = getState().rooms.get(String(roomId));
  if (!roomSet || roomSet.size === 0) return;

  const message = JSON.stringify({
    type: "room.stage.event",
    roomId: String(roomId),
    ...payload,
    timestamp: Date.now(),
  });

  for (const socket of roomSet) {
    if (socket.readyState !== 1) {
      continue;
    }

    try {
      socket.send(message);
    } catch {
      roomSet.delete(socket);
    }
  }
}

module.exports = {
  attachRoomSocket,
  broadcastRoomDiscussionUpdate,
  broadcastRoomStageEvent,
  createRoomRealtimeToken,
  verifyRoomRealtimeToken,
};
