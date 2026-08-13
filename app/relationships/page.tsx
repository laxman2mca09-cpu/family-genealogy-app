"use client"

import { useEffect, useMemo, useState } from "react"

type Person = { id: string; firstName: string; lastName: string }
type Relationship = { id: string; type: "PARENT" | "CHILD" | "SPOUSE"; fromId: string; toId: string }

const label = (type: Relationship["type"]) => type === "PARENT" ? "Parent of" : type === "CHILD" ? "Child of" : "Spouse of"

export default function RelationshipsPage() {
  const [people, setPeople] = useState<Person[]>([])
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [fromId, setFromId] = useState("")
  const [toId, setToId] = useState("")
  const [type, setType] = useState<Relationship["type"]>("PARENT")
  const [message, setMessage] = useState("")

  async function load() {
    const res = await fetch("/api/people", { cache: "no-store" })
    if (!res.ok) throw new Error("Unable to load people")
    const data = await res.json()
    setPeople(data)
    setRelationships(data.flatMap((p: Person & { relationships?: Relationship[] }) => p.relationships ?? []))
  }

  useEffect(() => { load().catch(e => setMessage(e.message)) }, [])

  const names = useMemo(() => new Map(people.map(p => [p.id, `${p.firstName} ${p.lastName}`])), [people])

  async function add() {
    if (!fromId || !toId || fromId === toId) return setMessage("Select two different people.")
    const res = await fetch("/api/relationships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromId, toId, type }),
    })
    const data = await res.json()
    if (!res.ok) return setMessage(data.error || "Could not create relationship.")
    setMessage("Relationship saved to PostgreSQL.")
    await load()
  }

  async function remove(id: string) {
    const res = await fetch("/api/relationships", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    if (!res.ok) return setMessage("Could not delete relationship.")
    setMessage("Relationship deleted.")
    await load()
  }

  return <main style={{ maxWidth: 1000, margin: "0 auto", padding: 32, fontFamily: "system-ui" }}>
    <h1>Family Relationships</h1>
    <p style={{ color: "#667085" }}>Create and remove parent, child, and spouse relationships stored in PostgreSQL.</p>

    <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, padding: 20, border: "1px solid #e5e7eb", borderRadius: 14, marginTop: 24 }}>
      <label>Person<select value={fromId} onChange={e => setFromId(e.target.value)} style={{ width: "100%", padding: 10, marginTop: 5 }}><option value="">Select</option>{people.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}</select></label>
      <label>Relationship<select value={type} onChange={e => setType(e.target.value as Relationship["type"])} style={{ width: "100%", padding: 10, marginTop: 5 }}><option value="PARENT">Parent of</option><option value="CHILD">Child of</option><option value="SPOUSE">Spouse of</option></select></label>
      <label>Related person<select value={toId} onChange={e => setToId(e.target.value)} style={{ width: "100%", padding: 10, marginTop: 5 }}><option value="">Select</option>{people.filter(p => p.id !== fromId).map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}</select></label>
      <button onClick={add} style={{ gridColumn: "1 / -1", padding: 11, border: 0, borderRadius: 9, background: "#233b7a", color: "white", fontWeight: 700 }}>Add relationship</button>
    </section>

    {message && <p style={{ padding: 12, background: "#f0f6ff", borderRadius: 9 }}>{message}</p>}

    <section style={{ marginTop: 24 }}>
      <h2>Stored relationships ({relationships.length})</h2>
      {relationships.length === 0 ? <p style={{ color: "#667085" }}>No relationships yet.</p> : relationships.map(r => <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 14, borderBottom: "1px solid #eee" }}><span><b>{names.get(r.fromId) ?? r.fromId}</b> — {label(r.type).toLowerCase()} — <b>{names.get(r.toId) ?? r.toId}</b></span><button onClick={() => remove(r.id)} style={{ border: 0, borderRadius: 8, padding: "7px 10px", color: "#b42318", background: "#fff1f1" }}>Delete</button></div>)}
    </section>
  </main>
}
