import { CLIResponseType } from '../models/cli'

export const generateDefaultError = (username = 'human') => ({
  content: [
    `> 😭 Sorry ${username}.  `,
    '> We suck at the Internet...  ',
    '> Something went wrong.  '
  ],
  type: CLIResponseType.Error
})
