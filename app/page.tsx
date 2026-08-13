"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"

type Relationship = { id: string; type: "PARENT" | "CHILD" | "SPOUSE"; fromId: string; toId: string }
type Person = { id: string; firstName: string; lastName: string; gender?: string | null; birthYear?: number | null; deathYear?: number | null; birthPlace?: string | null; biography?: string | null; relationships: Relationship[]; relatedTo: Relationship[] }

type Modal = "add" | "edit" | "relationship" | null
const initials = (p: Person) => `${p.firstName?.[0] ?? ""}${p.lastName?.[0] ?? ""}`.toUpperCase()

export default function Home() {
  const [people, setPeople] = useState<Person[]>([])
  const [selected, setSelected] = useState("")
  const [tab, setTab] = useState("tree")
  const [query, setQuery] = useState("")
  const [modal, setModal] = useState<Modal>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function loadPeople() {
    try {
      setLoading(true)
      const res = await fetch("/api/people", { cache: "no-store" })
      if (!res.ok) throw new Error("Database is not connected yet.")
      const data = await res.json()
      setPeople(data)
      setSelected(current => current && data.some((p: Person) => p.id === current) ? current : data[0]?.id ?? "")
      setError("")
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load family data.") } finally { setLoading(false) }
  }
  useEffect(() => { loadPeople() }, [])

  const current = people.find(p => p.id === selected) ?? people[0]
  const parents = useMemo(() => current ? people.filter(p => p.relationships?.some(r => r.type === "PARENT" && r.toId === current.id) || p.relatedTo?.some(r => r.type === "PARENT" && r.fromId === current.id)) : [], [people, current])
  const children = useMemo(() => current ? people.filter(p => p.relationships?.some(r => r.type === "PARENT" && r.fromId === current.id)) : [], [people, current])
  const spouse = useMemo(() => current ? people.find(p => p.relationships?.some(r => r.type === "SPOUSE" && r.fromId === current.id) || p.relatedTo?.some(r => r.type === "SPOUSE" && r.toId === current.id)) : undefined, [people, current])
  const filtered = people.filter(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(query.toLowerCase()))

  async function addPerson(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget)
    const res = await fetch("/api/people", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ firstName: f.get("firstName"), lastName: f.get("lastName"), gender: f.get("gender"), birthYear: f.get("birthYear"), deathYear: f.get("deathYear"), birthPlace: f.get("birthPlace"), biography: f.get("biography") }) })
    if (!res.ok) return setError((await res.json()).error || "Could not add person")
    const p = await res.json(); setModal(null); await loadPeople(); setSelected(p.id); setTab("profile")
  }
  async function editPerson(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!current) return; const f = new FormData(e.currentTarget)
    const res = await fetch("/api/people", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: current.id, firstName: f.get("firstName"), lastName: f.get("lastName"), gender: f.get("gender"), birthYear: f.get("birthYear"), deathYear: f.get("deathYear"), birthPlace: f.get("birthPlace"), biography: f.get("biography") }) })
    if (!res.ok) return setError("Could not update person"); setModal(null); await loadPeople()
  }
  async function relationship(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!current) return; const f = new FormData(e.currentTarget); const type = String(f.get("type")); const otherId = String(f.get("person"))
    const payload = type === "CHILD" ? { fromId: current.id, toId: otherId, type: "PARENT" } : type === "PARENT" ? { fromId: otherId, toId: current.id, type: "PARENT" } : { fromId: current.id, toId: otherId, type: "SPOUSE" }
    const res = await fetch("/api/relationships", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    if (!res.ok) return setError((await res.json()).error || "Could not connect people"); setModal(null); await loadPeople()
  }
  async function removePerson() {
    if (!current || !confirm(`Delete ${current.firstName} ${current.lastName}?`)) return
    await fetch("/api/people", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: current.id }) }); await loadPeople()
  }

  const Card = ({ p }: { p: Person }) => <button className={`person ${selected === p.id ? "selected" : ""}`} onClick={() => setSelected(p.id)}><div className="personrow"><div className="avatar">{initials(p)}</div><div><h3>{p.firstName} {p.lastName}</h3><small>{p.birthYear ?? "Unknown"}{p.deathYear ? ` — ${p.deathYear}` : ""}</small></div></div></button>

  return <div className="app"><header className="topbar"><div className="brand"><div className="logo">⌘</div><span>Family Tree</span></div><div className="actions"><button className="secondary" onClick={() => setModal("relationship")} disabled={!current}>Connect</button><button className="primary" onClick={() => setModal("add")}>+ Add person</button></div></header>
    <div className="layout"><aside className="sidebar"><nav className="nav">{[["tree", "🌳 Tree"], ["people", "👥 People"], ["profile", "👤 Profile"]].map(([id, label]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>{label}</button>)}</nav><div style={{ marginTop: 28, padding: 14 }}><small className="muted">Your family</small><div style={{ fontWeight: 800, marginTop: 6 }}>{people.length} people</div><div className="muted" style={{ fontSize: 12, marginTop: 4 }}>Stored in PostgreSQL</div></div></aside>
      <main className="content">{error && <div className="notice">{error} <button className="secondary" onClick={loadPeople}>Retry</button></div>}
        {loading ? <div className="card">Loading family data…</div> : tab === "tree" ? <><div className="heading"><div><h1>Family tree</h1><p className="muted">Live data from your database.</p></div></div><div className="grid" style={{ marginBottom: 16 }}><div className="card stat"><div><span>People</span><strong>{people.length}</strong></div><span>members</span></div><div className="card stat"><div><span>Relationships</span><strong>{Math.floor(people.reduce((n,p) => n + (p.relationships?.length ?? 0), 0))}</strong></div><span>stored</span></div><div className="card stat"><div><span>Selected</span><strong>{current ? "1" : "0"}</strong></div><span>person</span></div></div><div className="tree"><div className="generation">{parents.map(p => <Card key={p.id} p={p} />)}</div>{parents.length > 0 && <div className="connector" />}<div className="generation">{current && <Card p={current} />}{spouse && <Card p={spouse} />}</div>{children.length > 0 && <><div className="connector" /><div className="generation">{children.map(p => <Card key={p.id} p={p} />)}</div></>}</div></> : tab === "people" ? <><div className="heading"><div><h1>People</h1><p className="muted">Manage records stored in PostgreSQL.</p></div><button className="primary" onClick={() => setModal("add")}>+ Add person</button></div><div className="card"><input className="search" placeholder="Search by name..." value={query} onChange={e => setQuery(e.target.value)} /><table className="table"><thead><tr><th>Name</th><th>Birth</th><th>Place</th><th>Relations</th></tr></thead><tbody>{filtered.map(p => <tr key={p.id} onClick={() => { setSelected(p.id); setTab("profile") }}><td><b>{p.firstName} {p.lastName}</b></td><td>{p.birthYear ?? "—"}</td><td>{p.birthPlace ?? "—"}</td><td>{(p.relationships?.length ?? 0) + (p.relatedTo?.length ?? 0)}</td></tr>)}</tbody></table>{!filtered.length && <div className="empty">No people found.</div>}</div></> : current ? <><div className="heading"><div><h1>Person profile</h1><p className="muted">Persisted family record.</p></div><div className="actions"><button className="secondary" onClick={() => setModal("edit")}>Edit</button><button className="danger" onClick={removePerson}>Delete</button></div></div><div className="card"><div className="detail"><div><div className="avatar">{initials(current)}</div></div><div><span className="badge">{current.gender === "M" ? "Male" : current.gender === "F" ? "Female" : "Family member"}</span><h2>{current.firstName} {current.lastName}</h2><p className="muted">{current.biography || "No biography added yet."}</p><div className="facts"><div className="fact"><b>Born</b>{current.birthYear ?? "Unknown"}</div><div className="fact"><b>Died</b>{current.deathYear ?? "Living / unknown"}</div><div className="fact"><b>Place</b>{current.birthPlace ?? "Unknown"}</div><div className="fact"><b>Parents</b>{parents.length ? parents.map(p => p.firstName).join(", ") : "Not connected"}</div></div></div></div></div></> : <div className="card">No person selected. Add your first family member.</div>}
      </main></div>
    {modal && <div className="modalback" onMouseDown={e => { if (e.target === e.currentTarget) setModal(null) }}><div className="modal"><div className="modalhead"><h2>{modal === "add" ? "Add family member" : modal === "edit" ? "Edit person" : "Connect people"}</h2><button className="close" onClick={() => setModal(null)}>×</button></div>
      {modal === "relationship" ? <form onSubmit={relationship}><div className="formgrid"><div className="field"><label>Relationship</label><select name="type" defaultValue="CHILD"><option value="CHILD">Add as child</option><option value="PARENT">Add as parent</option><option value="SPOUSE">Add as spouse</option></select></div><div className="field"><label>Person</label><select name="person" required defaultValue=""><option value="" disabled>Select person</option>{people.filter(p => p.id !== current?.id).map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}</select></div></div><div className="actions" style={{ justifyContent: "flex-end", marginTop: 20 }}><button type="button" className="secondary" onClick={() => setModal(null)}>Cancel</button><button className="primary">Save relationship</button></div></form> : <form onSubmit={modal === "add" ? addPerson : editPerson}><div className="formgrid"><div className="field"><label>First name</label><input name="firstName" required defaultValue={modal === "edit" ? current?.firstName : ""} /></div><div className="field"><label>Last name</label><input name="lastName" required defaultValue={modal === "edit" ? current?.lastName : ""} /></div><div className="field"><label>Gender</label><select name="gender" defaultValue={modal === "edit" ? current?.gender ?? "" : ""}><option value="">Not specified</option><option value="M">Male</option><option value="F">Female</option></select></div><div className="field"><label>Birth year</label><input name="birthYear" defaultValue={modal === "edit" ? current?.birthYear ?? "" : ""} /></div><div className="field"><label>Death year</label><input name="deathYear" defaultValue={modal === "edit" ? current?.deathYear ?? "" : ""} /></div><div className="field"><label>Birth place</label><input name="birthPlace" defaultValue={modal === "edit" ? current?.birthPlace ?? "" : ""} /></div></div><div className="field" style={{ marginTop: 14 }}><label>Biography</label><textarea name="biography" defaultValue={modal === "edit" ? current?.biography ?? "" : ""} /></div><div className="actions" style={{ justifyContent: "flex-end", marginTop: 20 }}><button type="button" className="secondary" onClick={() => setModal(null)}>Cancel</button><button className="primary">{modal === "add" ? "Add person" : "Save changes"}</button></div></form>}
    </div></div>}</div>
}
