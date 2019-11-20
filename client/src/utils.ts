import * as yup from "yup"

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export type SchemaValue<S extends yup.Schema<any>> = S extends yup.Schema<
  infer V
>
  ? V
  : never
