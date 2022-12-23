/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { faExchangeAlt, faFolder, faHome, faQuestionCircle, faToolbox, faUsers } from '@fortawesome/free-solid-svg-icons';
import { routes } from '../../utils/routes';
import { LinkItem } from '../../utils/types';
import NavPageLinks from './NavPageLinks';
import styles from '../../stylesheets/layouts/sidebar/sidebar.module.css';
import { useAuth } from '../../hooks/auth.hooks';

const Sidebar: React.FC = () => {
  let linkItems: LinkItem[];
  const auth = useAuth();
  if (auth.user?.role === 'ADMIN' || auth.user?.role === 'APP_ADMIN') {
    linkItems = [
      {
        name: 'Home',
        icon: faHome,
        route: routes.HOME
      },
      {
        name: 'Projects',
        icon: faFolder,
        route: routes.PROJECTS
      },
      {
        name: 'Change Requests',
        icon: faExchangeAlt,
        route: routes.CHANGE_REQUESTS
      },
      {
        name: 'Teams',
        icon: faUsers,
        route: routes.TEAMS
      },
      {
        name: 'Admin Tools',
        icon: faToolbox,
        route: routes.ADMIN_TOOLS
      },
      {
        name: 'Info',
        icon: faQuestionCircle,
        route: routes.INFO
      }
    ];
  } else {
    linkItems = [
      {
        name: 'Home',
        icon: faHome,
        route: routes.HOME
      },
      {
        name: 'Projects',
        icon: faFolder,
        route: routes.PROJECTS
      },
      {
        name: 'Change Requests',
        icon: faExchangeAlt,
        route: routes.CHANGE_REQUESTS
      },
      {
        name: 'Teams',
        icon: faUsers,
        route: routes.TEAMS
      },
      {
        name: 'Info',
        icon: faQuestionCircle,
        route: routes.INFO
      }
    ];
  }
  return (
    <div className={styles.sidebar}>
      <NavPageLinks linkItems={linkItems} />
    </div>
  );
};

export default Sidebar;
