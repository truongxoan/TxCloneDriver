"use client";

import Link from "next/link";
import { DepthCard } from "@/components/ui/DepthCard";
import type { LucideIcon } from "lucide-react";

export type HubItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  image: string;
};

export type HubGroup = {
  title: string;
  description: string;
  image: string;
  items: HubItem[];
};

/**
 * HubGrid — lưới Hub dùng chung cho giai đoạn 2.
 * Mỗi Hub là một DepthCard có ảnh nền, tiêu đề, mô tả và danh sách
 * các chức năng thật bên trong. Bấm vào một chức năng là đi tới route
 * cũ của nó, không tạo route mới thay thế, không sửa logic module.
 */
export function HubGrid({ groups }: { groups: HubGroup[] }) {
  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.title} aria-label={group.title}>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-white sm:text-2xl">
                {group.title}
              </h2>
              <p className="mt-1 text-sm text-slate-300">{group.description}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="block">
                  <DepthCard tilt={6} className="h-full">
                    <div className="relative h-32 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt=""
                        aria-hidden="true"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-3 left-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="tx-depth-child p-4">
                      <h3 className="font-extrabold text-white">{item.label}</h3>
                      <p className="mt-1 text-sm text-slate-300">
                        {item.description}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-sky-300">
                        Mở ngay →
                      </span>
                    </div>
                  </DepthCard>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
