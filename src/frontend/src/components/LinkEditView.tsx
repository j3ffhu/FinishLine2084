import { useAllLinkTypes } from '../hooks/projects.hooks';
import LoadingIndicator from './LoadingIndicator';
import ErrorPage from '../pages/ErrorPage';
import { Button, Grid, IconButton, MenuItem, Select, TextField } from '@mui/material';
import { FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove, UseFormRegister } from 'react-hook-form';
import DeleteIcon from '@mui/icons-material/Delete';

const LinkEditView: React.FC<{
  ls: FieldArrayWithId[];
  register: UseFormRegister<{
    name: string;
    budget: number;
    summary: string;
    projectLeadId: number | undefined;
    projectManagerId: number | undefined;
    crId: string;
    rules: { rule: string }[];
    links: { linkId: string; linkTypeName: string; url: string }[];
    goals: { bulletId: number; detail: string }[];
    features: { bulletId: number; detail: string }[];
    constraints: { bulletId: number; detail: string }[];
  }>;
  append: UseFieldArrayAppend<any, any>;
  remove: UseFieldArrayRemove;
}> = ({ ls, register, append, remove }) => {
  const { isLoading, isError, error, data } = useAllLinkTypes();
  if (isLoading || !data) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  return (
    <>
      {ls.map((_element, i) => {
        return (
          <Grid item sx={{ display: 'flex', alignItems: 'center', mb: '5px' }}>
            <Select {...register(`links.${i}.linkTypeName`, { required: true })} sx={{ minWidth: '200px', mr: '5px' }}>
              {data.map((linkType) => (
                <MenuItem key={linkType.name} value={linkType.name}>
                  {linkType.name}
                </MenuItem>
              ))}
            </Select>
            <TextField required fullWidth autoComplete="off" {...register(`links.${i}.url`, { required: true })} />
            <IconButton type="button" onClick={() => remove(i)} sx={{ mx: 1, my: 0 }}>
              <DeleteIcon />
            </IconButton>
          </Grid>
        );
      })}

      <Button
        variant="contained"
        color="success"
        onClick={() => append({ linkId: '-1', url: '', linkTypeName: '-1' })}
        sx={{ my: 2, width: 'max-content' }}
      >
        + Add New Bullet
      </Button>
    </>
  );
};

export default LinkEditView;
