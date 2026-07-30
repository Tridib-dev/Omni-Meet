"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ParticipantView,
  StreamCall,
  StreamTheme,
  hasScreenShare,
  hasVideo,
  isPinned,
  useCallStateHooks,
  type Call,
  type StreamVideoParticipant,
} from "@stream-io/video-react-sdk";
import {
  HelpCircle,
  Mic,
  MicOff,
  MessageSquare,
  MonitorUp,
  PhoneOff,
  Pin,
  Shield,
  Users,
  Video,
  VideoOff,
} from "lucide-react";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

export interface LiveRoomScreenProps {
  call: Call;
  onLeave: () => void;
  eventId: string;
  showDeviceControls?: boolean;
  canModerate?: boolean;
  eventTitle?: string;
}

type DrawerKind = "chat" | "qa" | null;

type MessageItem = {
  id: string;
  author: string;
  role: string;
  body: string;
  createdAt: number;
};

type QuestionItem = {
  id: string;
  author: string;
  role: string;
  body: string;
  createdAt: number;
  answered: boolean;
  answerBody?: string;
  answeredAt?: number;
  answeredByClerkId?: string;
};

type DiscussionMessageApiItem = {
  id?: string;
  authorName?: string;
  authorRole?: string;
  body?: string;
  createdAt?: string;
};

type DiscussionQuestionApiItem = {
  id?: string;
  authorName?: string;
  authorRole?: string;
  body?: string;
  createdAt?: string;
  answered?: boolean;
  answerBody?: string;
  answeredAt?: string;
  answeredByClerkId?: string;
};

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function InitialsAvatar({ name }: { name?: string }) {
  const initial = (name?.trim()?.[0] ?? "?").toUpperCase();
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#1B1F27]">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#262B35] text-xl font-semibold text-[#8891A3]">
        {initial}
      </div>
    </div>
  );
}

function formatTime(value: number) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function participantLabel(participant: StreamVideoParticipant) {
  return participant.name?.trim() || participant.userId || "Unknown";
}

function participantRoleLabel(participant: StreamVideoParticipant) {
  if (participant.roles?.includes("admin")) return "organizer";
  if (participant.roles?.includes("host")) return "host";
  if (participant.roles?.includes("speaker")) return "speaker";
  return "attendee";
}

function participantRoleBadge(role: string) {
  if (role === "organizer" || role === "co-organizer") return "host";
  return role;
}

function ParticipantCard({
  participant,
  canModerate,
  onTogglePin,
}: {
  participant: StreamVideoParticipant;
  canModerate: boolean;
  onTogglePin: (participant: StreamVideoParticipant) => void;
}) {
  const pinned = isPinned(participant);
  const label = participantLabel(participant);
  const role = participantRoleLabel(participant);

  return (
    <button
      type="button"
      onClick={() => canModerate && onTogglePin(participant)}
      className={`group relative overflow-hidden rounded-2xl border text-left transition-colors ${
        pinned
          ? "border-[#4FD1FF]/70 bg-[#14171D]"
          : "border-[#262B35] bg-[#14171D]/90 hover:border-[#4FD1FF]/50"
      } ${canModerate ? "cursor-pointer" : "cursor-default"}`}
    >
      <div className="relative h-24">
        <ParticipantView
          participant={participant}
          muteAudio
          VideoPlaceholder={() => <InitialsAvatar name={label} />}
          ParticipantViewUI={null}
          className="h-full w-full"
        />
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[#F3F5F8]">{label}</p>
          <p className="text-[11px] uppercase tracking-wide text-[#8891A3]">{role}</p>
        </div>
        <div className="flex items-center gap-1.5 text-[#8891A3]">
          {pinned && <Pin size={13} className="text-[#4FD1FF]" />}
          {participant.isLocalParticipant && (
            <span className="rounded-full bg-[#1B1F27] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#4FD1FF]">
              you
            </span>
          )}
        </div>
      </div>
      {canModerate && !participant.isLocalParticipant && (
        <span className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/85 opacity-0 transition-opacity group-hover:opacity-100">
          {pinned ? "Unpin" : "Pin"}
        </span>
      )}
    </button>
  );
}

function ParticipantRail({
  canModerate,
  onTogglePin,
  eventTitle,
}: {
  canModerate: boolean;
  onTogglePin: (participant: StreamVideoParticipant) => void;
  eventTitle?: string;
}) {
  const { useParticipants, usePinnedParticipants, useLocalParticipant, useHasOngoingScreenShare } =
    useCallStateHooks();
  const participants = useParticipants();
  const pinnedParticipants = usePinnedParticipants();
  const localParticipant = useLocalParticipant();
  const hasOngoingScreenShare = useHasOngoingScreenShare();

  const orderedParticipants = useMemo(() => {
    return [...participants].sort((a, b) => {
      const aPinned = isPinned(a) ? 1 : 0;
      const bPinned = isPinned(b) ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;
      if (a.isLocalParticipant !== b.isLocalParticipant) return a.isLocalParticipant ? -1 : 1;
      return participantLabel(a).localeCompare(participantLabel(b));
    });
  }, [participants]);

  const showingEmptyState = orderedParticipants.length === 0;

  return (
    <aside className="flex h-full flex-col gap-3 rounded-3xl border border-[#262B35] bg-[#11161D] p-3">
      <div className="flex items-center justify-between gap-2 rounded-2xl border border-[#262B35] bg-[#14171D] px-3 py-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#F3F5F8]">{eventTitle ?? "Live room"}</p>
          <p className="text-[11px] uppercase tracking-wide text-[#8891A3]">
            {participants.length} in room
          </p>
        </div>
        <Users size={16} className="text-[#4FD1FF]" />
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-[#262B35] bg-[#14171D] px-3 py-2 text-[11px] uppercase tracking-wide text-[#8891A3]">
        <span>participant rail</span>
        <span>{hasOngoingScreenShare ? "screen share live" : "video room"}</span>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {showingEmptyState && (
          <div className="rounded-2xl border border-dashed border-[#262B35] bg-[#0A0C10] px-4 py-8 text-center text-sm text-[#8891A3]">
            Waiting for participants to join.
          </div>
        )}

        {orderedParticipants.map((participant) => (
          <ParticipantCard
            key={participant.sessionId}
            participant={participant}
            canModerate={canModerate}
            onTogglePin={onTogglePin}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-[#262B35] bg-[#14171D] px-3 py-2 text-xs text-[#8891A3]">
        {canModerate && localParticipant ? (
          <>
            <span className="font-medium text-[#F3F5F8]">Host tools active.</span> Pinning and screen share are
            available to organizers.
          </>
        ) : (
          <>
            <span className="font-medium text-[#F3F5F8]">Attendee mode.</span> You can watch, chat, ask questions, and
            leave.
          </>
        )}
      </div>

      {pinnedParticipants.length > 0 && (
        <div className="rounded-2xl border border-[#262B35] bg-[#14171D] px-3 py-2 text-xs text-[#8891A3]">
          Pinned: {pinnedParticipants.map((p) => participantLabel(p)).join(", ")}
        </div>
      )}
    </aside>
  );
}

function DrawerShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <DrawerHeader className="border-b border-[#262B35] bg-[#11161D]">
        <DrawerTitle className="text-[#F3F5F8]">{title}</DrawerTitle>
        <DrawerDescription className="text-[#8891A3]">{description}</DrawerDescription>
      </DrawerHeader>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
    </>
  );
}

function ChatDrawer({
  open,
  onOpenChange,
  messages,
  draft,
  onDraftChange,
  onSend,
  sending,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: MessageItem[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  sending: boolean;
  loading: boolean;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="flex h-full w-full flex-col border-l border-[#262B35] bg-[#0F1318] text-[#F3F5F8] sm:max-w-md">
        <DrawerShell title="Chat" description="Room chat for quick coordination and audience talk.">
          <div className="space-y-3">
            {loading ? (
              <div className="rounded-2xl border border-dashed border-[#262B35] bg-[#14171D] px-4 py-8 text-center text-sm text-[#8891A3]">
                Loading chat history...
              </div>
            ) : messages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#262B35] bg-[#14171D] px-4 py-8 text-center text-sm text-[#8891A3]">
                No chat messages yet.
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="rounded-2xl border border-[#262B35] bg-[#14171D] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#F3F5F8]">{message.author}</p>
                      <p className="text-[10px] uppercase tracking-wide text-[#8891A3]">{participantRoleBadge(message.role)}</p>
                    </div>
                    <span className="text-[11px] text-[#8891A3]">{formatTime(message.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-[#D7DCE4]">{message.body}</p>
                </div>
              ))
            )}
          </div>
        </DrawerShell>
        <DrawerFooter className="border-t border-[#262B35] bg-[#11161D]">
          <div className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              placeholder="Write a message..."
              className="w-full rounded-xl border border-[#262B35] bg-[#0A0C10] px-3 py-2 text-sm text-[#F3F5F8] outline-none placeholder:text-[#8891A3] focus:border-[#4FD1FF]"
            />
            <button
              type="button"
              onClick={onSend}
              disabled={sending}
              className="rounded-xl bg-[#4FD1FF] px-4 py-2 text-sm font-semibold text-[#0A0C10]"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function QADrawer({
  open,
  onOpenChange,
  questions,
  draft,
  onDraftChange,
  onAsk,
  onAnswer,
  answerDrafts,
  onAnswerDraftChange,
  canModerate,
  sendingQuestion,
  sendingAnswerId,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: QuestionItem[];
  draft: string;
  onDraftChange: (value: string) => void;
  onAsk: () => void;
  onAnswer: (questionId: string) => void;
  answerDrafts: Record<string, string>;
  onAnswerDraftChange: (questionId: string, value: string) => void;
  canModerate: boolean;
  sendingQuestion: boolean;
  sendingAnswerId: string | null;
  loading: boolean;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="flex h-full w-full flex-col border-l border-[#262B35] bg-[#0F1318] text-[#F3F5F8] sm:max-w-md">
        <DrawerShell title="Q&A" description="Questions and answers for the session.">
          <div className="space-y-3">
            {loading ? (
              <div className="rounded-2xl border border-dashed border-[#262B35] bg-[#14171D] px-4 py-8 text-center text-sm text-[#8891A3]">
                Loading Q&A history...
              </div>
            ) : questions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#262B35] bg-[#14171D] px-4 py-8 text-center text-sm text-[#8891A3]">
                No questions yet.
              </div>
            ) : (
              questions.map((question) => (
                <div key={question.id} className="rounded-2xl border border-[#262B35] bg-[#14171D] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#F3F5F8]">{question.author}</p>
                      <p className="text-[10px] uppercase tracking-wide text-[#8891A3]">{participantRoleBadge(question.role)}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                      question.answered ? "bg-[#33D6A0]/15 text-[#33D6A0]" : "bg-[#F5A623]/15 text-[#F5A623]"
                    }`}>
                      {question.answered ? "answered" : "open"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#D7DCE4]">{question.body}</p>
                  {question.answered && question.answerBody && (
                    <div className="mt-3 rounded-xl border border-[#33D6A0]/20 bg-[#33D6A0]/8 p-3">
                      <p className="text-[10px] uppercase tracking-wide text-[#33D6A0]">Answer</p>
                      <p className="mt-1 text-sm text-[#EAFBF4]">{question.answerBody}</p>
                    </div>
                  )}
                  {canModerate && !question.answered && (
                    <div className="mt-3 flex flex-col gap-2">
                      <textarea
                        rows={2}
                        value={answerDrafts[question.id] ?? ""}
                        onChange={(e) => onAnswerDraftChange(question.id, e.target.value)}
                        placeholder="Write an answer..."
                        className="w-full rounded-xl border border-[#262B35] bg-[#0A0C10] px-3 py-2 text-sm text-[#F3F5F8] outline-none placeholder:text-[#8891A3] focus:border-[#4FD1FF]"
                      />
                      <button
                        type="button"
                        onClick={() => onAnswer(question.id)}
                        disabled={sendingAnswerId === question.id}
                        className="self-end rounded-xl bg-[#33D6A0] px-3 py-2 text-xs font-semibold text-[#0A0C10]"
                      >
                        {sendingAnswerId === question.id ? "Posting..." : "Mark answered"}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </DrawerShell>
        <DrawerFooter className="border-t border-[#262B35] bg-[#11161D]">
          <div className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              placeholder="Ask a question..."
              className="w-full rounded-xl border border-[#262B35] bg-[#0A0C10] px-3 py-2 text-sm text-[#F3F5F8] outline-none placeholder:text-[#8891A3] focus:border-[#4FD1FF]"
            />
            <button
              type="button"
              onClick={onAsk}
              disabled={sendingQuestion}
              className="rounded-xl bg-[#4FD1FF] px-4 py-2 text-sm font-semibold text-[#0A0C10]"
            >
              {sendingQuestion ? "Asking..." : "Ask"}
            </button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function ControlsBar({
  onLeave,
  onToggleScreenShare,
  showDeviceControls = true,
  canModerate = false,
  screenShareActive = false,
}: {
  onLeave: () => void;
  onToggleScreenShare: () => void;
  showDeviceControls?: boolean;
  canModerate?: boolean;
  screenShareActive?: boolean;
}) {
  const { useCameraState, useMicrophoneState } = useCallStateHooks();
  const { camera, isMute: camMuted, hasBrowserPermission: hasCamPermission } = useCameraState();
  const { microphone, isMute: micMuted, hasBrowserPermission: hasMicPermission } = useMicrophoneState();
  const [deviceError, setDeviceError] = useState<string | null>(null);

  async function toggleCamera() {
    setDeviceError(null);
    try {
      await camera.toggle();
    } catch {
      setDeviceError("Camera permission denied or unavailable. Check site permissions.");
    }
  }

  async function toggleMicrophone() {
    setDeviceError(null);
    try {
      await microphone.toggle();
    } catch {
      setDeviceError("Microphone permission denied or unavailable. Check site permissions.");
    }
  }

  return (
    <div className="flex flex-col gap-2 border-t border-[#262B35] bg-[#0A0C10] px-3 py-3">
      {deviceError && <p className="text-xs text-[#FF5468]">{deviceError}</p>}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {showDeviceControls && (
          <>
            <button
              onClick={toggleMicrophone}
              className={`flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium ${
                micMuted || !hasMicPermission ? "bg-[#262B35] text-[#8891A3]" : "bg-[#1B1F27] text-[#F3F5F8]"
              }`}
              aria-label={micMuted ? "Unmute microphone" : "Mute microphone"}
            >
              {micMuted || !hasMicPermission ? <MicOff size={17} /> : <Mic size={17} />}
              <span className="hidden sm:inline">Mic</span>
            </button>
            <button
              onClick={toggleCamera}
              className={`flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium ${
                camMuted || !hasCamPermission ? "bg-[#262B35] text-[#8891A3]" : "bg-[#1B1F27] text-[#F3F5F8]"
              }`}
              aria-label={camMuted ? "Turn on camera" : "Turn off camera"}
            >
              {camMuted || !hasCamPermission ? <VideoOff size={17} /> : <Video size={17} />}
              <span className="hidden sm:inline">Camera</span>
            </button>
          </>
        )}

        {canModerate && (
          <button
            onClick={onToggleScreenShare}
            className={`flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium ${
              screenShareActive ? "bg-[#33D6A0] text-[#0A0C10]" : "bg-[#1B1F27] text-[#F3F5F8]"
            }`}
            aria-label={screenShareActive ? "Stop screen share" : "Start screen share"}
          >
            <MonitorUp size={17} />
            <span className="hidden sm:inline">{screenShareActive ? "Stop share" : "Share screen"}</span>
          </button>
        )}

        <button
          onClick={onLeave}
          className="flex h-11 items-center gap-2 rounded-full bg-[#FF5468] px-4 text-sm font-semibold text-[#0A0C10]"
          aria-label="Leave meeting"
        >
          <PhoneOff size={17} />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>
    </div>
  );
}

function StagePanel({
  call,
  canModerate,
}: {
  call: Call;
  canModerate: boolean;
}) {
  const { useParticipants, usePinnedParticipants, useLocalParticipant, useHasOngoingScreenShare } =
    useCallStateHooks();
  const participants = useParticipants();
  const pinnedParticipants = usePinnedParticipants();
  const localParticipant = useLocalParticipant();
  const hasOngoingScreenShare = useHasOngoingScreenShare();

  const focusParticipant = useMemo(() => {
    const screenShareParticipant = participants.find((participant) => hasScreenShare(participant));
    if (screenShareParticipant) return screenShareParticipant;
    if (pinnedParticipants.length > 0) return pinnedParticipants[0];

    const visibleParticipant = participants.find((participant) => !participant.isLocalParticipant && hasVideo(participant));
    if (visibleParticipant) return visibleParticipant;

    return localParticipant ?? participants[0] ?? null;
  }, [participants, pinnedParticipants, localParticipant]);

  const autoPinnedRef = useRef(false);

  useEffect(() => {
    if (!canModerate || !localParticipant) return;
    if (autoPinnedRef.current) return;
    if (pinnedParticipants.length > 0) {
      autoPinnedRef.current = true;
      return;
    }

    autoPinnedRef.current = true;
    try {
      call.pin(localParticipant.sessionId);
    } catch (err) {
      console.error("[LiveRoomScreen] auto pin failed", err);
      autoPinnedRef.current = false;
    }
  }, [canModerate, localParticipant, pinnedParticipants.length, call]);

  if (!focusParticipant) {
    return (
      <div className="flex h-full min-h-[520px] items-center justify-center rounded-3xl border border-[#262B35] bg-[#11161D] px-6 text-center">
        <div className="space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1B1F27] text-[#4FD1FF]">
            <Users size={22} />
          </div>
          <p className="text-lg font-semibold text-[#F3F5F8]">Waiting for the room to populate</p>
          <p className="max-w-sm text-sm text-[#8891A3]">Once someone joins, the stage will appear here.</p>
        </div>
      </div>
    );
  }

  const label = participantLabel(focusParticipant);
  const role = participantRoleLabel(focusParticipant);

  return (
    <div className="relative h-full min-h-[520px] overflow-hidden rounded-3xl border border-[#262B35] bg-[#0A0C10]">
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs text-white backdrop-blur">
        <Shield size={14} className={hasOngoingScreenShare ? "text-[#33D6A0]" : "text-[#4FD1FF]"} />
        <span className="font-medium">{role}</span>
        <span className="text-white/70">•</span>
        <span>{label}</span>
      </div>

      <div className="absolute inset-0">
        <ParticipantView
          participant={focusParticipant}
          mirror={focusParticipant.isLocalParticipant}
          VideoPlaceholder={() => <InitialsAvatar name={label} />}
          ParticipantViewUI={null}
          className="absolute inset-0 h-full w-full overflow-hidden [&_video]:h-full [&_video]:w-full [&_video]:object-cover [&_video]:object-center [&_video]:bg-black"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4">
        <div className="flex items-end justify-between gap-3">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-white">{label}</p>
            <p className="text-sm text-white/70">
              {hasOngoingScreenShare ? "Screen share active" : "Pinned stage view"}
            </p>
          </div>
          <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
            {focusParticipant.isLocalParticipant ? "your view" : "stage"}
          </div>
        </div>
      </div>
    </div>
  );
}

type LiveRoomScreenContentProps = LiveRoomScreenProps & {
  activeDrawer: DrawerKind;
  setActiveDrawer: (value: DrawerKind) => void;
  chatDraft: string;
  setChatDraft: (value: string) => void;
  qaDraft: string;
  setQaDraft: (value: string) => void;
  chatMessages: MessageItem[];
  questions: QuestionItem[];
  drawerError: string | null;
  discussionLoading: boolean;
  sendingChat: boolean;
  sendingQuestion: boolean;
  sendingAnswerId: string | null;
  answerDrafts: Record<string, string>;
  updateAnswerDraft: (questionId: string, value: string) => void;
  sendChat: () => void;
  askQuestion: () => void;
  answerQuestion: (questionId: string) => void;
};

function LiveRoomScreenContent({
  call,
  onLeave,
  showDeviceControls = true,
  canModerate = false,
  eventTitle,
  activeDrawer,
  setActiveDrawer,
  chatDraft,
  setChatDraft,
  qaDraft,
  setQaDraft,
  chatMessages,
  questions,
  drawerError,
  discussionLoading,
  sendingChat,
  sendingQuestion,
  sendingAnswerId,
  answerDrafts,
  updateAnswerDraft,
  sendChat,
  askQuestion,
  answerQuestion,
}: LiveRoomScreenContentProps) {
  const { useScreenShareState, useParticipants, useHasOngoingScreenShare, useCameraState, useMicrophoneState } =
    useCallStateHooks();
  const { screenShare } = useScreenShareState();
  const { camera } = useCameraState();
  const { microphone } = useMicrophoneState();
  const participants = useParticipants();
  const hasOngoingScreenShare = useHasOngoingScreenShare();
  const autoStartDevicesRef = useRef(false);

  const screenShareActive = hasOngoingScreenShare;
  const participantCount = participants.length;

  useEffect(() => {
    if (!canModerate || autoStartDevicesRef.current) return;
    autoStartDevicesRef.current = true;

    camera.enable().catch((err: unknown) => {
      console.warn("[LiveRoomScreen] auto camera enable failed", err);
    });

    microphone.enable().catch((err: unknown) => {
      console.warn("[LiveRoomScreen] auto microphone enable failed", err);
    });
  }, [canModerate, camera, microphone]);

  function handleToggleScreenShare() {
    screenShare
      .toggle()
      .catch((err: unknown) => {
        console.error("[LiveRoomScreen] screen share toggle failed", err);
      });
  }

  function togglePin(participant: StreamVideoParticipant) {
    if (!canModerate) return;
    try {
      if (isPinned(participant)) {
        call.unpin(participant.sessionId);
      } else {
        call.pin(participant.sessionId);
      }
    } catch (err) {
      console.error("[LiveRoomScreen] pin toggle failed", err);
    }
  }

  return (
    <StreamTheme className="flex min-h-screen flex-col bg-[#0A0C10] text-[#F3F5F8]">
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between gap-3 border-b border-[#262B35] bg-[#0A0C10] px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#F3F5F8]">{eventTitle ?? "Live room"}</p>
            <p className="text-[11px] uppercase tracking-wide text-[#8891A3]">{participantCount} participants</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveDrawer("chat")}
              className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm ${
                activeDrawer === "chat" ? "bg-[#4FD1FF] text-[#0A0C10]" : "bg-[#1B1F27] text-[#F3F5F8]"
              }`}
            >
              <MessageSquare size={16} />
              Chat
            </button>
            <button
              type="button"
              onClick={() => setActiveDrawer("qa")}
              className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm ${
                activeDrawer === "qa" ? "bg-[#4FD1FF] text-[#0A0C10]" : "bg-[#1B1F27] text-[#F3F5F8]"
              }`}
            >
              <HelpCircle size={16} />
              Q&A
            </button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 gap-3 px-3 py-3 xl:grid-cols-[300px_minmax(0,1fr)]">
          <ParticipantRail eventTitle={eventTitle} canModerate={canModerate} onTogglePin={togglePin} />

          <div className="flex min-h-0 flex-col gap-3">
            {drawerError && (
              <div className="rounded-2xl border border-[#FF5468]/25 bg-[#FF5468]/10 px-4 py-3 text-sm text-[#FFB9C2]">
                {drawerError}
              </div>
            )}

            <StagePanel call={call} canModerate={canModerate} />

            <div className="xl:hidden">
              <div className="rounded-2xl border border-[#262B35] bg-[#11161D] px-3 py-2 text-sm text-[#8891A3]">
                Swipe horizontally in the participant rail above to browse people in the room.
              </div>
            </div>
          </div>
        </div>

        <ControlsBar
          onLeave={onLeave}
          onToggleScreenShare={handleToggleScreenShare}
          showDeviceControls={showDeviceControls}
          canModerate={canModerate}
          screenShareActive={screenShareActive}
        />
      </div>

      <ChatDrawer
        open={activeDrawer === "chat"}
        onOpenChange={(open) => setActiveDrawer(open ? "chat" : null)}
        messages={chatMessages}
        draft={chatDraft}
        onDraftChange={setChatDraft}
        onSend={sendChat}
        sending={sendingChat}
        loading={discussionLoading}
      />

      <QADrawer
        open={activeDrawer === "qa"}
        onOpenChange={(open) => setActiveDrawer(open ? "qa" : null)}
        questions={questions}
        draft={qaDraft}
        onDraftChange={setQaDraft}
        onAsk={askQuestion}
        onAnswer={answerQuestion}
        answerDrafts={answerDrafts}
        onAnswerDraftChange={updateAnswerDraft}
        canModerate={canModerate}
        sendingQuestion={sendingQuestion}
        sendingAnswerId={sendingAnswerId}
        loading={discussionLoading}
      />
    </StreamTheme>
  );
}

export default function LiveRoomScreen({ call, onLeave, eventId, showDeviceControls = true, canModerate = false, eventTitle }: LiveRoomScreenProps) {
  const [activeDrawer, setActiveDrawer] = useState<DrawerKind>(null);
  const [chatDraft, setChatDraft] = useState("");
  const [qaDraft, setQaDraft] = useState("");
  const [chatMessages, setChatMessages] = useState<MessageItem[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [drawerError, setDrawerError] = useState<string | null>(null);
  const [discussionLoading, setDiscussionLoading] = useState(true);
  const [sendingChat, setSendingChat] = useState(false);
  const [sendingQuestion, setSendingQuestion] = useState(false);
  const [sendingAnswerId, setSendingAnswerId] = useState<string | null>(null);
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const realtimeSocketRef = useRef<WebSocket | null>(null);
  const realtimeReconnectRef = useRef<number | null>(null);
  const realtimeRetryRef = useRef(0);

  const syncDiscussion = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch(`/api/rooms/${eventId}/discussion`, {
        method: "GET",
        cache: "no-store",
        signal,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message ?? "Failed to load discussion.");
      }

      const nextMessages: MessageItem[] = Array.isArray(data.messages)
        ? (data.messages as DiscussionMessageApiItem[]).map((item) => ({
            id: String(item.id),
            author: String(item.authorName ?? "Unknown"),
            role: String(item.authorRole ?? "attendee"),
            body: String(item.body ?? ""),
            createdAt: new Date(String(item.createdAt)).getTime(),
          }))
        : [];

      const nextQuestions: QuestionItem[] = Array.isArray(data.questions)
        ? (data.questions as DiscussionQuestionApiItem[]).map((item) => ({
            id: String(item.id),
            author: String(item.authorName ?? "Unknown"),
            role: String(item.authorRole ?? "attendee"),
            body: String(item.body ?? ""),
            createdAt: new Date(String(item.createdAt)).getTime(),
            answered: Boolean(item.answered),
            answerBody: typeof item.answerBody === "string" ? item.answerBody : undefined,
            answeredAt: item.answeredAt ? new Date(String(item.answeredAt)).getTime() : undefined,
            answeredByClerkId: typeof item.answeredByClerkId === "string" ? item.answeredByClerkId : undefined,
          }))
        : [];

      setChatMessages(nextMessages);
      setQuestions(nextQuestions);
      setDrawerError(null);
    } catch (err) {
      if (signal?.aborted) return;
      console.error("[LiveRoomScreen] failed to load discussion", err);
      setDrawerError("Chat and Q&A could not be loaded right now.");
    } finally {
      if (!signal?.aborted) setDiscussionLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    const controller = new AbortController();
    // The initial fetch kicks off the first discussion load.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    syncDiscussion(controller.signal);

    const intervalId = window.setInterval(() => {
      syncDiscussion();
    }, 5_000);

    return () => {
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, [syncDiscussion]);

  useEffect(() => {
    let active = true;

    function clearReconnectTimer() {
      if (realtimeReconnectRef.current !== null) {
        window.clearTimeout(realtimeReconnectRef.current);
        realtimeReconnectRef.current = null;
      }
    }

    function scheduleReconnect() {
      if (!active) return;
      clearReconnectTimer();
      const delay = Math.min(1000 * 2 ** realtimeRetryRef.current, 15_000);
      realtimeRetryRef.current = Math.min(realtimeRetryRef.current + 1, 4);
      realtimeReconnectRef.current = window.setTimeout(() => {
        void connect();
      }, delay);
    }

    async function connect() {
      if (!active) return;

      try {
        const response = await fetch(`/api/rooms/${eventId}/realtime/token`, { cache: "no-store" });
        const payload = (await response.json()) as { token?: string; message?: string };

        if (!response.ok || typeof payload?.token !== "string") {
          throw new Error(payload?.message ?? "Failed to fetch realtime token.");
        }

        if (!active) return;

        realtimeRetryRef.current = 0;
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const socketUrl = `${protocol}//${window.location.host}/api/rooms/${eventId}/realtime?token=${encodeURIComponent(
          payload.token
        )}`;

        const socket = new WebSocket(socketUrl);
        realtimeSocketRef.current = socket;

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(String(event.data));
            if (data?.type === "room.discussion.updated" && data?.roomId) {
              void syncDiscussion();
            }
          } catch {
            // Ignore malformed control frames.
          }
        };

        socket.onopen = () => {
          realtimeRetryRef.current = 0;
        };

        socket.onerror = () => {
          socket.close();
        };

        socket.onclose = () => {
          if (!active) return;
          scheduleReconnect();
        };
      } catch (error) {
        if (!active) return;
        console.warn("[LiveRoomScreen] realtime connect failed", error);
        scheduleReconnect();
      }
    }

    void connect();

    return () => {
      active = false;
      clearReconnectTimer();
      realtimeSocketRef.current?.close();
      realtimeSocketRef.current = null;
    };
  }, [eventId, syncDiscussion]);

  function sendChat() {
    const body = chatDraft.trim();
    if (!body) return;
    if (body.length > 500) {
      setDrawerError("Chat messages must be 500 characters or fewer.");
      return;
    }
    const clientMutationId = makeId();
    setSendingChat(true);
    setDrawerError(null);

    fetch(`/api/rooms/${eventId}/discussion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "message", body, clientMutationId }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data?.success) {
          throw new Error(data?.message ?? "Failed to send message.");
        }
        setChatDraft("");
        return syncDiscussion();
      })
      .catch((err) => {
        console.error("[LiveRoomScreen] send chat failed", err);
        setDrawerError("Could not send the message. Please try again.");
      })
      .finally(() => {
        setSendingChat(false);
      });
  }

  function askQuestion() {
    const body = qaDraft.trim();
    if (!body) return;
    if (body.length > 500) {
      setDrawerError("Questions must be 500 characters or fewer.");
      return;
    }
    const clientMutationId = makeId();
    setSendingQuestion(true);
    setDrawerError(null);

    fetch(`/api/rooms/${eventId}/discussion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "question", body, clientMutationId }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data?.success) {
          throw new Error(data?.message ?? "Failed to ask question.");
        }
        setQaDraft("");
        return syncDiscussion();
      })
      .catch((err) => {
        console.error("[LiveRoomScreen] ask question failed", err);
        setDrawerError("Could not post your question. Please try again.");
      })
      .finally(() => {
        setSendingQuestion(false);
      });
  }

  function answerQuestion(questionId: string) {
    const body = answerDrafts[questionId]?.trim();
    if (!body) return;
    if (body.length > 1000) {
      setDrawerError("Answers must be 1000 characters or fewer.");
      return;
    }

    const clientMutationId = makeId();
    setSendingAnswerId(questionId);
    setDrawerError(null);

    fetch(`/api/rooms/${eventId}/discussion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "answer", questionId, body, clientMutationId }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data?.success) {
          throw new Error(data?.message ?? "Failed to answer question.");
        }
        setAnswerDrafts((current) => ({ ...current, [questionId]: "" }));
        return syncDiscussion();
      })
      .catch((err) => {
        console.error("[LiveRoomScreen] answer question failed", err);
        setDrawerError("Could not save the answer. Please try again.");
      })
      .finally(() => {
        setSendingAnswerId(null);
      });
  }

  function updateAnswerDraft(questionId: string, value: string) {
    setAnswerDrafts((current) => ({ ...current, [questionId]: value }));
  }

  return (
    <StreamCall call={call}>
      <LiveRoomScreenContent
        call={call}
        onLeave={onLeave}
        showDeviceControls={showDeviceControls}
        canModerate={canModerate}
        eventTitle={eventTitle}
        activeDrawer={activeDrawer}
        setActiveDrawer={setActiveDrawer}
        chatDraft={chatDraft}
        setChatDraft={setChatDraft}
        qaDraft={qaDraft}
        setQaDraft={setQaDraft}
        chatMessages={chatMessages}
        questions={questions}
        drawerError={drawerError}
        discussionLoading={discussionLoading}
        sendingChat={sendingChat}
        sendingQuestion={sendingQuestion}
        sendingAnswerId={sendingAnswerId}
        answerDrafts={answerDrafts}
        updateAnswerDraft={updateAnswerDraft}
        sendChat={sendChat}
        askQuestion={askQuestion}
        answerQuestion={answerQuestion}
        eventId={eventId}
        />
    </StreamCall>
  );
}
