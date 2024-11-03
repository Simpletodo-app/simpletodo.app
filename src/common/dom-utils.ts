import * as cheerio from 'cheerio'

import { format } from 'date-fns'
import { UNTITLED_NOTE_TITLE } from './config'

/**
 * It parses the HTML content to extract the title and textContent
 * and sets the title to UNTITLED_NOTE_TITLE if it's empty and return
 * the html content with the updated title
 * @param htmlContent
 * @returns
 */
export const parseHtmlToNoteContent = (htmlContent: string) => {
  const $ = cheerio.load(htmlContent)
  const currentDate = format(new Date(), 'MMM d')
  const title = $('h1').text()
  const defaultTitle = `${UNTITLED_NOTE_TITLE} - ${currentDate}`

  if (!title) {
    $('h1').text(defaultTitle)
  }

  return {
    title: title || defaultTitle,
    textContent: $('body').text(),
    ...(!title && {
      htmlContent: $('body').html(),
    }),
  }
}

export const hasCompletedTodos = (htmlContent: string): boolean => {
  const $ = cheerio.load(htmlContent)
  return $('input[type=checkbox]:checked').length > 0
}

/**
 * Extracts the checked and unchecked items from the html content
 * into two separate html contents with the title
 * @param htmlContent
 * @returns
 */
export const extractItems = (htmlContent: string) => {
  const $ = cheerio.load(htmlContent)

  const processList = (
    list: cheerio.Cheerio<cheerio.Element>,
    isChecked: boolean
  ) => {
    const newList = $('<ul data-type="taskList"></ul>')
    $(list)
      .children('li[data-type="taskItem"]')
      .each((index, element) => {
        const itemIsChecked = $(element)
          .find('input[type="checkbox"]')
          .prop('checked') as unknown as boolean
        const sublist = $(element).find('ul[data-type="taskList"]')
        const uncheckedCount = parseInt(
          $(element).attr('data-carried-over-count') || '0',
          10
        )

        if (itemIsChecked === isChecked) {
          // Clone the element and process its sublists
          const newElement = $(element).clone()
          if (!isChecked) {
            newElement.attr('data-carried-over-count', `${uncheckedCount + 1}`)
          }
          newElement
            .find('ul[data-type="taskList"]')
            .replaceWith(processList(sublist, isChecked))
          newList.append(newElement)
        } else if (sublist.length > 0) {
          // Process the sublist to check for items that match the current checked state
          const processedSublist = processList(sublist, isChecked)
          if (processedSublist.children().length > 0) {
            const newElement = $(element).clone()
            newElement
              .find('ul[data-type="taskList"]')
              .replaceWith(processedSublist)
            if (!isChecked) {
              newElement.attr(
                'data-carried-over-count',
                `${uncheckedCount + 1}`
              )
            }
            newList.append(newElement)
          }
        }
      })
    return newList
  }

  const rootList = $('ul[data-type="taskList"]').first()
  const title = $('h1').first().clone()

  // the div is needed to wrap the content when calling
  // html() so that it returns the innerHTML
  const checkedHtmlContent = $('<div></div>')
    // we don't want to append the title for a sub note since it will be the same as the parent note
    .append(processList(rootList, true))
    .html()
  const uncheckedHtmlContent = $('<div></div>')
    .append(title)
    .append(processList(rootList, false))
    .html()

  return { checkedHtmlContent, uncheckedHtmlContent }
}
