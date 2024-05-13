const emptyObject = {}

export function once(operation) {
  let memo
  const out = function(...operationParameters) {
    if (!memo) {
      memo = operation(...operationParameters)
      // release reference to original function
      operation = emptyObject
    }
    return memo
  }
  return out
}
