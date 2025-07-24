import type { PluginOptions } from "@zenstackhq/sdk"
import type { DMMF } from "@zenstackhq/sdk/prisma"
import { DataModel, isDataModel, type Model } from "@zenstackhq/sdk/ast"
import { generateClient } from "./client/generator"
import { Model as ModelParser } from "./modelParser"
import { generateServer } from "./server/generator"

export const name = "LightningDB Plugin"

const run = async (
  model: Model,
  options: PluginOptions,
  dmmf: DMMF.Document,
) => {
  const dataModels = model.declarations.filter((x): x is DataModel =>
    isDataModel(x),
  )

  const dataModel = new ModelParser(dataModels)

  console.log("Generating API schema")
  await generateServer(dataModel)
  console.log("API schema generated")

  if (options.clientPath) {
    if (typeof options.clientPath !== "string")
      throw new Error("clientPath must be a string")

    console.log("Generating client schema")
    await generateClient(dataModel, options.clientPath)
    console.log("Client schema generated")
  }
}

export default run
