export default function Tools() {
  const tools = [
    {
      name: "CAPCUT",
      tag: "PC / MOBILE",
      description: "Reels • captions • transitions",
      accent: false,
    },
    {
      name: "ALIGHT MOTION",
      tag: "PC / MOBILE",
      description: "Motion • text animation • effects",
      accent: false,
    },
    {
      name: "PREMIERE PRO",
      tag: "LEARNING",
      description: "Professional editing workflow",
      accent: true,
    },
    {
      name: "DAVINCI RESOLVE",
      tag: "LEARNING",
      description: "Editing • color • post-production",
      accent: true,
    },
  ];

  return (
    <section className="tools-section" id="tools">
      <div className="tools-container">

        {/* Section heading */}
        <div className="tools-heading">
          <div className="section-label">
            03 / TOOLS
          </div>

          <h2>
            Tools I use
            <br />
            to build the edit.
          </h2>
        </div>

        {/* Tool cards */}
        <div className="tools-grid">
          {tools.map((tool) => (
            <article className="tool-card" key={tool.name}>

              <div className="tool-card-top">
                <h3>{tool.name}</h3>

                <span className="tool-arrow">
                  ↗
                </span>
              </div>

              <div
                className={`tool-tag ${
                  tool.accent ? "tool-tag-accent" : ""
                }`}
              >
                {tool.tag}
              </div>

              <p>{tool.description}</p>

            </article>
          ))}
        </div>

      </div>
    </section>
  );
}