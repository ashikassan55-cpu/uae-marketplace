"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { MessageCircle } from "lucide-react";
import { TopBar } from "@/components/top-bar";
import { useAuth } from "@/lib/auth/auth-context";
import { db, firebaseConfigured } from "@/lib/firebase/client";
import { timeAgo } from "@/lib/utils";
import type { Chat } from "@/lib/types";

export default function ChatsPage() {
  const { firebaseUser, loading, signInWithGoogle } = useAuth();
  const [chats, setChats] = useState<Chat[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!firebaseUser || !firebaseConfigured) {
        setChats([]);
        return;
      }
      const snap = await getDocs(
        query(
          collection(db, "chats"),
          where("participantUids", "array-contains", firebaseUser.uid),
          orderBy("lastMessageAt", "desc"),
        ),
      );
      if (!cancelled) {
        setChats(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Chat));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [firebaseUser]);

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar title="Chats" />
      {loading ? null : !firebaseUser ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <MessageCircle size={32} className="text-om-text-disabled" />
          <p className="text-sm text-om-text-secondary">
            Sign in to message sellers and shops.
          </p>
          <button
            onClick={signInWithGoogle}
            className="rounded-full bg-om-accent-primary px-5 py-2.5 text-sm font-medium text-om-text-inverse"
          >
            Sign in with Google
          </button>
        </div>
      ) : chats === null ? (
        <p className="px-4 py-8 text-center text-sm text-om-text-tertiary">Loading…</p>
      ) : chats.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
          <MessageCircle size={32} className="text-om-text-disabled" />
          <p className="text-sm font-medium">No conversations yet</p>
          <p className="text-sm text-om-text-tertiary">
            Chat opens once you message a seller from a listing you&rsquo;re viewing.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-om-border-subtle">
          {chats.map((chat) => (
            <li key={chat.id}>
              <Link href={`/chats/${chat.id}`} className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-om-bg-muted text-om-text-tertiary">
                  <MessageCircle size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{chat.lastMessage}</p>
                  <p className="text-xs text-om-text-tertiary">{timeAgo(chat.lastMessageAt)}</p>
                </div>
                {chat.unreadCount?.[firebaseUser.uid] ? (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-om-accent-primary px-1.5 text-[11px] font-medium text-om-text-inverse">
                    {chat.unreadCount[firebaseUser.uid]}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
