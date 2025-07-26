import { InvalidItemsPerPageError } from '@errors/value-objects/pagination/invalid-items-per-page.error'
import { InvalidSelectedPageError } from '@errors/value-objects/pagination/invalid-selected-page.error'
import { InvalidTotalItemsError } from '@errors/value-objects/pagination/invalid-total-items.error'
import { type Either, failure, success } from '@github-search/utils'

export class Pagination {
  public readonly totalItems: number
  public readonly totalPages: number
  public readonly currentPage: number
  public readonly itemsPerPage: number
  public readonly hasNextPage: boolean
  public readonly hasPreviousPage: boolean

  constructor(parameters: {
    totalItems: number
    totalPages: number
    currentPage: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }) {
    this.totalItems = parameters.totalItems
    this.totalPages = parameters.totalPages
    this.currentPage = parameters.currentPage
    this.itemsPerPage = parameters.itemsPerPage
    this.hasNextPage = parameters.hasNextPage
    this.hasPreviousPage = parameters.hasPreviousPage
  }

  public static validateSelectedPage(selectedPage: number): Either<InvalidSelectedPageError, { selectedPageValidated: number }> {
    if (selectedPage < 1 || !Number.isInteger(selectedPage)) {
      return failure(new InvalidSelectedPageError({ selectedPage }))
    }
    return success({ selectedPageValidated: selectedPage })
  }

  public static validateItemsPerPage(itemsPerPage: number): Either<InvalidItemsPerPageError, { itemsPerPageValidated: number }> {
    if (itemsPerPage < 1 || !Number.isInteger(itemsPerPage)) {
      return failure(new InvalidItemsPerPageError({ itemsPerPage }))
    }
    return success({ itemsPerPageValidated: itemsPerPage })
  }

  public static validateTotalItems(totalItems: number): Either<InvalidTotalItemsError, { totalItemsValidated: number }> {
    if (totalItems < 0 || !Number.isInteger(totalItems)) {
      return failure(new InvalidTotalItemsError({ totalItems }))
    }
    return success({ totalItemsValidated: totalItems })
  }

  public static create(parameters: {
    totalItems: number
    selectedPage: number
    itemsPerPage: number
  }): Either<InvalidTotalItemsError | InvalidSelectedPageError | InvalidItemsPerPageError, { paginationCreated: Pagination }> {
    console.log(parameters)
    const resultValidateTotalItems = this.validateTotalItems(parameters.totalItems)
    if (resultValidateTotalItems.isFailure()) return failure(resultValidateTotalItems.value)
    const { totalItemsValidated } = resultValidateTotalItems.value

    const resultValidateSelectedPage = this.validateSelectedPage(parameters.selectedPage)
    if (resultValidateSelectedPage.isFailure()) return failure(resultValidateSelectedPage.value)
    const { selectedPageValidated } = resultValidateSelectedPage.value

    const resultValidateItemsPerPage = this.validateItemsPerPage(parameters.itemsPerPage)
    if (resultValidateItemsPerPage.isFailure()) return failure(resultValidateItemsPerPage.value)
    const { itemsPerPageValidated } = resultValidateItemsPerPage.value

    const totalPages = Math.ceil(totalItemsValidated / itemsPerPageValidated)
    const hasNextPage = selectedPageValidated < totalPages
    const hasPreviousPage = selectedPageValidated > 1

    return success({
      paginationCreated: new Pagination({
        currentPage: selectedPageValidated,
        hasNextPage,
        hasPreviousPage,
        itemsPerPage: itemsPerPageValidated,
        totalItems: totalItemsValidated,
        totalPages
      })
    })
  }
}
