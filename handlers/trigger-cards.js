'use strict'

const convertToMinutes = require('../lib/convert-to-minutes')
const getEventsToTrigger = require('../lib/get-events-to-trigger')
const getTokenDuration = require('../lib/get-token-duration')
const getTokenValue = require('../lib/get-token-value')
const capitalize = require('../lib/capitalize')
const { updateHitCount } = require('../lib/hit-count')
const { isEventOngoing } = require('./conditions')

const getErrorMessage = (app, error) => {
  if (error instanceof Error) return { message: error.message, stack: error.stack }
  if (typeof error === 'string') return { message: error }
  if (error.data && typeof error.data === 'string') {
    if (error.stack) return { message: error.data, stack: error.stack }
    return { message: error.data }
  }
  if (error.data && error.data.message && typeof error.data.message === 'string') {
    if (error.data.stack) return { message: error.data.message, stack: error.data.stack }
    return { message: error.data.message }
  }
  if (error.message && typeof error.message === 'string') {
    if (error.stack) return { message: error.message, stack: error.stack }
    return { message: error.message }
  }

  app.log('getErrorMessage: Error is of type', typeof error)
  return { message: error }
}

/**
 * @typedef {Object} TriggerSynchroniztionErrorOptions
 * @prop {Homey.App} app App class inited by Homey
 * @prop {String} calendar Calendar name with synchronization error
 * @prop {any} error Synchronization error
 * @prop {Object} [event] Event error originated from (if any)
 */

/**
 * @param {TriggerSynchroniztionErrorOptions} options
 */
module.exports.triggerSynchronizationError = async (options) => {
  const { app, calendar, error, event } = options
  try {
    const { message, stack } = getErrorMessage(app, error)
    app.log(`triggerSynchronizationError: Triggering on '${calendar}'${event ? ` for event '${event.summary || ''}' (${event.uid})` : ' on loading'}`, '-', message, '-', stack || '')
    const tokens = {
      calendar_name: calendar,
      calendar_error: message,
      on_calendar_load: event === undefined || event === null,
      on_event_load: event !== undefined && event !== null && typeof event === 'object' && Object.keys(event).length > 0,
      event_name: event ? event.summary || '' : '',
      event_uid: event ? event.uid || '' : ''
    }
    app.log('triggerSynchronizationError: Triggering \'synchronization_error\' with tokens :', tokens)
    const triggerCard = app.homey.flow.getTriggerCard('synchronization_error')
    await triggerCard.trigger(tokens)
    app.log('triggerSynchronizationError: Triggered \'synchronization_error\'')
    updateHitCount(app, 'synchronization_error')
  } catch (err) {
    app.logError('triggerSynchronizationError: Failed to trigger "synchronization_error" :', err)
  }
}

/**
 * @typedef {Object} TriggerChangedCalendarsOptions
 * @prop {Homey.App} app App class inited by Homey
 * @prop {Array} calendars Currently loaded calendars
 */

/**
 * @param {TriggerChangedCalendarsOptions} options
 */
module.exports.triggerChangedCalendars = async (options) => {
  const { app, calendars } = options
  try {
    for await (const calendar of calendars) {
      for await (const event of calendar.events) {
        const tokens = {
          event_name: getTokenValue(event.summary),
          event_calendar_name: calendar.name,
          event_type: event.changed[0].type,
          event_prev_value: getTokenValue(event.changed[0].previousValue),
          event_new_value: getTokenValue(event.changed[0].newValue),
          event_was_ongoing: isEventOngoing(app, app.getTimezone(), [event.oldEvent], 'changedEvent'),
          event_ongoing: isEventOngoing(app, app.getTimezone(), [event], 'changedEvent')
        }

        const changedCalendarTriggerCards = [
          {
            id: 'event_changed',
            useState: false
          },
          {
            id: 'event_changed_calendar',
            useState: true
          }
        ]
        for await (const changedCalendarTriggerCard of changedCalendarTriggerCards) {
          const state = { calendarName: calendar.name }
          try {
            if (!changedCalendarTriggerCard.useState) {
              await app.homey.flow.getTriggerCard(changedCalendarTriggerCard.id).trigger(tokens)
              app.log(`Triggered ${changedCalendarTriggerCard.id} on '${event.uid}'`)
              updateHitCount(app, changedCalendarTriggerCard.id)
            } else {
              const triggerCard = app.homey.flow.getTriggerCard(changedCalendarTriggerCard.id)
              const triggerArgumentValues = await triggerCard.getArgumentValues()
              if (!Array.isArray(triggerArgumentValues)) {
                throw new Error('Found no argument values for')
              } else if (triggerArgumentValues.length === 0) {
                continue
              }

              for await (const triggerArgumentValue of triggerArgumentValues) {
                if (triggerArgumentValue === null || triggerArgumentValue === undefined) {
                  app.warn(`triggerChangedCalendars: '${changedCalendarTriggerCard.id}' probably has a flow which is misconfigured or disabled:`, triggerArgumentValue)
                  continue
                }

                if (triggerArgumentValue.calendar !== undefined && triggerArgumentValue.calendar.name !== undefined && triggerArgumentValue.calendar.name === state.calendarName) {
                  await triggerCard.trigger(tokens, state)
                  app.log(`Triggered '${changedCalendarTriggerCard.id}' on '${event.uid}' with state:`, state)
                  updateHitCount(app, changedCalendarTriggerCard.id, { calendar: triggerArgumentValue.calendar.name })
                }
              }
            }
          } catch (error) {
            if (changedCalendarTriggerCard.useState) {
              app.logError(`triggerChangedCalendars: '${changedCalendarTriggerCard.id}' failed to trigger on '${event.uid}' with state`, state, ':', error)
            } else {
              app.logError(`triggerChangedCalendars: '${changedCalendarTriggerCard.id}' failed to trigger on '${event.uid}' :`, error)
            }

            this.triggerSynchronizationError({ app, calendar: calendar.name, error, event })
          }
        }
      }
    }
  } catch (err) {
    app.logError('triggerChangedCalendars: Failed to trigger changed calendar events :', err)
  }
}

/**
 * @typedef {Object} TriggerEventsOptions
 * @prop {String} timezone The timezone to use on events (IANA)
 * @prop {Homey.App} app App class inited by Homey
 * @prop {Object} [event] One single event to trigger
 */

/**
 * @param {TriggerEventsOptions} options
 */
module.exports.triggerEvents = async (options) => {
  const { timezone, app, event } = options
  const events = event ? [event] : getEventsToTrigger({ timezone, app, calendars: app.variableMgmt.calendars })

  for await (const eventTrigger of events) {
    const { calendarName, event, triggerId, state } = eventTrigger
    try {
      // add tokens for event
      const eventDuration = getTokenDuration(app, event)
      const tokens = {
        event_name: getTokenValue(event.summary),
        event_description: getTokenValue(event.description),
        event_location: getTokenValue(event.location),
        event_duration_readable: eventDuration.duration,
        event_duration: eventDuration.durationMinutes,
        event_calendar_name: calendarName,
        event_status: event.freebusy,
        event_meeting_url: event.meetingUrl
      }

      if (['event_added', 'event_added_calendar'].includes(triggerId)) {
        tokens.event_start_date = event.start.format(app.variableMgmt.dateTimeFormat.long)
        tokens.event_start_time = event.start.format(app.variableMgmt.dateTimeFormat.time)
        tokens.event_end_date = event.end.format(app.variableMgmt.dateTimeFormat.long)
        tokens.event_end_time = event.end.format(app.variableMgmt.dateTimeFormat.time)
        tokens.event_weekday_readable = capitalize(event.start.format('dddd'))
        tokens.event_month_readable = capitalize(event.start.format('MMMM'))
        tokens.event_date_of_month = event.start.get('date')
      }

      // trigger flow card
      if (state === undefined) {
        try {
          await app.homey.flow.getTriggerCard(triggerId).trigger(tokens)
          app.log(`triggerEvents: Triggered '${triggerId}' without state on '${event.uid}'`)
          updateHitCount(app, triggerId)
        } catch (error) {
          app.logError(`triggerEvents: '${triggerId}' without state failed to trigger on '${event.uid}':`, error)

          this.triggerSynchronizationError({ app, calendar: calendarName, error, event })
        }
      } else {
        try {
          const triggerCard = app.homey.flow.getTriggerCard(triggerId)
          const triggerArgumentValues = await triggerCard.getArgumentValues()
          if (!Array.isArray(triggerArgumentValues)) {
            throw new Error('Found no argument values')
          } else if (triggerArgumentValues.length === 0) {
            continue
          }

          for await (const triggerArgumentValue of triggerArgumentValues) {
            if (triggerArgumentValue === null || triggerArgumentValue === undefined) {
              app.warn(`triggerEvents: '${triggerId}' probably has a flow which is misconfigured or disabled:`, triggerArgumentValue)
              continue
            }

            if (state.calendarName !== undefined) {
              if (triggerArgumentValue.calendar !== undefined && triggerArgumentValue.calendar.name !== undefined && triggerArgumentValue.calendar.name === state.calendarName) {
                await triggerCard.trigger(tokens, state)
                app.log(`triggerEvents: Triggered '${triggerId}' on '${event.uid}' with state:`, state)
                updateHitCount(app, triggerId, { calendar: triggerArgumentValue.calendar.name })
              }
            } else if (state.when !== undefined) {
              const minutes = convertToMinutes(triggerArgumentValue.when, triggerArgumentValue.type)
              if (minutes === state.when) {
                await triggerCard.trigger(tokens, state)
                app.log(`triggerEvents: Triggered '${triggerId}' on '${event.uid}' with state:`, state)
                updateHitCount(app, triggerId, triggerArgumentValue)
              }
            } else app.warn('triggerEvents: Unknown state:', state)
          }
        } catch (error) {
          app.logError(`triggerEvents: '${triggerId}' with state`, state, 'failed to trigger:', error)

          this.triggerSynchronizationError({ app, calendar: calendarName, error, event })
        }
      }
    } catch (err) {
      app.logError('triggerEvents: Failed to trigger event', event.uid, 'from', calendarName, ':', err)
    }
  }
}
