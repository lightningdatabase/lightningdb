import { PrismaClient } from "@prisma/client"
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended"

import prisma from "./client.js"

vi.mock("./client", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

beforeEach(() => {
  mockReset(prismaMock)
})

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>
