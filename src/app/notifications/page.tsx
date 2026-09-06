import { ScreenPlaceholder } from "@/components/screen-placeholder";

export default function NotificationsPage() {
  return (
    <ScreenPlaceholder
      title="Notifications"
      back="/profile"
      blurb="Verification updates, offers from shops, review requests, new messages, and appeal decisions will all land here."
      notes={[
        "A notifications/{uid}/items subcollection, written by backend functions on each event",
        "Read/unread state + the bell badge count on Home and Profile",
      ]}
    />
  );
}
