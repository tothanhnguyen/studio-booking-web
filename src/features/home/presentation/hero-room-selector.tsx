import Link from "next/link";

import { heroCopy } from "./hero-copy";

export function HeroRoomSelector() {
  return (
    <div className="hero-state hero-state-rooms" data-hero-state="rooms">
      <div className="relative z-20 max-w-xl" data-hero-state-content>
        <p className="text-sm font-medium tracking-[0.08em] text-[#d9bf83]">03 / Chọn không gian</p>
        <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] text-stone-50 sm:text-6xl">
          Mỗi ý tưởng cần một không gian vừa vặn
        </h2>
        <p className="mt-4 max-w-lg text-lg leading-8 text-stone-400">
          Chọn một không gian để xem thiết bị, lịch trống và giá thuê.
        </p>
        <ul className="mt-7 divide-y divide-white/15 border-y border-white/15">
          {heroCopy.rooms.map((room, index) => (
            <li key={room.slug} data-hero-room-item>
              <Link
                aria-label={`${room.name} — ${room.description}`}
                className="group flex min-h-20 items-center gap-5 py-4 outline-none transition duration-300 hover:pl-2 focus-visible:pl-2 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d9bf83]"
                data-room-option={room.slug}
                href={room.href}
              >
                <span className="w-5 text-xs tabular-nums text-stone-600">0{index + 1}</span>
                <span className="min-w-0 flex-1">
                  <strong className="block text-xl font-semibold text-stone-100 transition group-hover:text-[#efd2a0] group-focus-visible:text-[#efd2a0]">
                    {room.name}
                  </strong>
                  <span className="mt-1 block text-sm text-stone-500 sm:text-base">{room.description}</span>
                </span>
                <span className="text-xl text-stone-500 transition group-hover:translate-x-1 group-hover:text-[#efd2a0]" aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link className="hero-primary-action mt-7" href="/studios">Xem lịch trống</Link>
      </div>
    </div>
  );
}
