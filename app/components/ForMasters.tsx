import Link from "next/link";
import { Section } from "./Section";

export function ForMasters() {
  return (
    <Section id="masters" label="Для мастеров" title="Вы мастер? Покажите свои работы тем, кто ищет ремонт">
      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-neutral-200/80 bg-white p-7 md:p-8">
          <ul className="space-y-3 text-neutral-700">
            <li>• Личный кабинет: фото ваших проектов, описание, площадь и срок.</li>
            <li>• Свои цены на каждый вид работ, чтобы заказчик сразу понимал бюджет.</li>
            <li>• Анкету проверяет команда ROOKI, поэтому в каталоге нет случайных людей.</li>
            <li>• Заявки приходят от заказчиков из Москвы и области.</li>
          </ul>
        </div>
        <div className="flex flex-col justify-between gap-4 rounded-3xl bg-neutral-950 p-7 text-white md:p-8">
          <p className="text-lg font-semibold tracking-tight">Регистрация занимает две минуты</p>
          <div className="flex flex-col gap-3">
            <Link href="/signup?role=master"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-medium text-neutral-950 transition-all hover:bg-neutral-200 active:scale-[0.98]">
              Создать кабинет мастера
            </Link>
            <Link href="/masters" className="text-center text-sm text-neutral-400 hover:text-white">Посмотреть каталог мастеров →</Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
