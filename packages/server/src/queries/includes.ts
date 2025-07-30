import { QueryParams } from "src/clientStore"

// Standard Prisma filter operators
const STANDARD_FILTER_OPERATORS = new Set([
  "equals",
  "in",
  "notIn",
  "lt",
  "lte",
  "gt",
  "gte",
  "contains",
  "startsWith",
  "endsWith",
  "mode",
  "some",
  "every",
  "none",
  "has",
  "hasEvery",
  "hasSome",
  "isEmpty",
])

export const generateIncludes = (queryParams: QueryParams): object => {
  const processedIncludes: Record<string, any> = {}

  // Process the main where clause to find relationship filters
  if (queryParams.where) {
    const relationshipFilters = extractRelationshipFilters(queryParams.where)
    Object.assign(processedIncludes, relationshipFilters)
  }

  // Process the include clause
  if (queryParams.include) {
    for (const [includeKey, includeValue] of Object.entries(
      queryParams.include,
    )) {
      if (typeof includeValue === "boolean") {
        processedIncludes[includeKey] = includeValue
        continue
      }

      if (typeof includeValue === "object" && includeValue !== null) {
        const processedInclude: Record<string, any> = {}

        // Copy all properties except where (we'll process it specially)
        for (const [key, value] of Object.entries(includeValue)) {
          if (key !== "where") {
            processedInclude[key] = value
          }
        }

        // Process where clause to handle relationship filters
        if (includeValue.where) {
          const processedWhere = processWhereClause(includeValue.where)
          if (Object.keys(processedWhere).length > 0) {
            processedInclude.where = processedWhere
          }
        }

        // Process nested includes recursively
        if (includeValue.include) {
          processedInclude.include = generateIncludes({
            include: includeValue.include,
          })
        }

        processedIncludes[includeKey] = processedInclude
      }
    }
  }

  return processedIncludes
}

const extractRelationshipFilters = (
  whereClause: Record<string, any>,
  isNested = false,
): Record<string, any> => {
  const relationshipIncludes: Record<string, any> = {}

  for (const [field, value] of Object.entries(whereClause)) {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const keys = Object.keys(value)
      const hasRelOp = keys.some(key => ["some", "every", "none"].includes(key))
      const allStandard = keys.every(key => STANDARD_FILTER_OPERATORS.has(key))
      if (allStandard && !hasRelOp) {
        // This is a scalar field filter, skip
        continue
      }
      // If this is a relationship operator (some/every/none) at the top level
      const isRelOp =
        keys.length === 1 && ["some", "every", "none"].includes(keys[0])
      if (isRelOp) {
        if (isNested) {
          // For nested, unwrap
          const relKey = keys[0]
          const relVal = value[relKey]
          if (
            typeof relVal === "object" &&
            relVal !== null &&
            !Array.isArray(relVal)
          ) {
            relationshipIncludes[field] = { where: relVal }
          } else {
            relationshipIncludes[field] = { where: value }
          }
        } else {
          // For top-level, flatten: where: value[relKey]
          const relKey = keys[0]
          relationshipIncludes[field] = { where: value[relKey] }
        }
        continue
      }
      // Otherwise, recursively process nested relationships
      const nested = extractRelationshipFilters(value, true)
      if (Object.keys(nested).length > 0) {
        relationshipIncludes[field] = { include: nested }
      } else {
        // If no nested includes, treat as where
        relationshipIncludes[field] = { where: value }
      }
    }
  }
  return relationshipIncludes
}

const processWhereClause = (
  whereClause: Record<string, any>,
): Record<string, any> => {
  const processedWhere: Record<string, any> = {}

  for (const [field, value] of Object.entries(whereClause)) {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      // Check if this is a relationship filter (object with non-standard filter operators)
      const hasNonStandardOperators = Object.keys(value).some(
        key => !STANDARD_FILTER_OPERATORS.has(key),
      )

      if (hasNonStandardOperators) {
        // This is a relationship filter, include it as is
        processedWhere[field] = value
      } else {
        // This is a standard filter, include it
        processedWhere[field] = value
      }
    } else {
      // Simple value, include it
      processedWhere[field] = value
    }
  }

  return processedWhere
}
