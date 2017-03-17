import {getValue} from 'react-form-helper/dist/src/helpers'

export const findValidationErrors = (error, validatedObject, ignorePath) => {
  const validationError = error.graphQLErrors.find(e => e.type === 'ValidationError')
  if (!validationError) return null

  return {
    type: validationError.type,
    errors: validationError.errors.map(error => {
      const path = error.path || [error.field]
      if (path[0] === ignorePath) {
        path.shift()
      }

      return {
        type: error.type,
        path,
        value: getValue(path, validatedObject)
      }
    })
  }
}

export function removeTypename(object) {
  if (Array.isArray(object)) {
    return object.map(removeTypename)
  } else if (object && object.__typename) {
    const {__typename: _, ...newObject} = object
    Object.entries(newObject).forEach(([key, value]) => {
      if (typeof value === 'object') {
        newObject[key] = removeTypename(value)
      }
    })
    return newObject
  }
  return object
}

export const validationErrorHandler = (object, setValidationError, name) => error =>  {
  const validationError = findValidationErrors(error, object, name)
  if (!validationError) throw error
  setValidationError(validationError)
  return validationError
}

export function isArrayEqual(a, b) {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

export function trimArrayLeft(array: Array<any>, steps: number = 0) {
  const newArray = [...array]
  newArray.splice(0, steps)
  return newArray
}

export function startsWith(long: Array<any>, short: Array<any>) {
  if (short.length > long.length) return false

  return short.every((part, i) => part === long[i])
}
