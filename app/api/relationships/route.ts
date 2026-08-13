import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const types = ["PARENT", "CHILD", "SPOUSE"] as const

export async function POST(request: Request) {
  const body = await request.json()
  if (!body.fromId || !body.toId || !types.includes(body.type)) {
    return NextResponse.json({ error: "fromId, toId and a valid relationship type are required." }, { status: 400 })
  }
  if (body.fromId === body.toId) return NextResponse.json({ error: "A person cannot be related to themselves." }, { status: 400 })
  const relationship = await prisma.relationship.create({
    data: { fromId: body.fromId, toId: body.toId, type: body.type },
  })
  return NextResponse.json(relationship, { status: 201 })
}

export async function DELETE(request: Request) {
  const body = await request.json()
  await prisma.relationship.delete({ where: { id: body.id } })
  return NextResponse.json({ ok: true })
}
