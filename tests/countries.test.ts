import { describe, expect, it } from 'vitest'

import { allCountries, countryNames, travelCountries } from '../data/countries'

describe('country data', () => {
  it('contains all 195 internationally recognized sovereign states', () => {
    expect(countryNames).toHaveLength(195)
    expect(new Set(countryNames).size).toBe(195)
  })

  it('exposes the complete list to travel and booking forms', () => {
    expect(travelCountries).toEqual(countryNames)
    expect(allCountries.map(({ name }) => name)).toEqual(countryNames)
  })

  it('is alphabetized for predictable country pickers', () => {
    expect(countryNames).toEqual([...countryNames].sort((a, b) => a.localeCompare(b)))
  })
})
