import { PrismaClient } from "@prisma/client"

declare global {
    var cachedPrisma: PrismaClient
}

// Helps prevent creating too many clients
let prisma: PrismaClient
if(process.env.NODE_ENV === "production") {
    prisma = new PrismaClient()
} else {
    if(!global.cachedPrisma) {
        globalThis.cachedPrisma = new PrismaClient()
    }
    prisma = global.cachedPrisma
}

export const db = prisma