export function hasScope(scope, name) {
  return (
    (Array.isArray(scope) ? scope : [scope]).findIndex(
      (s) => s === name || s?.startsWith(`${name}:`)
    ) >= 0
  );
}

export function hasAnyScopeWithNamespace(scope, namespace) {
  return scope.findIndex((s) => s === namespace || s.startsWith(`${namespace}/`)) >= 0;
}

export function hasAnyScope(scope, ...names) {
  for (let i = 0; i < names.length; i += 1) {
    if (hasScope(scope, names[i])) {
      return true;
    }
  }
  return false;
}

export function hasScopeAtLeast(scope, name, level) {
  const names = [];
  switch (level) {
    case 'read':
      names.push(`${name}:read`);
    // falls through
    case 'write':
      names.push(`${name}:write`);
    // falls through
    case 'export':
      names.push(`${name}:export`);
    // falls through
    case 'delete':
      names.push(`${name}:delete`);
      break;
    default:
      break;
  }
  return hasAnyScope(scope, ...names);
}

export function hasScopeDelete(scope, name) {
  return hasScopeAtLeast(scope, name, 'delete');
}

export function hasScopeExport(scope, name) {
  return hasScopeAtLeast(scope, name, 'export');
}

export function hasScopeWrite(scope, name) {
  return hasScopeAtLeast(scope, name, 'write');
}

export function hasScopeRead(scope, name) {
  return hasScopeAtLeast(scope, name, 'read');
}
