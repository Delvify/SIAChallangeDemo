import React from 'react';

const Configurations = React.lazy(() => import('./views/Configurations'));
const Settings = React.lazy(() => import('./views/Settings'));
const Transactions = React.lazy(() => import('./views/Conversions'));
const Overviews = React.lazy(() => import('./views/Overview'));
const Campaigns = React.lazy(() => import('./views/Campaigns'));

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/', exact: true, name: 'Home' },

  { path: '/configurations', exact: true, name: 'Configurations', component: Configurations },
  { path: '/settings', exact: true, name: 'Settings', component: Settings },
  { path: '/conversions', exact: true, name: 'Conversion Report', component: Transactions },
  { path: '/overview', exact: true, name: 'Overview', component: Overviews },
  { path: '/campaigns', exact: true, name: 'Campaign Report', component: Campaigns },
];

export default routes;
