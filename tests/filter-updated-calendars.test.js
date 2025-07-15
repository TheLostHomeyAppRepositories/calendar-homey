'use strict'

const constructedApp = require('./lib/construct-app')
const { moment } = require('../lib/moment-datetime')
const filterUpdatedCalendars = require('../lib/filter-updated-calendars')
const { triggers: { event_changed: { start, end, description, location, summary } }, settings: { datetime: { date: { default: long }, time: { default: time } } } } = require('../locales/en.json')

/**
 * @type {import('../types/AppTests.type').AppTests}
 */
const app = {
  ...constructedApp,
  homey: {
    __: (prop) => {
      if (prop.includes('start')) return start
      if (prop.includes('end')) return end
      if (prop.includes('description')) return description
      if (prop.includes('location')) return location
      if (prop.includes('summary')) return summary
      return ''
    }
  },
  variableMgmt: {
    dateTimeFormat: {
      long,
      short: 'MM/DD',
      time
    }
  }
}

const oldCalendars = {
  nothingChanged: [
    {
      name: 'nothingChanged',
      events: [
        {
          start: moment({ date: '2021-11-05T20:00:00.000Z' }),
          datetype: 'date-time',
          end: moment({ date: '2021-11-05T21:00:00.000Z' }),
          uid: 'F7177A32-DBD4-46A9-85C7-669749EA8841',
          description: 'Desc',
          location: '',
          summary: 'Nothing changed'
        }
      ]
    }
  ],
  startChanged: [
    {
      name: 'startChanged',
      events: [
        {
          start: moment({ date: '2021-11-05T20:00:00.000Z' }),
          datetype: 'date-time',
          end: moment({ date: '2021-11-05T21:00:00.000Z' }),
          uid: 'F7177A32-DBD4-46A9-85C7-669749EA8842',
          description: 'Desc',
          location: '',
          summary: 'Start changed'
        }
      ]
    }
  ],
  endChanged: [
    {
      name: 'endChanged',
      events: [
        {
          start: moment({ date: '2021-11-05T20:00:00.000Z' }),
          datetype: 'date-time',
          end: moment({ date: '2021-11-05T21:00:00.000Z' }),
          uid: 'F7177A32-DBD4-46A9-85C7-669749EA8843',
          description: 'Desc',
          location: '',
          summary: 'End changed'
        }
      ]
    }
  ],
  descriptionChanged: [
    {
      name: 'descriptionChanged',
      events: [
        {
          start: moment({ date: '2021-11-05T20:00:00.000Z' }),
          datetype: 'date-time',
          end: moment({ date: '2021-11-05T21:00:00.000Z' }),
          uid: 'F7177A32-DBD4-46A9-85C7-669749EA8844',
          description: 'Desc',
          location: '',
          summary: 'Description changed'
        }
      ]
    }
  ],
  locationChanged: [
    {
      name: 'locationChanged',
      events: [
        {
          start: moment({ date: '2021-11-05T20:00:00.000Z' }),
          datetype: 'date-time',
          end: moment({ date: '2021-11-05T21:00:00.000Z' }),
          uid: 'F7177A32-DBD4-46A9-85C7-669749EA8845',
          description: 'Desc',
          location: '',
          summary: 'Location changed'
        }
      ]
    }
  ],
  summaryChanged: [
    {
      name: 'summaryChanged',
      events: [
        {
          start: moment({ date: '2021-11-05T20:00:00.000Z' }),
          datetype: 'date-time',
          end: moment({ date: '2021-11-05T21:00:00.000Z' }),
          uid: 'F7177A32-DBD4-46A9-85C7-669749EA8846',
          description: 'Desc',
          location: '',
          summary: 'Summary changed'
        }
      ]
    }
  ],
  locationChangedToUndefined: [
    {
      name: 'locationChanged',
      events: [
        {
          start: moment({ date: '2021-11-05T20:00:00.000Z' }),
          datetype: 'date-time',
          end: moment({ date: '2021-11-05T21:00:00.000Z' }),
          uid: 'F7177A32-DBD4-46A9-85C7-669749EA8845',
          description: 'Desc',
          location: '',
          summary: 'Location changed'
        }
      ]
    }
  ],
  locationChangedFromUndefined: [
    {
      name: 'locationChanged',
      events: [
        {
          start: moment({ date: '2021-11-05T20:00:00.000Z' }),
          datetype: 'date-time',
          end: moment({ date: '2021-11-05T21:00:00.000Z' }),
          uid: 'F7177A32-DBD4-46A9-85C7-669749EA8845',
          description: 'Desc',
          location: undefined,
          summary: 'Location changed'
        }
      ]
    }
  ]
}

const newCalendars = {
  nothingChanged: [
    {
      name: 'nothingChanged',
      events: [
        {
          start: moment({ date: '2021-11-05T20:00:00.000Z' }),
          datetype: 'date-time',
          end: moment({ date: '2021-11-05T21:00:00.000Z' }),
          uid: 'F7177A32-DBD4-46A9-85C7-669749EA8841',
          description: 'Desc',
          location: '',
          summary: 'Nothing changed'
        }
      ]
    }
  ],
  startChanged: [
    {
      name: 'startChanged',
      events: [
        {
          start: moment({ date: '2021-11-05T19:00:00.000Z' }),
          datetype: 'date-time',
          end: moment({ date: '2021-11-05T21:00:00.000Z' }),
          uid: 'F7177A32-DBD4-46A9-85C7-669749EA8842',
          description: 'Desc',
          location: '',
          summary: 'Start changed'
        }
      ]
    }
  ],
  endChanged: [
    {
      name: 'endChanged',
      events: [
        {
          start: moment({ date: '2021-11-05T20:00:00.000Z' }),
          datetype: 'date-time',
          end: moment({ date: '2021-11-05T22:00:00.000Z' }),
          uid: 'F7177A32-DBD4-46A9-85C7-669749EA8843',
          description: 'Desc',
          location: '',
          summary: 'End changed'
        }
      ]
    }
  ],
  descriptionChanged: [
    {
      name: 'descriptionChanged',
      events: [
        {
          start: moment({ date: '2021-11-05T20:00:00.000Z' }),
          datetype: 'date-time',
          end: moment({ date: '2021-11-05T21:00:00.000Z' }),
          uid: 'F7177A32-DBD4-46A9-85C7-669749EA8844',
          description: '',
          location: '',
          summary: 'Description changed'
        }
      ]
    }
  ],
  locationChanged: [
    {
      name: 'locationChanged',
      events: [
        {
          start: moment({ date: '2021-11-05T20:00:00.000Z' }),
          datetype: 'date-time',
          end: moment({ date: '2021-11-05T21:00:00.000Z' }),
          uid: 'F7177A32-DBD4-46A9-85C7-669749EA8845',
          description: 'Desc',
          location: 'Loc, 9867 Station',
          summary: 'Location changed'
        }
      ]
    }
  ],
  summaryChanged: [
    {
      name: 'summaryChanged',
      events: [
        {
          start: moment({ date: '2021-11-05T20:00:00.000Z' }),
          datetype: 'date-time',
          end: moment({ date: '2021-11-05T21:00:00.000Z' }),
          uid: 'F7177A32-DBD4-46A9-85C7-669749EA8846',
          description: 'Desc',
          location: '',
          summary: 'Summary changed again'
        }
      ]
    }
  ],
  locationChangedToUndefined: [
    {
      name: 'locationChanged',
      events: [
        {
          start: moment({ date: '2021-11-05T20:00:00.000Z' }),
          datetype: 'date-time',
          end: moment({ date: '2021-11-05T21:00:00.000Z' }),
          uid: 'F7177A32-DBD4-46A9-85C7-669749EA8845',
          description: 'Desc',
          location: undefined,
          summary: 'Location changed'
        }
      ]
    }
  ],
  locationChangedFromUndefined: [
    {
      name: 'locationChanged',
      events: [
        {
          start: moment({ date: '2021-11-05T20:00:00.000Z' }),
          datetype: 'date-time',
          end: moment({ date: '2021-11-05T21:00:00.000Z' }),
          uid: 'F7177A32-DBD4-46A9-85C7-669749EA8845',
          description: 'Desc',
          location: '',
          summary: 'Location changed'
        }
      ]
    }
  ]
}

describe('Expect \'filterUpdatedCalendars\' to return', () => {
  test('An array', () => {
    const eventsChanged = filterUpdatedCalendars({ app, oldCalendars: oldCalendars.nothingChanged, newCalendars: newCalendars.nothingChanged })
    expect(Array.isArray(eventsChanged)).toBe(true)
  })

  test('Empty array when nothing\'s changed', () => {
    const eventsChanged = filterUpdatedCalendars({ app, oldCalendars: oldCalendars.nothingChanged, newCalendars: newCalendars.nothingChanged })
    expect(eventsChanged.length).toBe(0)
  })

  test('\'Start\' when start has changed', () => {
    const eventsChanged = filterUpdatedCalendars({ app, oldCalendars: oldCalendars.startChanged, newCalendars: newCalendars.startChanged })
    expect(eventsChanged.length).toBe(1)
    expect(eventsChanged[0].events.length).toBe(1)
    expect(eventsChanged[0].events[0].changed.length).toBe(1)
    expect(eventsChanged[0].events[0].changed[0].type).toBe(start)
  })

  test('\'End\' when end has changed', () => {
    const eventsChanged = filterUpdatedCalendars({ app, oldCalendars: oldCalendars.endChanged, newCalendars: newCalendars.endChanged })
    expect(eventsChanged.length).toBe(1)
    expect(eventsChanged[0].events.length).toBe(1)
    expect(eventsChanged[0].events[0].changed.length).toBe(1)
    expect(eventsChanged[0].events[0].changed[0].type).toBe(end)
  })

  test('\'Description\' when description has changed', () => {
    const eventsChanged = filterUpdatedCalendars({ app, oldCalendars: oldCalendars.descriptionChanged, newCalendars: newCalendars.descriptionChanged })
    expect(eventsChanged.length).toBe(1)
    expect(eventsChanged[0].events.length).toBe(1)
    expect(eventsChanged[0].events[0].changed.length).toBe(1)
    expect(eventsChanged[0].events[0].changed[0].type).toBe(description)
  })

  test('\'Location\' when location has changed', () => {
    const eventsChanged = filterUpdatedCalendars({ app, oldCalendars: oldCalendars.locationChanged, newCalendars: newCalendars.locationChanged })
    expect(eventsChanged.length).toBe(1)
    expect(eventsChanged[0].events.length).toBe(1)
    expect(eventsChanged[0].events[0].changed.length).toBe(1)
    expect(eventsChanged[0].events[0].changed[0].type).toBe(location)
  })

  test('\'Summary\' when summary has changed', () => {
    const eventsChanged = filterUpdatedCalendars({ app, oldCalendars: oldCalendars.summaryChanged, newCalendars: newCalendars.summaryChanged })
    expect(eventsChanged.length).toBe(1)
    expect(eventsChanged[0].events.length).toBe(1)
    expect(eventsChanged[0].events[0].changed.length).toBe(1)
    expect(eventsChanged[0].events[0].changed[0].type).toBe(summary)
  })

  test('Nothing when \'Location\' has changed from \'\' to undefined', () => {
    const eventsChanged = filterUpdatedCalendars({ app, oldCalendars: oldCalendars.locationChangedToUndefined, newCalendars: newCalendars.locationChangedToUndefined })
    expect(eventsChanged.length).toBe(0)
  })

  test('Nothing when \'Location\' has changed from undefined to \'\'', () => {
    const eventsChanged = filterUpdatedCalendars({ app, oldCalendars: oldCalendars.locationChangedFromUndefined, newCalendars: newCalendars.locationChangedFromUndefined })
    expect(eventsChanged.length).toBe(0)
  })
})
