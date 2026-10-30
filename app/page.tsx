import { BeforeAfter } from "./components/BeforeAfter";
import { Calculator } from "./components/Calculator";
import { ContactForm } from "./components/ContactForm";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { HowWeWork } from "./components/HowWeWork";
import { Projects } from "./components/Projects";
import { Services } from "./components/Services";
import { Trust } from "./components/Trust";
import { Questions } from "./components/Questions";
import { ContactActions } from "./components/ContactActions";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Calculator />
        <BeforeAfter />
        <Projects />
        <Services />
        <HowWeWork />
        <Trust />
        <Questions />
        <ContactForm />
      </main>
      <Footer />
      <ContactActions />
    </>
  );
}
