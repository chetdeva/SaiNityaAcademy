import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import { ACADEMY_NAME } from "@/lib/constants";

export function AppHeader(props: {
  name: string;
  role: "student" | "teacher";
}) {
  const home = props.role === "teacher" ? "/teacher" : "/student";
  const schedule = `${home}/schedule`;

  return (
    <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href={home} className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-teal-600 text-sm font-black text-white">
            SN
          </span>
          <span>
            <span className="block text-sm font-bold leading-tight">{ACADEMY_NAME}</span>
            <span className="text-xs text-muted-foreground capitalize">{props.role} home</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link className="rounded-lg px-3 py-1.5 hover:bg-muted" href={home}>
            Dashboard
          </Link>
          <Link className="rounded-lg px-3 py-1.5 hover:bg-muted" href={schedule}>
            Schedule
          </Link>
          <span className="hidden text-sm text-muted-foreground sm:inline">{props.name}</span>
          <SignOutButton />
        </nav>
      </div>
    </header>
  );
}
