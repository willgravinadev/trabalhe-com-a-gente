import { type URL } from 'node:url'

import { type GithubRepositoryOwner } from '@models/github/repository-owner.model'
import { type DateTime } from '@value-objects/date-time.value-object'

export type GithubRepository = {
  externalID: string
  name: string
  fullName: string
  externalURL: URL
  createdAt: DateTime
  starsCount: number
  forksCount: number
  owner: GithubRepositoryOwner
}
