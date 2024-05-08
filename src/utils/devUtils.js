/* eslint-disable no-console */

export function logInfo(message, environment) {
  switch (environment) {
    case 'development':
    case 'local':
      console.info(message);
      break;
    default:
      // At this point, nothing needs to be output to the console for non dev projects
      break;
  }
}
export function logError(message, environment) {
  switch (environment) {
    case 'development':
    case 'local':
      console.error(message);
      break;
    default:
      // At this point, nothing needs to be output to the console for non dev projects
      break;
  }
}
export function logWarn(message, environment) {
  switch (environment) {
    case 'development':
    case 'local':
      console.warn(message);
      break;
    default:
      // At this point, nothing needs to be output to the console for non dev projects
      break;
  }
}

export function log(message, environment, level) {
  switch (level) {
    case 'info':
      logInfo(message, environment);
      break;
    case 'error':
      logError(message, environment);
      break;
    case 'warn':
      logWarn(message, environment);
      break;
    default:
      break;
  }
}
