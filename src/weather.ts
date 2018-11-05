import fetch from 'node-fetch'
import { config } from './config'
import { logger } from './logger'
import { CLIResponseType } from './models/cli'
import { generateDefaultError } from './responseUtils/generateDefaultError'

export async function getWeather(zip: string) {
  try {
    const res = await fetch(
      `https://api.apixu.com/v1/forecast.json?key=${
        config.weatherAPIKey
      }&q=${zip}`
    )

    const body = await res.json()

    logger.info(JSON.stringify(body))
    const { location, current, forecast } = body
    const { day, astro } = forecast.forecastday[0]
    const content = [
      `${location.name} | ${location.lat} : ${location.lon} | ${
        location.localtime
      }  `,
      `NOW: ${current.temp_f} F | clouds: ${current.cloud} | Feels like: ${
        current.feelslike_f
      } F `,
      `TMRW: l ${day.mintemp_f} F | h: ${day.maxtemp_f} F | SR: ${
        astro.sunrise
      } | SS: ${astro.sunset}  `
    ]
    return { content, type: CLIResponseType.Standard }
  } catch (err) {
    logger.error(err)
    return generateDefaultError()
  }
}
