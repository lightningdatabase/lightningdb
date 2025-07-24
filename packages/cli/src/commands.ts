import createFromTemplate from "./create"

export async function create(
  argv?: string[],
  // options: ViteBuildOptions = {}
): Promise<void> {
  await createFromTemplate(argv ?? [])
}
