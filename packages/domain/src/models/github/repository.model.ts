import { type URL } from 'node:url'

import { type GithubRepositoryOwner } from '@models/github/repository-owner.model'
import { type DateTime } from '@value-objects/date-time.value-object'

export type GithubRepository = {
  createdAt: DateTime
  description: string
  externalID: string
  externalURL: URL
  forksCount: number
  fullName: string
  language: string | null
  name: string
  openIssuesCount: number
  owner: GithubRepositoryOwner
  sshURL: string
  starsCount: number
  topics: string[]
}
