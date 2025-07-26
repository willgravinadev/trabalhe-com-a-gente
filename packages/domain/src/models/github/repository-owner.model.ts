import { type URL } from 'node:url'

export type GithubRepositoryOwner = {
  externalID: string
  username: string
  type: 'user' | 'organization'
  externalAvatarURL: URL
  externalProfileURL: URL
}
