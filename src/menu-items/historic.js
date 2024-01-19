// assets
import { IconFriends, IconUsers, IconFileReport } from '@tabler/icons';

// constant
const icons = { IconFriends, IconUsers, IconFileReport };

const historic = {
  id: 'historic',
  title: 'Historicos y Logs',
  type: 'group',
  children: [
    {
      id: 'historic-users',
      title: 'Usuarios',
      type: 'item',
      url: '/app/historic-users',
      icon: icons.IconUsers,
      breadcrumbs: false
    },
    {
      id: 'historic-clients',
      title: 'Clientes',
      type: 'item',
      url: '/app/historic-clients',
      icon: icons.IconFriends,
      breadcrumbs: false
    },
    {
      id: 'logs',
      title: 'Logs',
      type: 'item',
      url: '/app/logs',
      icon: icons.IconFileReport,
      breadcrumbs: false
    }
  ]
};

export default historic;
