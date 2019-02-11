import fetch from 'node-fetch'
import { config } from './config'
import { Logger } from './logger'
import { CLIResponse, CLIResponseType } from './models/cli'
import { generateDefaultError } from './responseUtils/generateDefaultError'

export async function getWeather(
  logger: Logger,
  zipString: string
): Promise<CLIResponse> {
  const zip = Number(zipString)

  if (Number.isNaN(zip) || zip < 10000 || zip > 99999) {
    return {
      content: [
        "That doesn't look like a zip code...",
        'Usage: weather [5-digit zip]',
        'ex: weather 92672 '
      ],
      type: CLIResponseType.Standard
    }
  }

  try {
    const res = await fetch(
      `https://api.apixu.com/v1/forecast.json?key=${
        config.weatherAPIKey
      }&q=${zip}`
    )

    const body = await res.json()

    logger.debug('Got a weather response:', res.status)
    if (res.status < 400) {
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
    }
  } catch (err) {
    logger.error(err)
  }
  return generateDefaultError()
}
