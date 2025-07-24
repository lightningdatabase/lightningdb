import fs from "fs"
import { Model } from "../modelParser"
import { generateClientSchema } from "./schema"
import generateIndexFile from "./indexFile"

export const generateClient = async (dataModel: Model, clientPath: string) => {
  // Create folder if it doesn't exist
  const clientFolder = `${clientPath}/lightningdb`
  await fs.promises.mkdir(clientFolder, { recursive: true })

  // Generate schema.ts file
  const clientSchema = generateClientSchema(dataModel)
  await fs.promises.writeFile(`${clientFolder}/schema.ts`, clientSchema)

  const indexFile = generateIndexFile()
  await fs.promises.writeFile(`${clientFolder}/index.ts`, indexFile)
}
