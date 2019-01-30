var https = require('https')

const foo = async (event, context) => {
  const TWILIO_ACCOUNT = 'ACcef2b56e64cd5a17c19acc111d0d15a2'
  const TWILIO_API_KEY = '511c099a0d792e1d79338955ffb9d365'
  const auth =
    'Basic ' +
    new Buffer(TWILIO_ACCOUNT + ':' + TWILIO_API_KEY).toString('base64')

  https.get('https://mosey.systems/api/cli/healthcheck', (res) => {
    console.log('got a response from undefined', res.statusCode)
    // if (res.statusCode === 200) {
    //     resolve();
    // } else {
    https.request(
      {
        hostname: `api.twilio.com`,
        port: 433,
        path: `/2010-04-01/Accounts/${TWILIO_ACCOUNT}/Messages.json`,
        headers: {
          Authorization: auth,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          From: '+12133080341',
          To: '+12133080341',
          Body: 'Undefined is down!!!'
        })
      },
      (response) => {
        console.log(`Not'fied of healthcheck failure`)
      }
    )
    console.log('requested...')
    // }
  })
}
foo()
