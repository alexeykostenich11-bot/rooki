"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Me = { name?: string; role?: string };

export function AuthLink({ className, onClick }: { className?: string; onClick?: () => void }) {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => alive && setMe(d))
      .catch(() => alive && setMe({}));
    return () => {
      alive = false;
    };
  }, []);

  const loggedIn = Boolean(me?.name);
  return (
    <Link
      href={loggedIn ? (me?.role === "admin" ? "/admin" : "/cabinet") : "/login"}
      onClick={onClick}
      className={className}
    >
      {me === null ? "Войти" : loggedIn ? "Кабинет" : "Войти"}
    </Link>
  );
}
