# Как сделать, чтобы сайт открывался без VPN

Адреса Vercel (vercel.app и IP Vercel) у части российских провайдеров режутся.
В самом сайте внешних ресурсов нет: шрифт лежит в `public/fonts`, картинки свои.
Значит, нужно разместить сайт на российском хостинге и подключить домен .ru.

## Вариант 1. Timeweb Cloud / Beget / Selectel (приложение Next.js из GitHub)

1. Купи домен .ru (reg.ru) и хостинг с поддержкой Node.js 20+.
2. Подключи репозиторий `alexeykostenich11-bot/rooki`.
3. Команда сборки: `npm ci && npm run build`. Команда запуска: `npm start` (порт берётся из переменной PORT).
4. Переменные окружения:
   - `TELEGRAM_BOT_TOKEN`
   - `GOOGLE_SHEETS_WEBHOOK_URL` (по инструкции docs/google-sheets-register.md)
   - `NEXT_PUBLIC_SITE_URL` = https://твой-домен.ru
5. Привяжи домен в панели хостинга. В DNS у reg.ru добавь A-запись на IP хостинга.
6. Включи HTTPS (бесплатный сертификат Let's Encrypt в панели).

## Вариант 2. VPS (любой российский)

```
git clone https://github.com/alexeykostenich11-bot/rooki && cd rooki
npm ci && npm run build
PORT=3000 npm start   # лучше через pm2, а перед ним nginx с HTTPS
```

## Проверка

Открой сайт с мобильного интернета без VPN (МТС, Билайн, Мегафон, Теле2)
и с домашнего Wi-Fi. Заполни форму и убедись, что заявка пришла в Telegram.

## Важно

Telegram API (api.telegram.org) должен быть доступен с самого сервера.
У российских хостингов он обычно открыт. Если заявки не приходят, напиши,
подберём обход.
