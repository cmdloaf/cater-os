"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, Search, ChevronDown, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { LogoMark } from "@/components/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store";

const NOTIFICATIONS = [
  {
    title: "Quotation viewed",
    body: "TechNova opened the quotation you sent.",
    time: "2h ago",
  },
  {
    title: "Reservation fee received",
    body: "ABC Corp paid the ₱50,000 reservation fee.",
    time: "1d ago",
  },
  {
    title: "Event approaching",
    body: "Reyes–Gonzales Wedding is 9 days away.",
    time: "2d ago",
  },
];

export function Topbar() {
  const router = useRouter();
  const { events } = useStore();
  const [query, setQuery] = useState("");

  const results =
    query.trim().length > 0
      ? events
          .filter(
            (e) =>
              e.eventName.toLowerCase().includes(query.toLowerCase()) ||
              e.client.clientName.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 5)
      : [];

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur lg:gap-4 lg:px-8">
      {/* Logo on mobile (sidebar is hidden below lg) */}
      <Link
        href="/dashboard"
        aria-label="Vero home"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground lg:hidden"
      >
        <LogoMark className="h-[18px] w-[18px]" />
      </Link>

      <div className="relative min-w-0 flex-1 lg:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search events, clients, menus, packages…"
          className="rounded-lg bg-muted/40 pl-9 pr-12"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border bg-card px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground sm:block">
          ⌘ K
        </kbd>
        {results.length > 0 && (
          <div className="absolute left-0 right-0 top-11 z-30 overflow-hidden rounded-lg border bg-popover shadow-lg">
            {results.map((e) => (
              <button
                key={e.id}
                onMouseDown={() => {
                  setQuery("");
                  router.push(`/events/view?id=${e.id}`);
                }}
                className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-accent"
              >
                <span className="text-sm font-medium">{e.eventName}</span>
                <span className="text-xs text-muted-foreground">
                  {e.client.clientName}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button asChild className="hidden rounded-lg sm:inline-flex">
          <Link href="/events/new">
            <Plus className="h-4 w-4" />
            Create Event
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground ring-2 ring-card">
                {NOTIFICATIONS.length}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] sm:w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {NOTIFICATIONS.map((n) => (
              <DropdownMenuItem
                key={n.title}
                className="flex flex-col items-start gap-0.5 py-2"
              >
                <span className="text-sm font-medium">{n.title}</span>
                <span className="text-xs text-muted-foreground">{n.body}</span>
                <span className="text-[11px] text-muted-foreground/70">
                  {n.time}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-6" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-muted">
              <Avatar>
                <AvatarFallback className="bg-accent font-semibold text-primary">
                  GM
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left leading-tight md:block">
                <div className="text-sm font-medium">Gian Matthew</div>
                <div className="text-[11px] text-muted-foreground">
                  Operations
                </div>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">Profile & Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/import">Import Data</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
