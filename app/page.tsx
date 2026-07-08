import { ContactForm } from "./components/ContactForm";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { HowWeWork } from "./components/HowWeWork";
import { Projects } from "./components/Projects";
import { Services } from "./components/Services";
import { WhyChooseUs } from "./components/WhyChooseUs";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <WhyChooseUs />
        <Services />
        <HowWeWork />
        <Projects />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
