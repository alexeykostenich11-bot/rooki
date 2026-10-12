# Регистрации в Google Таблицу

1. Создай таблицу Google, в первой строке напиши заголовки:
   Дата | Роль | Имя | Телефон | Данные
2. Расширения → Apps Script, вставь код:

```js
function doPost(e) {
  var d = JSON.parse(e.postData.contents);
  var sh = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var skip = ["date", "role", "name", "phone"];
  var extra = Object.keys(d)
    .filter(function (k) { return skip.indexOf(k) < 0 && d[k]; })
    .map(function (k) { return k + ": " + d[k]; })
    .join("\n");
  sh.appendRow([d.date, d.role, d.name, d.phone, extra]);
  return ContentService.createTextOutput("ok");
}
```

3. Развернуть → Новое развёртывание → Веб-приложение:
   выполнять от своего имени, доступ: Все.
4. Скопируй адрес вида https://script.google.com/macros/s/.../exec
5. Vercel → Settings → Environment Variables → `GOOGLE_SHEETS_WEBHOOK_URL`
   = этот адрес. Затем Redeploy.
