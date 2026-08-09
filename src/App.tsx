import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import { useLenis } from "./hooks/useLenis";
import CustomCursor from "./components/CustomCursor";
import Work from "./components/Work";
import Services from "./components/Services";
import Tools from "./components/Tools";
import About from "./components/About";
import Process from "./components/Process";
import Trust from "./components/Trust";
import Contact from "./components/Contact";

function App() {
  useLenis();

  return (
    <>
    <CustomCursor />
      <Navbar />

      <main>
        <Hero />
        <Work />
        <Services />
        <Tools />
        <About />
        <Process />
        <Trust />
        <Contact />
      </main>
    </>
  );
}

export default App;