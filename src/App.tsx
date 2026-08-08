import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import { useLenis } from "./hooks/useLenis";

function App() {
  useLenis();

  return (
    <>
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