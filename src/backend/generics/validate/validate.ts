import Ajv, { JSONSchemaType } from 'ajv'
import ajvErrors from 'ajv-errors'
import addFormats from 'ajv-formats'
import betterAjvErrors from 'better-ajv-errors'

import { ExternalError } from '../error'

/**
 * General validation function. Accepts a body as a string, parses it into
 * JSON, and then validates the JSON against a known JSON schema. The JSON
 * schema is for a generic typescript type T, and the object of that type
 * is returned.
 *
 * @param body The raw string of a JSON object.
 * @param schema The JSON schema of a type T to validate against.
 * @returns The JSON object of type T validated against the schema.
 */
export function validate<T>(body: string, schema: JSONSchemaType<T>): T {
  const ajv = new Ajv({ allErrors: true })
  ajvErrors(ajv)
  addFormats(ajv)
  const validateSchema = ajv.compile(schema)

  let parsed: unknown

  try {
    parsed = JSON.parse(body)
  } catch (err) {
    console.error(err)
    if (err instanceof SyntaxError) {
      throw new ExternalError(400, 'Malformed body:\n' + err.toString())
    } else {
      throw new ExternalError(400, 'Malformed body:\n' + err)
    }
  }

  if (validateSchema(parsed)) {
    return parsed
  } else {
    // output is an array of formatted AJV errors.
    const output = betterAjvErrors(schema, parsed, validateSchema.errors!, {
      format: 'js',
    })
    // map it to a string for pretty printing.
    const errorMessages = output.map((e) => e.error)
    const uniqueErrorMessages = errorMessages.filter((elem, index, self) => {
      return index == self.indexOf(elem)
    })
    const errorMessage = uniqueErrorMessages.join('\n')

    throw new ExternalError(400, 'Malformed body:\n' + errorMessage)
  }
}
