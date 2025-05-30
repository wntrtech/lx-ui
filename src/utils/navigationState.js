let intendedRoute = null;

export function trackNavigationState(to) {
  const notifyFlag = sessionStorage.getItem('version_update_notification');
  if (notifyFlag) return;
  intendedRoute = { name: to.name, params: to.params, query: to.query };
  sessionStorage.setItem('is_navigating', 'true');
  sessionStorage.setItem('intended_route', JSON.stringify(intendedRoute));
}

export function resetNavigationTracking() {
  intendedRoute = null;

  setTimeout(() => {
    sessionStorage.removeItem('is_navigating');
    sessionStorage.removeItem('intended_route');
    sessionStorage.removeItem('version_update_notification');
    sessionStorage.removeItem('version_reload_pending');
  }, 200);
}
