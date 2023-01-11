/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Grid, Button, Typography } from '@mui/material'; // some imports from libraries
import { useState } from 'react';
import PageTitle from '../../layouts/PageTitle/PageTitle'; // ...and from other files
import PageBlock from '../../layouts/PageBlock';

const CreditsPage: React.FC = () => {
  const names: {
    name: string;
    color: string;
  }[] = [{ name: 'Kevin Chen', color: '#00A36C' }]; // This is a list of names, add yours here! (along with a hexcode color)

  const snark = ['Add your name!', "Shouldn't you do it yourself?", 'Seriously', 'go', 'do', 'it'];
  const [displaySnark, setDisplaySnark] = useState(0);
  // "displaySnark" is a variable and we're using it as a counter.
  // we define it with the "useState" React "hook" designating it as a special variable that re-renders the view when changed.

  // below we build and return what is shown on the page (minus the top bar and side bar)
  // inside a PageBlock component, we map the names list from above into components to display each name.
  // under that is a button that changes its display based on "displaySnark" whenever it is clicked.

  return (
    <div>
      <PageBlock>
        <PageTitle title={'Credits'} previousPages={[]} />
        <Grid container spacing={2}>
          {names.map((item) => (
            <Grid item>
              <Typography variant="body1" color={item.color}>
                {item.name}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </PageBlock>
      <div style={{ justifyContent: 'center', display: 'flex' }}>
        <Button onClick={() => setDisplaySnark(displaySnark + 1)} variant="contained">
          {displaySnark < snark.length ? snark[displaySnark] : '>:('}
        </Button>
      </div>
    </div>
  );
};

export default CreditsPage;
