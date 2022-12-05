/** Basic function that takes an environment variable STATUS and returns 200 if it's OK */
export const handler = async (event, context, callback) => {
  const status = process.env.STATUS ?? 'OK'
  const statusCode = status === 'OK' ? 200 : 500
  return {
    statusCode: statusCode,
    body: JSON.stringify({
      status: status,
      region: process.env.AWS_REGION,
    }),
  }
}
