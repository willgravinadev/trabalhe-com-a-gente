import { type URL } from 'node:url'

export type GithubRepositoryOwner = {
  externalID: string
  username: string
  type: string
  externalAvatarURL: URL
  externalProfileURL: URL
}
