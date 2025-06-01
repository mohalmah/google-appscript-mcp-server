import { toolPaths } from "../tools/paths.js";
import { logger, withLogging } from "./logger.js";

/**
 * Discovers and loads available tools from the tools directory
 * @returns {Promise<Array>} Array of tool objects
 */
export async function discoverTools() {
  logger.info('DISCOVERY', `Starting tool discovery for ${toolPaths.length} tool paths`);
  
  const toolPromises = toolPaths.map(async (file) => {
    try {
      logger.debug('DISCOVERY', `Loading tool from: ${file}`);
      const module = await import(`../tools/${file}`);
      
      if (!module.apiTool) {
        logger.warn('DISCOVERY', `Tool file missing apiTool export: ${file}`);
        return null;
      }

      const toolName = module.apiTool.definition?.function?.name;
      if (!toolName) {
        logger.warn('DISCOVERY', `Tool missing function name: ${file}`);
        return null;
      }

      // Wrap the original function with logging
      const originalFunction = module.apiTool.function;
      const wrappedFunction = withLogging(toolName, originalFunction);

      logger.debug('DISCOVERY', `Successfully loaded tool: ${toolName}`, {
        file,
        toolName,
        description: module.apiTool.definition?.function?.description
      });

      return {
        ...module.apiTool,
        function: wrappedFunction,
        path: file,
      };
    } catch (error) {
      logger.error('DISCOVERY', `Failed to load tool: ${file}`, {
        file,
        error: {
          message: error.message,
          stack: error.stack
        }
      });
      return null;
    }
  });
  
  const tools = (await Promise.all(toolPromises)).filter(Boolean);
  
  logger.info('DISCOVERY', `Tool discovery completed`, {
    totalPaths: toolPaths.length,
    successfullyLoaded: tools.length,
    failed: toolPaths.length - tools.length,
    toolNames: tools.map(t => t.definition?.function?.name).filter(Boolean)
  });
  
  return tools;
}
