import Link from "next/link";

import { heroCopy } from "./hero-copy";

export function HeroRoomSelector() {
  return (
    <div className="hero-state hero-state-rooms" data-hero-state="rooms">
      <div className="relative z-20 max-w-xl" data-hero-state-content>
        <p className="hero-eyebrow text-sm font-medium tracking-[0.08em]">03 / Chọn không gian</p>
        <h2 className="hero-heading mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-6xl">
          Mỗi ý tưởng cần một không gian vừa vặn
        </h2>
        <p className="hero-body-copy mt-4 max-w-lg text-lg leading-8">
          Chọn một không gian để xem thiết bị, lịch trống và giá thuê.
        </p>
        <ul className="hero-room-list mt-7 divide-y border-y">
          {heroCopy.rooms.map((room, index) => (
            <li key={room.slug} data-hero-room-item>
              <Link
                aria-label={`${room.name} — ${room.description}`}
                className="hero-room-option group flex min-h-20 items-center gap-5 py-4 outline-none transition duration-300 hover:pl-2 focus-visible:pl-2 focus-visible:ring-2 focus-visible:ring-inset"
                data-room-option={room.slug}
                href={room.href}
              >
                <span className="hero-room-number w-5 text-xs tabular-nums">0{index + 1}</span>
                <span className="min-w-0 flex-1">
                  <strong className="hero-room-name block text-xl font-semibold transition">
                    {room.name}
                  </strong>
                  <span className="hero-room-description mt-1 block text-sm sm:text-base">{room.description}</span>
                </span>
                <span className="hero-room-arrow text-xl transition group-hover:translate-x-1" aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link className="hero-primary-action mt-7" href="/studios">Xem lịch trống</Link>
      </div>
    </div>
  );
}
