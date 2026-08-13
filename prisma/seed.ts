import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.person.count()
  if (existing > 0) return
  const ramesh = await prisma.person.create({ data: { firstName: "Ramesh", lastName: "Sharma", gender: "M", birthYear: 1940, deathYear: 2020, birthPlace: "Hyderabad", biography: "Family patriarch." } })
  const sita = await prisma.person.create({ data: { firstName: "Sita", lastName: "Sharma", gender: "F", birthYear: 1945, birthPlace: "Hyderabad", biography: "Family matriarch." } })
  const arun = await prisma.person.create({ data: { firstName: "Arun", lastName: "Sharma", gender: "M", birthYear: 1968, birthPlace: "Bengaluru", biography: "Eldest son." } })
  const meena = await prisma.person.create({ data: { firstName: "Meena", lastName: "Sharma", gender: "F", birthYear: 1971, birthPlace: "Bengaluru" } })
  const priya = await prisma.person.create({ data: { firstName: "Priya", lastName: "Sharma", gender: "F", birthYear: 1995, birthPlace: "Fairfax", biography: "Family historian." } })
  await prisma.relationship.createMany({ data: [
    { type: "SPOUSE", fromId: ramesh.id, toId: sita.id },
    { type: "PARENT", fromId: ramesh.id, toId: arun.id },
    { type: "PARENT", fromId: sita.id, toId: arun.id },
    { type: "SPOUSE", fromId: arun.id, toId: meena.id },
    { type: "PARENT", fromId: arun.id, toId: priya.id },
    { type: "PARENT", fromId: meena.id, toId: priya.id },
  ] })
}

main().finally(() => prisma.$disconnect())
