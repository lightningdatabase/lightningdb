const singleModelName = (modelName: string) =>
  modelName.endsWith("s") ? modelName.slice(0, -1) : modelName

export default singleModelName
