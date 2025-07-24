import {
  DataModel,
  DataModelField,
  ReferenceExpr,
  ArrayExpr,
  TypeDeclaration,
  Reference,
  AttributeArg,
  Expression,
} from "@zenstackhq/sdk/ast"
import notEmpty from "./helpers/notEmpty"

export type TableMap = Record<string, string>

export class Model {
  private _tables: Table[]

  constructor(models: DataModel[]) {
    this._tables = models.map(model => new Table(model))
    this._tables.forEach(table => table.setTables(this._tables))
  }

  get tables() {
    return this._tables
  }

  get tableMap() {
    return this._tables.reduce<TableMap>((tableMap, table) => {
      const pluralTableName = table.pluralName

      if (table.map) {
        tableMap[table.map] = pluralTableName
      } else {
        tableMap[table.name] = pluralTableName
      }

      return tableMap
    }, {})
  }
}

export class Table {
  private _model: DataModel
  private _tables: Table[]

  constructor(model: DataModel) {
    this._model = model
    this._tables = []
  }

  setTables(tables: Table[]) {
    this._tables = tables
  }

  get name() {
    return this._model.name
  }

  get pluralName() {
    return this._model.name.toLowerCase() + "s"
  }

  _getModelAttribute(name: string): string | null {
    const attr = this._model.attributes.find(a => a.decl.ref?.name === name)

    if (!attr) return null

    const attrArg = attr.args[0].value

    if ("value" in attrArg && typeof attrArg.value === "string")
      return attrArg.value

    return null
  }

  get map() {
    return this._getModelAttribute("@@map")
  }

  get fields() {
    return this._model.fields.map(field => new Field(field, this, this._tables))
  }
}

export class Field {
  private _model: DataModelField
  private _table: Table
  private _tables: Table[]

  constructor(model: DataModelField, table: Table, tables: Table[]) {
    this._model = model
    this._table = table
    this._tables = tables
  }

  get name() {
    return this._model.name
  }

  get type() {
    return this._model.type.type
  }

  get optional() {
    return this._model.type.optional
  }

  get array() {
    return this._model.type.array
  }

  _hasFieldAttribute(name: string): boolean {
    return this._model.attributes.some(attr => attr.decl.ref?.name === name)
  }

  get id() {
    return this._hasFieldAttribute("@id")
  }

  get unique() {
    return this._hasFieldAttribute("@unique")
  }

  get default() {
    return this._hasFieldAttribute("@default")
  }

  get relation() {
    if (!this._model.type.reference) return null

    return new Relation(
      this,
      this._model.type.reference,
      this._table,
      this._tables,
    )
  }

  _getFieldAttribute(name: string) {
    return this._model.attributes.find(attr => attr.decl.ref?.name === name)
  }
}

export class Relation {
  private _field: Field
  private _reference: Reference<TypeDeclaration>

  private _relationTable: Table
  private _targetRelation: Field

  constructor(
    field: Field,
    reference: Reference<TypeDeclaration>,
    table: Table,
    tables: Table[],
  ) {
    this._field = field
    this._reference = reference

    this._relationTable = this._getRelationTable(tables)
    this._targetRelation = this._getTargetRelation(table)
  }

  _getRelationTable(tables: Table[]) {
    const table = tables.find(table => table.name === this._reference.ref?.name)

    if (!table)
      throw new Error(`Relation table not found: ${this._reference.ref?.name}`)

    return table
  }

  get name() {
    return this._field.name
  }

  get type() {
    return this._field.array ? "oneToMany" : "manyToOne"
  }

  get refName() {
    return this._reference.ref?.name
  }

  get relationTable() {
    return this._relationTable
  }

  _getTargetRelation(table: Table): Field {
    if (!this._field.array) return this._field

    const foreignKeyField = this.relationTable.fields.find(
      f => f.relation?.refName === table.name && !f.array,
    )

    if (!foreignKeyField)
      throw new Error(`Foreign key field not found: ${table.name}`)

    return foreignKeyField
  }

  _handleFieldArg(fieldsArg: AttributeArg | undefined) {
    if (!fieldsArg) return undefined

    if (fieldsArg.value && filterArrayExpr(fieldsArg.value)) {
      const items = fieldsArg.value.items

      if (Array.isArray(items))
        return items
          .filter(filterReferenceExpr)
          .map(item => {
            if (item.target && "$refText" in item.target)
              return item.target.$refText
          })
          .filter(notEmpty)
    }

    return undefined
  }

  get fields() {
    const relationAttr = this._targetRelation._getFieldAttribute("@relation")
    if (!relationAttr) return undefined

    const fieldsArg = relationAttr.args.find(arg => arg.name === "fields")
    return this._handleFieldArg(fieldsArg)
  }

  get relatedFields() {
    const relationAttr = this._targetRelation._getFieldAttribute("@relation")
    if (!relationAttr) return undefined

    const fieldsArg = relationAttr.args.find(arg => arg.name === "references")
    return this._handleFieldArg(fieldsArg)
  }
}

const filterArrayExpr = (item: Expression): item is ArrayExpr =>
  item.$type === "ArrayExpr"

const filterReferenceExpr = (item: Expression): item is ReferenceExpr =>
  item.$type === "ReferenceExpr"
