export const basicRoutes = [
  { path: '/login', name: 'Ienākt' },
  { path: '/dashboard', name: 'Sākums' },
  { path: '/error', name: 'Kļūda', meta: { hideFromIndex: true } },
  { path: '/not-found', name: 'Lapa nav atrasta', meta: { hideFromIndex: true } },
];

export const authRoutes = [
  { path: '/signin', name: 'Autorizēties' },
  { path: '/role-selection', name: 'Lomas izvēle', meta: { hideFromIndex: true } },
  { path: '/forbidden', name: 'Pieeja aizliegta', meta: { hideFromIndex: true } },
  { path: '/not-authorized', name: 'Nav autorizēts', meta: { hideFromIndex: true } },
  { path: '/session-ended', name: 'Sesija beigusies', meta: { hideFromIndex: true } },
  { path: '/auth-done', name: 'Autorizācija pabeigta', meta: { hideFromIndex: true } },
];
