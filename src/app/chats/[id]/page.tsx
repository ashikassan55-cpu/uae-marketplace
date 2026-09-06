"use client";

import { use, useEffect, useRef, useState, type FormEvent } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { Info, Send } from "lucide-react";
import { TopBar } from "@/components/top-bar";
import { useAuth } from "@/lib/auth/auth-context";
import { db, firebaseConfigured } from "@/lib/firebase/client";
import type { Chat, ChatMessage } from "@/lib/types";

export default function ChatThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: chatId } = use(params);
  const { firebaseUser } = useAuth();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!firebaseConfigured) return;
    const unsubChat = onSnapshot(doc(db, "chats", chatId), (snap) => {
      if (snap.exists()) setChat({ id: snap.id, ...snap.data() } as Chat);
    });
    const unsubMessages = onSnapshot(
      query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc")),
      (snap) => {
        setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ChatMessage));
      },
    );
    return () => {
      unsubChat();
      unsubMessages();
    };
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !firebaseUser || !firebaseConfigured) return;
    const body = text.trim();
    setText("");
    await addDoc(collection(db, "chats", chatId, "messages"), {
      senderUid: firebaseUser.uid,
      type: "text",
      text: body,
      createdAt: serverTimestamp(),
    });
    await setDoc(
      doc(db, "chats", chatId),
      { lastMessage: body, lastMessageAt: serverTimestamp() },
      { merge: true },
    );
    const otherUid = chat?.participantUids.find((u) => u !== firebaseUser.uid);
    if (otherUid) {
      await updateDoc(doc(db, "chats", chatId), {
        [`unreadCount.${otherUid}`]: increment(1),
      }).catch(() => {});
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar title="Chat" back="/chats" />

      {chat?.shopOutreach ? (
        <div className="flex items-start gap-2 border-b border-om-border-subtle bg-om-accent-primary-bg px-4 py-2.5 text-xs text-om-text-secondary">
          <Info size={14} className="mt-0.5 shrink-0" />
          This shop reached out because you saved one of their listings. They never see
          your email or phone number. You can mute or decline any time.
        </div>
      ) : null}

      <div className="om-scrollbar flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((m) => {
          const mine = m.senderUid === firebaseUser?.uid;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                  mine
                    ? "bg-om-accent-primary text-om-text-inverse"
                    : "bg-om-bg-muted text-om-text-primary"
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
        {!firebaseConfigured ? (
          <p className="pt-4 text-center text-xs text-om-text-tertiary">
            Connect Firebase to send and receive real messages — see README.md.
          </p>
        ) : null}
      </div>

      <form
        onSubmit={send}
        className="flex items-center gap-2 border-t border-om-border-default p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message…"
          className="flex-1 rounded-full border border-om-border-default bg-om-bg-surface px-4 py-2.5 text-sm outline-none"
        />
        <button
          type="submit"
          aria-label="Send"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-om-accent-primary text-om-text-inverse"
        >
          <Send size={17} />
        </button>
      </form>
    </div>
  );
}
