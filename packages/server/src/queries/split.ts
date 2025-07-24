import { QueryParams } from "src/clientStore"

type QueryResult = Record<string, any>[]
type Result = Record<string, QueryResult>

export const splitResult = (
  table: string,
  queryResult: QueryResult,
  queryParams: QueryParams,
): Result => {
  const finalResult: Result = { [table]: queryResult }
  const includes = queryParams.include || {}

  const processIncludes = (
    data: QueryResult,
    includePath: Record<string, any>,
  ) => {
    if (!Array.isArray(data)) return

    data.forEach(item => {
      if (!item || typeof item !== "object") return

      // Process each include at this level
      Object.entries(includePath).forEach(([includeKey, includeValue]) => {
        if (item[includeKey]) {
          const nestedData = Array.isArray(item[includeKey])
            ? item[includeKey]
            : [item[includeKey]]

          // Only add to final result if the array is not empty
          if (nestedData.length > 0) {
            if (!finalResult[includeKey]) {
              finalResult[includeKey] = []
            }

            // Add each nested item to the collection
            nestedData.forEach((nestedItem: any) => {
              if (nestedItem && typeof nestedItem === "object") {
                // Check if item already exists (by id)
                const exists = finalResult[includeKey].some(
                  (existing: any) => existing.id === nestedItem.id,
                )
                if (!exists) {
                  finalResult[includeKey].push(nestedItem)
                }
              }
            })
          }

          // Remove the nested data from the parent
          delete item[includeKey]

          // Recursively process nested includes
          if (
            includeValue &&
            typeof includeValue === "object" &&
            includeValue.include
          ) {
            processIncludes(nestedData, includeValue.include)
          }
        }
      })
    })
  }

  processIncludes(queryResult, includes)

  return finalResult
}
