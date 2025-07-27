import {
  DateTime,
  GithubProviderMethods,
  type ISearchRepositoriesGithubProvider,
  type ISendLogErrorLoggerProvider,
  ProviderError,
  ProvidersNames,
  type SearchRepositoriesGithubProviderDTO
} from '@github-search/domain'
import { failure, success } from '@github-search/utils'
import axios from 'axios'
import { z } from 'zod'

export class APIGithubProvider implements ISearchRepositoriesGithubProvider {
  constructor(private readonly logger: ISendLogErrorLoggerProvider) {}

  public async searchRepositories(parameters: SearchRepositoriesGithubProviderDTO.Parameters): SearchRepositoriesGithubProviderDTO.Result {
    try {
      const response = await axios.get('https://api.github.com/search/repositories', {
        params: {
          q: parameters.searchQuery,
          page: parameters.selectedPage,
          per_page: parameters.itemsPerPage
        }
      })

      const responseSchema = z.object({
        total_count: z.number(),
        incomplete_results: z.boolean(),
        items: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
            full_name: z.string(),
            html_url: z.string(),
            created_at: z.string(),
            stargazers_count: z.number(),
            forks_count: z.number(),
            owner: z.object({
              id: z.number(),
              login: z.string(),
              type: z.string(),
              avatar_url: z.string(),
              html_url: z.string()
            })
          })
        )
      })

      const parsedResponse = responseSchema.parse(response.data)

      return success({
        repositories: parsedResponse.items.map((item) => ({
          externalID: item.id.toString(),
          name: item.name,
          fullName: item.full_name,
          externalURL: new URL(item.html_url),
          createdAt: new DateTime({
            date: new Date(item.created_at)
          }),
          starsCount: item.stargazers_count,
          forksCount: item.forks_count,
          owner: {
            externalID: item.owner.id.toString(),
            username: item.owner.login,
            type: item.owner.type as 'user' | 'organization',
            externalAvatarURL: new URL(item.owner.avatar_url),
            externalProfileURL: new URL(item.owner.html_url)
          }
        })),
        totalRepositoriesCount: parsedResponse.total_count
      })
    } catch (error) {
      const providerError = new ProviderError({
        error,
        provider: {
          method: GithubProviderMethods.SEARCH_REPOSITORIES,
          name: ProvidersNames.GITHUB
        }
      })
      this.logger.sendLogError({
        message: providerError.errorMessage,
        value: providerError
      })
      return failure(providerError)
    }
  }
}
