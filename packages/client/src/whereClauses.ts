import {
  IntFilter,
  StringFilter,
  StringNullableListFilter,
  DateTimeFilter,
  BoolFilter,
  NoneFilter,
  EveryFilter,
  SomeFilter,
  Includes,
} from "./baseTypes"
import { Cache, CacheValue } from "./cache"

export const applyWhere = <T extends Record<string, any>>(
  parentKey: string,
  fieldName: string,
  whereClause:
    | string
    | number
    | boolean
    | Date
    | IntFilter
    | StringFilter
    | StringNullableListFilter
    | DateTimeFilter
    | BoolFilter
    | SomeFilter
    | EveryFilter
    | NoneFilter
    | null,
  rowValues: T,
  includesMap: Includes,
  cache: Cache,
): boolean => {
  const rowValue = rowValues[fieldName]

  if (typeof whereClause !== "object" || whereClause === null) {
    return rowValue === whereClause
  }

  if ("in" in whereClause && whereClause.in) {
    return whereClause.in.includes(rowValue as never)
  }

  if ("notIn" in whereClause && whereClause.notIn) {
    return !whereClause.notIn.includes(rowValue as never)
  }

  if ("equals" in whereClause && whereClause.equals) {
    return rowValue === whereClause.equals
  }

  if ("lt" in whereClause && whereClause.lt) {
    return rowValue < whereClause.lt
  }

  if ("lte" in whereClause && whereClause.lte) {
    return rowValue <= whereClause.lte
  }

  if ("gt" in whereClause && whereClause.gt) {
    return rowValue > whereClause.gt
  }

  if ("gte" in whereClause && whereClause.gte) {
    return rowValue >= whereClause.gte
  }

  if ("some" in whereClause) {
    const valueSome = whereClause.some

    if (!valueSome) return false

    // Get the related items from cache
    const relatedItems = getRelatedItems(
      parentKey,
      fieldName,
      rowValues,
      includesMap,
      cache,
    )

    return (
      relatedItems?.some(item =>
        Object.entries(valueSome).every(([key, v]) =>
          applyWhere(fieldName, key, v, item, includesMap, cache),
        ),
      ) ?? false
    )
  }

  if ("every" in whereClause) {
    const valueEvery = whereClause.every

    if (!valueEvery) return false

    // Get the related items from cache
    const relatedItems = getRelatedItems(
      parentKey,
      fieldName,
      rowValues,
      includesMap,
      cache,
    )

    return (
      relatedItems?.every(item =>
        Object.entries(valueEvery).every(([key, v]) =>
          applyWhere(fieldName, key, v, item, includesMap, cache),
        ),
      ) ?? false
    )
  }

  if ("none" in whereClause) {
    const valueNone = whereClause.none

    if (!valueNone) return false

    // Get the related items from cache
    const relatedItems = getRelatedItems(
      parentKey,
      fieldName,
      rowValues,
      includesMap,
      cache,
    )

    return !relatedItems?.some(item =>
      Object.entries(valueNone).every(([key, v]) =>
        applyWhere(fieldName, key, v, item, includesMap, cache),
      ),
    )
  }

  if ("has" in whereClause) {
    const valueHas = whereClause.has

    if (!valueHas) return false

    return rowValue.includes(valueHas)
  }

  if ("hasEvery" in whereClause) {
    const valueHasEvery = whereClause.hasEvery

    if (!valueHasEvery) return false

    return rowValue.every((item: any) => item === valueHasEvery)
  }

  if ("isEmpty" in whereClause) {
    const valueIsEmpty = whereClause.isEmpty

    if (valueIsEmpty === undefined) return false

    return valueIsEmpty ? rowValue.length === 0 : rowValue.length > 0
  }

  if ("hasSome" in whereClause) {
    const valueHasSome = whereClause.hasSome

    if (!valueHasSome) return false

    return rowValue.some((item: any) => item === valueHasSome)
  }

  return Object.entries(whereClause).every(([key, v]) => {
    const includeMap = includesMap[parentKey][fieldName]

    if (!includeMap) return false

    const relatedItem = cache[includeMap.model]?.find(
      row => row.id === rowValues[includeMap.field],
    )

    if (!relatedItem) return false

    return applyWhere(parentKey, key, v, relatedItem, includesMap, cache)
  })
}

const getRelatedItems = (
  parentKey: string,
  fieldName: string,
  rowValues: Record<string, any>,
  includesMap: Includes,
  cache: Cache,
): CacheValue[] | undefined => {
  const includeMap = includesMap[parentKey][fieldName]

  // Get the related items from cache
  return cache[includeMap.model]?.filter(row =>
    includeMap.type === "oneToMany"
      ? row[includeMap.field] === rowValues.id
      : row.id === rowValues[includeMap.field],
  )
}
