export const heroCopy = {
  eyebrow: "Creative studio / Sài Gòn",
  headline: "Nơi ý tưởng bước ra khỏi bản nháp.",
  subcopy: "Không gian studio chuyên nghiệp — chỉ cần chọn loại hình & thời gian, mọi thứ còn lại đã sẵn sàng.",
  primaryCta: {
    label: "Đặt lịch",
    href: "/studios",
  },
  secondaryCta: {
    label: "Xem không gian",
    href: "/studios",
  },
  scrollHint: "Scroll để khám phá",
  highlights: ["Photo", "Podcast", "Music"],
  proof: ["3 không gian", "lịch realtime", "VietQR deposit"],
  rooms: [
    {
      description: "Chụp sản phẩm, lookbook, portrait",
      href: "/studios/photo-studio",
      name: "Photo",
      slug: "photo",
    },
    {
      description: "Thu âm, quay talkshow, phỏng vấn",
      href: "/studios/voice-podcast-booth",
      name: "Podcast",
      slug: "podcast",
    },
    {
      description: "Sản xuất, thu vocal, rehearsal",
      href: "/studios/music-studio",
      name: "Music",
      slug: "music",
    },
  ],
} as const;
