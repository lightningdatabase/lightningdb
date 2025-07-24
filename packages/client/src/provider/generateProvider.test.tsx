import { render, screen } from "@testing-library/react"
import generateProvider from "./generateProvider"
import z from "zod"

vi.mock("./useWebSocket", () => ({
  useWebSocket: vi.fn(() => ({
    sendMessage: vi.fn(),
  })),
}))

test("renders", async () => {
  const DBProvider = generateProvider(
    z.object({
      error: z.any().optional(),
      data: z
        .object({
          users: z.array(z.object({ id: z.number(), name: z.string() })),
        })
        .optional(),
      deletes: z
        .object({ users: z.array(z.object({ id: z.number() })) })
        .optional(),
    }),
    {},
  )

  render(
    <DBProvider url="ws://localhost:8080">
      <div>Hello</div>
    </DBProvider>,
  )

  expect(screen.getByText("Hello").textContent).toBe("Hello")
})
