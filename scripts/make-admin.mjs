// Делает существующего пользователя админом: npm run make-admin -- почта@пример.ру
import pg from "pg";

const email = process.argv[2];
if (!email || !process.env.DATABASE_URL) {
  console.error("Использование: DATABASE_URL=... npm run make-admin -- почта@пример.ру");
  process.exit(1);
}
const ssl =
  process.env.DATABASE_SSL === "no-verify"
    ? { rejectUnauthorized: false }
    : process.env.DATABASE_SSL === "true"
      ? true
      : undefined;
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl });
await client.connect();
const r = await client.query("update users set role = 'admin' where lower(email) = lower($1) returning email", [email]);
console.log(r.rowCount ? `Готово: ${r.rows[0].email} теперь админ` : "Пользователь с такой почтой не найден. Сначала зарегистрируйтесь на сайте.");
await client.end();
