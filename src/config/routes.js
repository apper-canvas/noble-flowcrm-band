import Contacts from '@/components/pages/Contacts';
import Deals from '@/components/pages/Deals';
import Activities from '@/components/pages/Activities';
import ContactDetail from '@/components/pages/ContactDetail';

export const routes = {
  contacts: {
    id: 'contacts',
    label: 'Contacts',
    path: '/contacts',
    icon: 'Users',
    component: Contacts
  },
  deals: {
    id: 'deals',
    label: 'Deals',
    path: '/deals',
    icon: 'TrendingUp',
    component: Deals
  },
  activities: {
    id: 'activities',
    label: 'Activities',
    path: '/activities',
    icon: 'Activity',
    component: Activities
  },
  contactDetail: {
    id: 'contactDetail',
    label: 'Contact Detail',
    path: '/contacts/:id',
    icon: 'User',
    component: ContactDetail,
    hideFromNav: true
  }
};

export const routeArray = Object.values(routes);
export default routes;