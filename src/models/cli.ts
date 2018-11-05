export enum CLIResponseType {
  Error = 'ERROR',
  Info = 'INFO',
  Standard = 'STANDARD',
  StartPost = 'POST',
  Success = 'SUCCESS'
}

export interface CLIResponse {
  type: CLIResponseType
  content: string[]
}

export interface CLIRequestBody {
  input: string
  language: string
  referrer: string
  userAgent: string
}
