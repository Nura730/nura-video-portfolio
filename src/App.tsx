import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import { useLenis } from "./hooks/useLenis";
import CustomCursor from "./components/CustomCursor";

function App() {
  useLenis();

  return (
    <>
    <CustomCursor />
      <Navbar />

      <main>
        <Hero />

        <section
          id="work"
          className="test-section"
        >
          <p>WORK SECTION — COMING NEXT</p>
        </section>
      </main>
    </>
  );
}

export default App;