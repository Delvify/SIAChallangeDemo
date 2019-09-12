export default {
  items: [
    {
      title: true,
      name: 'Dashboard',
      wrapper: {            // optional wrapper object
        element: '',        // required valid HTML5 element tag
        attributes: {}        // optional valid JS object with JS API naming ex: { className: "my-class", style: { fontFamily: "Verdana" }, id: "my-id"}
      },
      class: ''             // optional class names space delimited list for title item ex: "text-center"
    },
    {
      name: 'Overview',
      url: '/overview',
      icon: 'icon-pie-chart',
    },
    {
      name: 'Campaign Report',
      url: '/campaigns',
      icon: 'icon-chart',
    },
    {
      name: 'Conversion Report',
      url: '/conversions',
      icon: 'icon-wallet',
    },
    {
      name: 'Configurations',
      url: '/configurations',
      icon: 'icon-settings',
    },
  ],
};
