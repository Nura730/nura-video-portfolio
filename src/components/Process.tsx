export default function Process() {
  const steps = [
    {
      number: "01",
      title: "BRIEF",
      description: "You share the footage, references and goal.",
    },
    {
      number: "02",
      title: "EDIT",
      description: "I shape the story, pacing, sound, captions and effects.",
    },
    {
      number: "03",
      title: "REVIEW",
      description: "You review the first version and send feedback.",
    },
    {
      number: "04",
      title: "DELIVER",
      description: "Final video exported in the required format.",
    },
  ];

  return (
    <section className="process-section" id="process">
      <div className="process-container">

        <div className="process-header">
          <div className="section-label">
            05 / PROCESS
          </div>

          <h2>
            Simple process.
            <br />
            Clear output.
          </h2>
        </div>

        <div className="process-steps">
          {steps.map((step, index) => (
            <div className="process-step-wrapper" key={step.number}>

              <div className="process-card">

                <span className="process-number">
                  {step.number}
                </span>

                <h3>{step.title}</h3>

                <p>{step.description}</p>

              </div>

              {index < steps.length - 1 && (
                <span className="process-arrow">
                  →
                </span>
              )}

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}