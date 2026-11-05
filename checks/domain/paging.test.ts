// Ported from Armikom.Open.Vue tests/unit/utils/pagination.test.ts; the implementation now lives in this package.
import { describe, it, expect, vi } from './_expect.js'
import { drainPages } from '../../src/core/paging.js'

/**
 * The drainPages utility fetches all pages of a paginated endpoint.
 *
 * This is the test that was missing everywhere: "what happens when the catalogue
 * has more items than one page?" Every picker and catalogue that held data in
 * memory was silently truncated at the first page until this utility replaced
 * the single-page fetches.
 */

describe('drainPages', () => {
  it('collects all items across multiple pages', async () => {
    const fetchPage = vi.fn()
      .mockResolvedValueOnce({ items: [{ id: '1' }, { id: '2' }], hasMore: true })
      .mockResolvedValueOnce({ items: [{ id: '3' }, { id: '4' }], hasMore: true })
      .mockResolvedValueOnce({ items: [{ id: '5' }], hasMore: false })

    const result = await drainPages(fetchPage)

    expect(result).toHaveLength(5)
    expect(result.map((r: any) => r.id)).toEqual(['1', '2', '3', '4', '5'])
    expect(fetchPage).toHaveBeenCalledTimes(3)
    expect(fetchPage).toHaveBeenCalledWith(1)
    expect(fetchPage).toHaveBeenCalledWith(2)
    expect(fetchPage).toHaveBeenCalledWith(3)
  })

  it('returns all items from a single page when hasMore is false', async () => {
    const fetchPage = vi.fn()
      .mockResolvedValueOnce({ items: [{ id: '1' }], hasMore: false })

    const result = await drainPages(fetchPage)

    expect(result).toHaveLength(1)
    expect(fetchPage).toHaveBeenCalledTimes(1)
  })

  it('returns an empty array when the first page has no items', async () => {
    const fetchPage = vi.fn()
      .mockResolvedValueOnce({ items: [], hasMore: false })

    const result = await drainPages(fetchPage)

    expect(result).toEqual([])
    expect(fetchPage).toHaveBeenCalledTimes(1)
  })

  it('handles null items gracefully', async () => {
    const fetchPage = vi.fn()
      .mockResolvedValueOnce({ items: null, hasMore: false })

    const result = await drainPages(fetchPage)

    expect(result).toEqual([])
  })

  it('handles undefined items gracefully', async () => {
    const fetchPage = vi.fn()
      .mockResolvedValueOnce({ hasMore: false })

    const result = await drainPages(fetchPage)

    expect(result).toEqual([])
  })

  it('stops at the maxPages guard to prevent infinite loops', async () => {
    // A server that always reports hasMore must not hang the tab.
    const fetchPage = vi.fn()
      .mockResolvedValue({ items: [{ id: 'x' }], hasMore: true })

    const result = await drainPages(fetchPage, 3)

    expect(result).toHaveLength(3)
    expect(fetchPage).toHaveBeenCalledTimes(3)
  })

  it('defaults the maxPages guard to 20', async () => {
    const fetchPage = vi.fn()
      .mockResolvedValue({ items: [{ id: 'x' }], hasMore: true })

    const result = await drainPages(fetchPage)

    expect(result).toHaveLength(20)
    expect(fetchPage).toHaveBeenCalledTimes(20)
  })

  it('propagates errors from the fetch function', async () => {
    const fetchPage = vi.fn()
      .mockResolvedValueOnce({ items: [{ id: '1' }], hasMore: true })
      .mockRejectedValueOnce(new Error('network failure'))

    await expect(drainPages(fetchPage)).rejects.toThrow('network failure')
  })
})
