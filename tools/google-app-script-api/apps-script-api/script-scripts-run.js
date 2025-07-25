import { getAuthHeaders } from '../../../lib/oauth-helper.js';
import { logger } from '../../../lib/logger.js';

/**
 * Function to run a Google Apps Script.
 *
 * @param {Object} args - Arguments for the script execution.
 * @param {string} args.scriptId - The ID of the script to run.
 * @param {string} [args.fields] - Selector specifying which fields to include in a partial response.
 * @param {string} [args.alt='json'] - Data format for response.
 * @param {string} [args.key] - API key for the project.
 * @param {string} [args.access_token] - OAuth access token.
 * @param {string} [args.oauth_token] - OAuth 2.0 token for the current user.
 * @param {string} [args.quotaUser] - Available to use for quota purposes for server-side applications.
 * @param {boolean} [args.prettyPrint=true] - Returns response with indentations and line breaks.
 * @returns {Promise<Object>} - The result of the script execution.
 */
const executeFunction = async ({ scriptId, fields, alt = 'json', key, access_token, oauth_token, quotaUser, prettyPrint = true }) => {
  const baseUrl = 'https://script.googleapis.com';
  const url = new URL(`${baseUrl}/v1/scripts/${scriptId}:run`);
  
  // Append query parameters to the URL
  const params = new URLSearchParams({
    fields,
    alt,
    key,
    access_token,
    oauth_token,
    quotaUser,
    prettyPrint: prettyPrint.toString(),
    '$.xgafv': '1',
    upload_protocol: 'raw',
    uploadType: 'raw'
  });
  
  url.search = params.toString();

  try {
    // Get OAuth headers
    const headers = await getAuthHeaders();
    headers['Content-Type'] = 'application/json';
    // Perform the fetch request
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers
    });

    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData);
    }

    // Parse and return the response data
    const data = await response.json();
    return data;
  } catch (error) {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      scriptId,
      timestamp: new Date().toISOString(),
      errorType: error.name || 'Unknown'
    };

    logger.error('SCRIPT_RUN', 'Error running the script', errorDetails);
    
    console.error('❌ Error running the script:', errorDetails);
    
    // Return detailed error information for debugging
    return { 
      error: true,
      message: error.message,
      details: errorDetails,
      rawError: {
        name: error.name,
        stack: error.stack
      }
    };
  }
};

/**
 * Tool configuration for running Google Apps Script.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'script_run',
      description: 'Run a Google Apps Script.',
      parameters: {
        type: 'object',
        properties: {
          scriptId: {
            type: 'string',
            description: 'The ID of the script to run.'
          },
          fields: {
            type: 'string',
            description: 'Selector specifying which fields to include in a partial response.'
          },
          alt: {
            type: 'string',
            enum: ['json', 'xml'],
            description: 'Data format for response.'
          },
          key: {
            type: 'string',
            description: 'API key for the project.'
          },
          access_token: {
            type: 'string',
            description: 'OAuth access token.'
          },
          oauth_token: {
            type: 'string',
            description: 'OAuth 2.0 token for the current user.'
          },
          quotaUser: {
            type: 'string',
            description: 'Available to use for quota purposes for server-side applications.'
          },
          prettyPrint: {
            type: 'boolean',
            description: 'Returns response with indentations and line breaks.'
          }
        },
        required: ['scriptId']
      }
    }
  }
};

export { apiTool };