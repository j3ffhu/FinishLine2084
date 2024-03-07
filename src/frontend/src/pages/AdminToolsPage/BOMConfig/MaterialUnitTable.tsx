import { TableRow, TableCell, Typography, Box } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { datePipe } from '../../../utils/pipes';
import ErrorPage from '../../ErrorPage';
import { NERButton } from '../../../components/NERButton';
import { useState } from 'react';
import AdminToolTable from '../AdminToolTable';
import { useGetAllUnits } from '../../../hooks/bom.hooks';
 
const MaterialUnitTable: React.FC = () => {
  const {
    data: materialUnits,
    isLoading: materialUnitsIsLoading,
    isError: materialUnitsIsError,
    error: materialUnitsError
  } = useGetAllUnits();
  const [createModalShow, setCreateModalShow] = useState<boolean>(false);

  if (!materialUnits || materialUnitsIsLoading) {
    return <LoadingIndicator />;
  }
  if (materialUnitsIsError) {
    return <ErrorPage message={materialUnitsError?.message} />;
  }

  const materialUnitsTableRows = materialUnits.map((materialUnit) => (
    <TableRow>
      <TableCell align="left" sx={{ border: '2px solid black' }}>
        {datePipe(materialUnit.dateCreated)}
      </TableCell>
      <TableCell sx={{ border: '2px solid black' }}>{materialUnit.name}</TableCell>
    </TableRow>
  ));

  return (
      
    <Box>
      <CreatematerialUnitModal showModal={createModalShow} handleClose={() => setCreateModalShow(false)} />
      <Typography variant="subtitle1">Registered Material Types</Typography>
      <AdminToolTable columns={[{ name: 'Date Registered' }, { name: 'Material Type' }]} rows={materialUnitsTableRows} />
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        <NERButton
          variant="contained"
          // click icon to invoke delete  handleSubmit(..)(e);
          onClick={() => {
            setCreateModalShow(true);
          }}
        >
          New Material Type
        </NERButton>
      </Box>
    </Box>
  );
};

export default MaterialUnitTable;
