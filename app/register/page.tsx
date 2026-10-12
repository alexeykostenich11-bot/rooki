import type { Metadata } from "next";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { RegisterForm } from "../components/RegisterForm";

export const metadata: Metadata = {
  title: "Регистрация",
  description:
    "Регистрация для мастеров и заказчиков ROOKI: оставьте данные, и мы свяжемся с вами.",
};

export default function RegisterPage() {
  return (
    <>
      <Header />
      <main className="pt-16 md:pt-[4.5rem]">
        <RegisterForm />
      </main>
      <Footer />
    </>
  );
}
