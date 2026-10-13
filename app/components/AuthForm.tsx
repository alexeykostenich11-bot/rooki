"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { login, signup, type FormState } from "../auth-actions";
import { Field, btnCls, cardCls, inputCls } from "./ui";

const initial: FormState = {};

export function SignupForm({ initialRole }: { initialRole: "master" | "customer" }) {
  const [state, action, pending] = useActionState(signup, initial);
  const [role, setRole] = useState(initialRole);

  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-full border border-neutral-200 bg-neutral-50 p-1">
        {(
          [
            ["customer", "Я заказчик"],
            ["master", "Я мастер"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setRole(value)}
            aria-pressed={role === value}
            className={`h-11 rounded-full text-sm font-medium transition-all ${
              role === value ? "bg-neutral-950 text-white shadow-md" : "text-neutral-600 hover:text-neutral-950"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form action={action} className={cardCls}>
        <input type="hidden" name="role" value={role} />
        <div className="space-y-4">
          <Field label="Имя">
            <input name="name" required minLength={2} maxLength={60} autoComplete="name"
              placeholder={role === "master" ? "Как к вам обращаться заказчикам" : "Как к вам обращаться"}
              className={inputCls} />
          </Field>
          <Field label="Почта">
            <input name="email" type="email" required autoComplete="email" placeholder="you@mail.ru" className={inputCls} />
          </Field>
          <Field label="Пароль" hint="Не короче 8 символов">
            <input name="password" type="password" required minLength={8} maxLength={100}
              autoComplete="new-password" className={inputCls} />
          </Field>

          {/* Ловушка для ботов */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
            className="absolute -left-[9999px] h-0 w-0 opacity-0" />

          <label className="flex items-start gap-3 text-sm text-neutral-600">
            <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 accent-neutral-950" />
            <span>
              Я согласен на обработку персональных данных и принимаю{" "}
              <Link href="/privacy" className="underline">политику конфиденциальности</Link> и{" "}
              <Link href="/terms" className="underline">правила сайта</Link>.
            </span>
          </label>
        </div>

        {state.error && <p className="mt-4 text-sm text-red-600" role="alert">{state.error}</p>}

        <button type="submit" disabled={pending} className={`${btnCls} mt-6 w-full`}>
          {pending ? "Создаём аккаунт…" : role === "master" ? "Создать кабинет мастера" : "Зарегистрироваться"}
        </button>
        <p className="mt-4 text-center text-sm text-neutral-500">
          Уже есть аккаунт? <Link href="/login" className="font-medium text-neutral-950 underline">Войти</Link>
        </p>
      </form>
    </>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, initial);
  return (
    <form action={action} className={cardCls}>
      <input type="hidden" name="next" value={next ?? ""} />
      <div className="space-y-4">
        <Field label="Почта">
          <input name="email" type="email" required autoComplete="email" className={inputCls} />
        </Field>
        <Field label="Пароль">
          <input name="password" type="password" required autoComplete="current-password" className={inputCls} />
        </Field>
      </div>
      {state.error && <p className="mt-4 text-sm text-red-600" role="alert">{state.error}</p>}
      <button type="submit" disabled={pending} className={`${btnCls} mt-6 w-full`}>
        {pending ? "Входим…" : "Войти"}
      </button>
      <p className="mt-4 text-center text-sm text-neutral-500">
        Нет аккаунта? <Link href="/signup" className="font-medium text-neutral-950 underline">Зарегистрироваться</Link>
      </p>
      <p className="mt-2 text-center text-xs text-neutral-400">
        Забыли пароль? Напишите нам в Telegram, мы поможем восстановить доступ.
      </p>
    </form>
  );
}
