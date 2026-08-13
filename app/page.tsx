export default function Home() {
  return (
    <main style={{ minHeight: "100vh", padding: "48px 24px", fontFamily: "Arial, sans-serif", background: "#f7f7f5" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <header style={{ marginBottom: 40 }}>
          <p style={{ margin: 0, color: "#666", fontSize: 14, letterSpacing: 1 }}>FAMILY GENEALOGY</p>
          <h1 style={{ fontSize: 42, margin: "10px 0" }}>Discover your family story</h1>
          <p style={{ color: "#555", fontSize: 18, maxWidth: 700 }}>
            Build, explore, and preserve your family tree in one place.
          </p>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          {[
            ["Family Tree", "Explore relationships across generations."],
            ["People", "Keep names, dates, places, and stories together."],
            ["Memories", "Preserve important family history for future generations."],
          ].map(([title, description]) => (
            <article key={title} style={{ background: "white", border: "1px solid #ddd", borderRadius: 16, padding: 24 }}>
              <h2 style={{ marginTop: 0 }}>{title}</h2>
              <p style={{ color: "#666", lineHeight: 1.6 }}>{description}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
