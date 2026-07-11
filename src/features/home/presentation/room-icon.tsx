type RoomIconProps = Readonly<{
  room: "Photo" | "Podcast" | "Music";
}>;

export function RoomIcon({ room }: RoomIconProps) {
  if (room === "Photo") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path d="M4 7.5h3l1.4-2h7.2l1.4 2h3v11H4z" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="13" r="3.4" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }

  if (room === "Podcast") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <rect height="11" rx="4" stroke="currentColor" strokeWidth="1.6" width="6.5" x="8.75" y="3" />
        <path d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v4M9 21h6" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M9 18V6l10-2v12" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" />
      <ellipse cx="6.5" cy="18.5" rx="2.5" ry="2" stroke="currentColor" strokeWidth="1.6" />
      <ellipse cx="16.5" cy="16.5" rx="2.5" ry="2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
