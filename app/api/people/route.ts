import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const people = await prisma.person.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: { relationships: true, relatedTo: true },
  })
  return NextResponse.json(people)
}

export async function POST(request: Request) {
  const body = await request.json()
  if (!body.firstName?.trim() || !body.lastName?.trim()) {
    return NextResponse.json({ error: "First and last name are required." }, { status: 400 })
  }
  const person = await prisma.person.create({
    data: {
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      gender: body.gender || null,
      birthYear: body.birthYear ? Number(body.birthYear) : null,
      deathYear: body.deathYear ? Number(body.deathYear) : null,
      birthPlace: body.birthPlace || null,
      biography: body.biography || null,
    },
  })
  return NextResponse.json(person, { status: 201 })
}

export async function PATCH(request: Request) {
  const body = await request.json()
  if (!body.id) return NextResponse.json({ error: "Person id is required." }, { status: 400 })
  const person = await prisma.person.update({
    where: { id: body.id },
    data: {
      firstName: body.firstName?.trim(),
      lastName: body.lastName?.trim(),
      gender: body.gender || null,
      birthYear: body.birthYear ? Number(body.birthYear) : null,
      deathYear: body.deathYear ? Number(body.deathYear) : null,
      birthPlace: body.birthPlace || null,
      biography: body.biography || null,
    },
  })
  return NextResponse.json(person)
}

export async function DELETE(request: Request) {
  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: "Person id is required." }, { status: 400 })
  await prisma.person.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
