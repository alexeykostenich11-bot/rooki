import { Calculator } from "./components/Calculator";
import { ContactForm } from "./components/ContactForm";
import { Footer } from "./components/Footer";
import { ForMasters } from "./components/ForMasters";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { HowWeWork } from "./components/HowWeWork";
import { Projects } from "./components/Projects";
import { Services } from "./components/Services";
import { Trust } from "./components/Trust";
import { WhyChooseUs } from "./components/WhyChooseUs";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Calculator />
        <Projects />
        <Services />
        <HowWeWork />
        <Trust />
        <WhyChooseUs />
        <ForMasters />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
