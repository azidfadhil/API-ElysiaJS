import { serializeBigInt } from "./serializer"

type PaginationType = {
  total_data: number
  total_page: number
  per_page: number
  page: number
}

type ResponseType = {
  error?: number | null
  message: string
  pagination?: PaginationType | null
  data?: any
}

export function response({
  error = null,
  message,
  pagination = null,
  data = null
}: ResponseType) {

  return serializeBigInt({
    error,
    message,
    pagination,
    data
  })

}