const anyToString = (value: any) => {
  switch (typeof value) {
    case "number":
      return value
    case "string":
      return value
  }

  if (value instanceof Date && !isNaN(value.getTime())) {
    // Format as YYYY-MM-DD or any other format
    return value.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return JSON.stringify(value)
}

export default anyToString
