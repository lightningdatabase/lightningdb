import {
  BoolFilter,
  DateTimeFilter,
  EveryFilter,
  IntFilter,
  NoneFilter,
  SomeFilter,
  StringFilter,
} from "../types"

export const applyWhereClause = <T extends Record<string, any>>(
  whereClause: object | undefined,
  rowValues: T,
): boolean =>
  whereClause
    ? Object.entries(whereClause).every(([key, value]) =>
        applyWhere(key, value, rowValues),
      )
    : true

export const applyWhere = <T extends Record<string, any>>(
  fieldName: string,
  whereClause:
    | string
    | number
    | boolean
    | Date
    | IntFilter
    | StringFilter
    | DateTimeFilter
    | BoolFilter
    | SomeFilter
    | EveryFilter
    | NoneFilter
    | null,
  rowValues: T,
): boolean => {
  const rowValue = rowValues[fieldName as keyof typeof rowValues] as any

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

  if ("some" in whereClause && whereClause.some) {
    return true
    // TODO: Need to query relationship as not included in the change data
    // const valueSome = whereClause.some

    // if (!valueSome || !rowValue || !Array.isArray(rowValue)) return false

    // return rowValue.some(item =>
    //   Object.entries(valueSome).every(([key, v]) =>
    //     applyWhere(key, v as any, item as Record<string, any>),
    //   ),
    // )
  }

  if ("every" in whereClause && whereClause.every) {
    return true
    // TODO: Need to query relationship as not included in the change data
    // const valueEvery = whereClause.every

    // if (!valueEvery || !rowValue || !Array.isArray(rowValue)) return false

    // return rowValue.every(item =>
    //   Object.entries(valueEvery).every(([key, v]) =>
    //     applyWhere(key, v as any, item as Record<string, any>),
    //   ),
    // )
  }

  if ("none" in whereClause && whereClause.none) {
    return true
    // TODO: Need to query relationship as not included in the change data
    // const valueNone = whereClause.none

    // if (!valueNone || !rowValue || !Array.isArray(rowValue)) return false

    // return !rowValue.some(item =>
    //   Object.entries(valueNone).every(([key, v]) =>
    //     applyWhere(key, v as any, item as Record<string, any>),
    //   ),
    // )
  }

  return false
}
