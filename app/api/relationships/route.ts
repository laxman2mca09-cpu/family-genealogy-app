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

  // Store relationships in one canonical direction. This prevents the same
  // family connection from being inserted twice in opposite directions.
  let fromId = body.fromId
  let toId = body.toId
  let type = body.type as (typeof types)[number]

  if (type === "CHILD") {
    type = "PARENT"
    ;[fromId, toId] = [toId, fromId]
  }

  const existing = await prisma.relationship.findFirst({
    where: type === "SPOUSE"
      ? {
          type: "SPOUSE",
          OR: [
            { fromId, toId },
            { fromId: toId, toId: fromId },
          ],
        }
      : { type, fromId, toId },
  })

  if (existing) return NextResponse.json(existing, { status: 200 })

  const relationship = await prisma.relationship.create({
    data: { fromId, toId, type },
  })
  return NextResponse.json(relationship, { status: 201 })
}

export async function DELETE(request: Request) {
  const body = await request.json()
  if (!body.id) return NextResponse.json({ error: "Relationship id is required." }, { status: 400 })
  await prisma.relationship.delete({ where: { id: body.id } })
  return NextResponse.json({ ok: true })
}
