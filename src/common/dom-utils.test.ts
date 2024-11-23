import { vi, beforeEach, afterEach, describe, test, expect } from 'vitest'
import {
  extractItems,
  hasCompletedTodos,
  parseHtmlToNoteContent,
} from './dom-utils'

describe('DOM: utils', () => {
  describe('parseHtmlToNoteContent', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    test('should extract title and text content from html', () => {
      const htmlContent = `<h1>Some title</h1> 
      <p>Some text content</p>`
      const result = parseHtmlToNoteContent(htmlContent)
      expect(result).toMatchInlineSnapshot(`
        {
          "textContent": "Some title 
              Some text content",
          "title": "Some title",
        }
      `)
    })

    test('should return with default title and an updated html content', () => {
      const date = new Date(2024, 9, 1)
      vi.setSystemTime(date)
      const htmlContent = '<h1></h1><span> some content without title</span>'
      const result = parseHtmlToNoteContent(htmlContent)
      expect(result).toEqual({
        title: 'Untitled note - Oct 1',
        textContent: 'Untitled note - Oct 1 some content without title',
        htmlContent:
          '<h1>Untitled note - Oct 1</h1><span> some content without title</span>',
      })
    })
  })

  describe('hasCompletedTodos', () => {
    test('should return true if there are checked todos', () => {
      const htmlContent = `
      <input type="checkbox" checked/>
      <input type="checkbox"/>
      `
      expect(hasCompletedTodos(htmlContent)).toBe(true)
    })

    test('should return false if there are no checked todos', () => {
      const htmlContent = `
      <input type="checkbox"/>
      <input type="checkbox"/>
      `
      expect(hasCompletedTodos(htmlContent)).toBe(false)
    })
  })

  describe('extractItems', () => {
    test('should extract checked and unchecked items from the html content keeping the title', () => {
      const htmlContent = `
      <h1>Some title</h1>
      <ul data-type="taskList">
        <li data-type="taskItem">
          <input type="checkbox" checked/>
        </li>
        <li data-type="taskItem">
          <input type="checkbox"/>
        </li>
      </ul>
      `
      const result = extractItems(htmlContent)
      expect(result.checkedHtmlContent).toMatchInlineSnapshot(`
        "<h1>Some title - 1</h1><ul data-type="taskList"><li data-type="taskItem">
                  <input type="checkbox" checked="">
                </li></ul>"
      `)
      expect(result.uncheckedHtmlContent).toMatchInlineSnapshot(`
        "<h1>Some title</h1><ul data-type="taskList"><li data-type="taskItem" data-carried-over-count="1">
                  <input type="checkbox">
                </li></ul>"
      `)
    })

    test('should add +1 to the existing completed sub notes to the title of checked items', () => {
      const htmlContent = `
        <h1>Some title</h1>
        <ul data-type="taskList">
            <li data-type="taskItem">
            <input type="checkbox" checked/>
            </li>
            <li data-type="taskItem">
            <input type="checkbox"/>
            </li>
        </ul>
        `
      const result = extractItems(htmlContent, 3)
      expect(result.checkedHtmlContent).toMatchInlineSnapshot(`
        "<h1>Some title - 4</h1><ul data-type="taskList"><li data-type="taskItem">
                    <input type="checkbox" checked="">
                    </li></ul>"
      `)
      expect(result.uncheckedHtmlContent).toMatchInlineSnapshot(`
        "<h1>Some title</h1><ul data-type="taskList"><li data-type="taskItem" data-carried-over-count="1">
                    <input type="checkbox">
                    </li></ul>"
      `)
    })

    test('should update carry over count for unchecked items', () => {
      const htmlContent = `
            <h1>Some title</h1>
            <ul data-type="taskList">
                <li data-type="taskItem">
                <input type="checkbox" checked/>
                </li>
                <li data-type="taskItem" data-carried-over-count="2">
                <input type="checkbox"/>
                </li>
            </ul>
            `
      const result = extractItems(htmlContent)
      expect(result.uncheckedHtmlContent).toMatchInlineSnapshot(`
        "<h1>Some title</h1><ul data-type="taskList"><li data-type="taskItem" data-carried-over-count="3">
                        <input type="checkbox">
                        </li></ul>"
      `)
    })

    test('should handle nested lists', () => {
      const htmlContent = `
                <h1>Some title</h1>
                <ul data-type="taskList">
                    <li data-type="taskItem">
                    <input type="checkbox" checked/>
                    </li>
                    <li data-type="taskItem">
                    <input type="checkbox"/>
                    <ul data-type="taskList">
                        <li data-type="taskItem">
                        <input type="checkbox"/>
                        </li>
                        <li data-type="taskItem">
                        <input type="checkbox" checked/>
                        </li>
                    </ul>
                    </li>
                </ul>
                `
      const result = extractItems(htmlContent)
      expect(result.checkedHtmlContent).toMatchInlineSnapshot(`
        "<h1>Some title - 1</h1><ul data-type="taskList"><li data-type="taskItem">
                            <input type="checkbox" checked="">
                            </li><li data-type="taskItem">
                            <input type="checkbox">
                            <ul data-type="taskList"><li data-type="taskItem">
                                <input type="checkbox" checked="">
                                </li></ul>
                            </li></ul>"
      `)
      expect(result.uncheckedHtmlContent).toMatchInlineSnapshot(`
        "<h1>Some title</h1><ul data-type="taskList"><li data-type="taskItem" data-carried-over-count="1">
                            <input type="checkbox">
                            <ul data-type="taskList"><li data-type="taskItem" data-carried-over-count="1">
                                <input type="checkbox">
                                </li></ul>
                            </li></ul>"
      `)
    })
  })
})
