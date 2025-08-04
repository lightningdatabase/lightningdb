const removeAtIndex = <T>(arr: T[], index: number): T[] => [
  ...arr.slice(0, index),
  ...arr.slice(index + 1),
]

export default removeAtIndex
