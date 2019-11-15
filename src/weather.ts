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
        "That doesn't look like a zip code...  ",
        'Usage: weather [5-digit zip]  ',
        'ex: weather 92672  '
      ],
      type: CLIResponseType.Standard
    }
  }

  try {
    const res = await fetch(
      `http://api.weatherstack.com/current?access_key=${config.weatherAPIKey}&query=${zip}&units=f`
    )

    const body = await res.json()

    logger.debug('Got a weather response:', JSON.stringify(body))
    if (res.status < 400) {
      const { location, current } = body
      const { wind_speed, wind_dir, humidity } = current
      const content = [
        `${location.name} | ${location.lat} : ${location.lon} | ${location.localtime}  `,
        `NOW: ${current.weather_descriptions.join(', ')} ${
          current.temperature
        } F | clouds: ${current.cloudcover} | Feels like: ${
          current.feelslike
        } F `,
        `WIND: ${wind_speed}mph ${wind_dir} | HUM: ${humidity}% `
      ]
      return { content, type: CLIResponseType.Standard }
    }
  } catch (err) {
    logger.error(err)
  }
  return generateDefaultError()
}
