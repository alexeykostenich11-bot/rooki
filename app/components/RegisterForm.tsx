"use client";

import { FormEvent, useState } from "react";

type Role = "customer" | "master";

const input =
  "h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50/50 px-4 text-base text-neutral-950 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-950/5";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-neutral-700">
        {label}
      </span>
      {children}
    </label>
  );
}

export function RegisterForm() {
  const [role, setRole] = useState<Role>("customer");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("sending");

    const payload = {
      ...Object.fromEntries(new FormData(form).entries()),
      role,
    };

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setStatus("done");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const isMaster = role === "master";

  return (
    <section className="section-padding">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8">
        <div className="mx-auto max-w-xl">
          <header className="mb-8 text-center sm:mb-10">
            <p className="mb-3 text-xs font-medium tracking-wide text-neutral-400 uppercase sm:text-sm">
              Регистрация
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl md:text-4xl">
              {isMaster ? "Работайте с ROOKI" : "Расскажите о вашем ремонте"}
            </h1>
            <p className="mt-3 text-sm text-neutral-500 sm:mt-4 sm:text-base">
              {isMaster
                ? "Оставьте данные, и мы свяжемся по загрузке объектами."
                : "Оставьте данные, и мы свяжемся в течение 15 минут."}
            </p>
          </header>

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
                onClick={() => {
                  setRole(value);
                  setStatus("idle");
                }}
                aria-pressed={role === value}
                className={`h-11 rounded-full text-sm font-medium transition-all ${
                  role === value
                    ? "bg-neutral-950 text-white shadow-md"
                    : "text-neutral-600 hover:text-neutral-950"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form
            key={role}
            onSubmit={handleSubmit}
            className="rounded-[1.75rem] border border-neutral-200/80 bg-white p-5 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.06)] sm:rounded-[2rem] sm:p-6 md:p-8"
          >
            <div className="space-y-4">
              <Field label="Имя">
                <input
                  type="text"
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="Как к вам обращаться"
                  className={input}
                />
              </Field>

              <Field label="Телефон">
                <input
                  type="tel"
                  name="phone"
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+7 (___) ___-__-__"
                  className={input}
                />
              </Field>

              {isMaster ? (
                <>
                  <Field label="Специальность">
                    <select
                      name="specialty"
                      required
                      defaultValue=""
                      className={input}
                    >
                      <option value="" disabled>
                        Выберите
                      </option>
                      <option>Универсал</option>
                      <option>Электрик</option>
                      <option>Сантехник</option>
                      <option>Плиточник</option>
                      <option>Штукатур-маляр</option>
                      <option>Отделочник</option>
                      <option>Мастер по полу</option>
                      <option>Потолки</option>
                      <option>Монтаж гипсокартона</option>
                      <option>Другое</option>
                    </select>
                  </Field>
                  <Field label="Опыт">
                    <select
                      name="experience"
                      defaultValue=""
                      className={input}
                    >
                      <option value="" disabled>
                        Выберите
                      </option>
                      <option>До 1 года</option>
                      <option>1–3 года</option>
                      <option>3–5 лет</option>
                      <option>Больше 5 лет</option>
                    </select>
                  </Field>
                  <Field label="Работаете">
                    <select name="team" defaultValue="" className={input}>
                      <option value="" disabled>
                        Выберите
                      </option>
                      <option>Один</option>
                      <option>Бригадой</option>
                    </select>
                  </Field>
                  <Field label="Город / район">
                    <input
                      type="text"
                      name="city"
                      placeholder="Например, Москва, Котельники"
                      className={input}
                    />
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Тип объекта">
                    <select
                      name="objectType"
                      defaultValue=""
                      className={input}
                    >
                      <option value="" disabled>
                        Выберите
                      </option>
                      <option>Новостройка</option>
                      <option>Вторичка</option>
                      <option>Дом / коттедж</option>
                      <option>Коммерческое помещение</option>
                    </select>
                  </Field>
                  <Field label="Площадь">
                    <input
                      type="text"
                      name="area"
                      inputMode="numeric"
                      placeholder="Например, 65 м²"
                      className={input}
                    />
                  </Field>
                  <Field label="Район / метро">
                    <input
                      type="text"
                      name="city"
                      placeholder="Где находится объект"
                      className={input}
                    />
                  </Field>
                  <Field label="Когда планируете начать">
                    <select name="startDate" defaultValue="" className={input}>
                      <option value="" disabled>
                        Выберите
                      </option>
                      <option>Как можно скорее</option>
                      <option>В течение месяца</option>
                      <option>Через 1–3 месяца</option>
                      <option>Пока присматриваюсь</option>
                    </select>
                  </Field>
                </>
              )}

              <Field label={isMaster ? "О себе" : "Комментарий"}>
                <textarea
                  name="comment"
                  rows={4}
                  placeholder={
                    isMaster
                      ? "Какие работы делаете, есть ли инструмент и портфолио"
                      : "Расскажите о задаче или пожеланиях"
                  }
                  className="w-full resize-none rounded-2xl border border-neutral-200 bg-neutral-50/50 px-4 py-3 text-base text-neutral-950 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-950/5"
                />
              </Field>

              {/* Ловушка для ботов */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />
            </div>

            <button
              type="submit"
              disabled={status === "sending" || status === "done"}
              className="mt-6 h-12 w-full rounded-full bg-neutral-950 text-sm font-medium text-white transition-all hover:bg-neutral-800 hover:shadow-xl hover:shadow-neutral-950/15 active:scale-[0.98] disabled:opacity-60"
            >
              {status === "sending"
                ? "Отправляем…"
                : status === "done"
                  ? "Готово — скоро свяжемся"
                  : isMaster
                    ? "Зарегистрироваться как мастер"
                    : "Зарегистрироваться как заказчик"}
            </button>

            {status === "error" && (
              <p className="mt-3 text-center text-sm text-red-600">
                Не получилось отправить. Попробуйте ещё раз или напишите нам в
                Telegram.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
