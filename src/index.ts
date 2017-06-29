import {DataProxy} from 'apollo-client/data/proxy'
import {DocumentNode} from 'graphql'
import {graphql} from 'react-apollo'
import {FieldConfig} from 'react-form-helper'
import {getValue} from 'react-form-helper/dist/src/helpers'
import compose from 'recompose/compose'
import withState from 'recompose/withState'
import {isArrayEqual, removeTypename, startsWith, trimArrayLeft, validationErrorHandler} from './helpers'

export type Properties = {
  update?: (ownProps: any) => (proxy: DataProxy, obj: any) => any
  saveName?: string
  mapVariables?: (object: any, name: string, ownProps: any) => {}
}

/**
 * Runs the given mutation and finds validation errors
 *
 *  Example:
 *
 * ```typescript
 * validatedMutation('user', gql`
 *   mutation createUser(
 *     $firstName: String!
 *     $lastName: String!
 *     $displayName: String!
 *     $email: String!
 *   ) {
 *     createUser(
 *       firstName: $firstName
 *       lastName: $lastName
 *       displayName: $displayName
 *       email: $email
 *     ) {
 *       id
 *       firstName
 *       lastName
 *       displayName
 *       email
 *     }
 *   }
 * `, {
 *   mapVariables(user) {
 *     return {...user, displayName: `${user.firstName}${user.lastName}`}
 *   },
 * }),
 * ```
 */
export function validatedMutation(
  name: string, query: DocumentNode,
  {update, saveName = 'save', mapVariables}: Properties
) {
  return compose(
    withState('validationError', 'setValidationError', null),
    graphql(query, {
      props: ({mutate, ownProps: {onSave, onError, onValidationError, setValidationError}, ownProps}) => ({
        [saveName]: object => {
          object = removeTypename(object)

          return mutate({
            variables: mapVariables ? mapVariables(object, name, ownProps) : {[name]: object},
            update: update && update(ownProps),
          })
            .then(data => onSave ? onSave(data, ownProps) : data)
            .catch(error => {
              if (error && error.graphQLErrors) {
                const validationError = validationErrorHandler(object, setValidationError, name)(error)
                if (onValidationError) onValidationError(validationError, ownProps)
              }
              else if (onError) onError(error, ownProps)
              else throw error
            })
        },
      }),
    })
  )
}

export type Options = {
  skipPath?: number
}

export function mapValidationErrors(validationError: {errors: Array<any>}, updatedObject: any, fields: Array<FieldConfig>, {skipPath}: Options = {skipPath}) {
  if (validationError && validationError.errors) {
    return fields.map(field => {
      if (!field.path) return
      const serverError = validationError.errors.find(e =>
        (e.field && e.field === field.field) ||
        (e.path && isArrayEqual(trimArrayLeft(e.path, skipPath), field.path))
      )

      const value = getValue(field.path, updatedObject)

      if (serverError && serverError.value === value) {
        return {
          ...field,
          validationError: serverError.type,
        }
      }

      const partialErrors = validationError.errors.filter(e =>
        e.path && startsWith(trimArrayLeft(e.path, skipPath), field.path)
      )

      if (partialErrors.length) {
        return {
          ...field,
          partialError: {
            errors: partialErrors.map(error => ({...error, path: trimArrayLeft(error.path, field.path.length)}))
          },
        }
      }

      return field
    })
  }
  return fields
}
