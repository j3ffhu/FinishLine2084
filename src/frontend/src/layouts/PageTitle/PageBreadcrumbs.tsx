/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { LinkItem } from '../../utils/types';
import { routes } from '../../utils/routes';
import { Breadcrumbs } from '@mui/material';

interface PageTitleProps {
  currentPageTitle: string;
  previousPages: LinkItem[];
}

// Common component for adding breadcrumbs to a page
const PageBreadcrumbs: React.FC<PageTitleProps> = ({ currentPageTitle, previousPages }) => {
  return (
    <Breadcrumbs sx={{ my: 1 }}>
      <Link href={routes.HOME}>Home</Link>
      {previousPages.map((page, i) => (
        <Link key={i} href={page.route}>
          {page.name}
        </Link>
      ))}
      <Typography>{currentPageTitle}</Typography>
    </Breadcrumbs>
  );
};

export default PageBreadcrumbs;
