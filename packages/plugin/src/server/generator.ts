import fs from "fs"
import { Model } from "../modelParser"
import { generateSchema } from "./schema"

export const generateServer = async (dataModel: Model) => {
  // Create folder if it doesn't exist
  const clientFolder = `./lightningdb`
  await fs.promises.mkdir(clientFolder, { recursive: true })

  // Generate schema.ts file
  const schema = generateSchema(dataModel)
  await fs.promises.writeFile(`${clientFolder}/schema.ts`, schema)
}
