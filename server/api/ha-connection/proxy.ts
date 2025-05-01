import { defineEventHandler, readBody, createError } from 'h3'
import { getConnectionById } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Get data from request body
    const body = await readBody(event)
    const { endpoint = '', connectionId } = body
    
    if (!connectionId) {
      throw createError({
        statusCode: 400,
        message: 'Missing connectionId'
      })
    }

    // Fetch connection details from database
    const connection = await getConnectionById(connectionId)
    
    if (!connection) {
      throw createError({
        statusCode: 404,
        message: 'Connection not found'
      })
    }

    const { url, token } = connection

    // Construct the Home Assistant URL
    let haUrl = url
    if (!haUrl.endsWith('/')) {
      haUrl += '/'
    }
    haUrl += `api/${endpoint}`

    // Make the request to Home Assistant
    const response = await fetch(haUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        message: `Home Assistant API error: ${response.statusText}`
      })
    }

    // Return the response data
    return await response.json()
  } catch (error) {
    console.error('Home Assistant proxy error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
})