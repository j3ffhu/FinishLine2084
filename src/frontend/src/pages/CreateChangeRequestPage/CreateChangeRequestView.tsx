/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import * as yup from 'yup';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ChangeRequestReason, ChangeRequestType, ProposedSolution, validateWBS } from 'shared';
import { routes } from '../../utils/Routes';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import PageBlock from '../../layouts/PageBlock';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import Grid from '@mui/material/Grid';
import CreateProposedSolutionsList from './CreateProposedSolutionsList';
import ReactHookTextField from '../../components/ReactHookTextField';
import { NativeSelect } from '@mui/material';

interface CreateChangeRequestViewProps {
  wbsNum: string;
  crDesc: string;
  onSubmit: (data: any) => Promise<void>;
  proposedSolutions: ProposedSolution[];
  setProposedSolutions: (ps: ProposedSolution[]) => void;
  handleCancel: () => void;
}

const wbsTester = (wbsNum: string | undefined) => {
  if (!wbsNum) return false;
  try {
    validateWBS(wbsNum);
  } catch (error) {
    return false;
  }
  return true;
};

const schema = yup.object().shape({
  wbsNum: yup.string().required('WBS number is required').test('wbs-num-valid', 'WBS Number is not valid', wbsTester),
  type: yup.string().required('Type is required'),
  what: yup.string().required('What is required'),
  why: yup
    .array()
    .min(1, 'At least one Why is required')
    .required('Why is required')
    .of(
      yup.object().shape({
        type: yup.string().required('Why Type is required'),
        explain: yup
          .string()
          .required('Why Explain is required')
          .when('type', {
            is: ChangeRequestReason.OtherProject,
            then: yup.string().test('wbs-num-valid', 'WBS Number is not valid', wbsTester)
          })
      })
    )
});

const CreateChangeRequestsView: React.FC<CreateChangeRequestViewProps> = ({
  wbsNum,
  crDesc,
  onSubmit,
  proposedSolutions,
  setProposedSolutions,
  handleCancel
}) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    register
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      wbsNum,
      what: crDesc,
      why: [{ type: ChangeRequestReason.Other, explain: '' }],
      type: ChangeRequestType.Issue
    }
  });
  const { fields: whys, append: appendWhy, remove: removeWhy } = useFieldArray({ control, name: 'why' });

  const permittedTypes = Object.values(ChangeRequestType).filter(
    (t) => t !== ChangeRequestType.Activation && t !== ChangeRequestType.StageGate
  );

  return (
    <form
      id={'create-standard-change-request-form'}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleSubmit(onSubmit)(e);
      }}
      onKeyPress={(e) => {
        e.key === 'Enter' && e.preventDefault();
      }}
    >
      <PageTitle title="New Change Request" previousPages={[{ name: 'Change Requests', route: routes.CHANGE_REQUESTS }]} />
      <PageBlock title="Details">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="caption">WBS Number</Typography>
            </Box>
            <ReactHookTextField name="wbsNum" control={control} placeholder="1.1.0" errorMessage={errors.wbsNum} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="caption">Type</Typography>
            </Box>
            <Controller
              name="type"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <FormControl>
                  <NativeSelect {...field} variant="outlined" error={!!fieldState.error}>
                    {permittedTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </NativeSelect>
                  <FormHelperText sx={{ backgroundColor: '#f0f1f8' }}>{fieldState.error?.type}</FormHelperText>
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="caption">What</Typography>
            </Box>
            <ReactHookTextField
              name="what"
              control={control}
              multiline
              rows={4}
              fullWidth
              errorMessage={errors.what}
              placeholder="What is the situation?"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="caption">Why</Typography>
            </Box>
            <Box>
              {whys.map((_element, index) => (
                <Box display="flex" flexDirection="row" sx={{ mb: 1 }}>
                  <NativeSelect {...register(`why.${index}.type`)}>
                    {Object.values(ChangeRequestReason).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </NativeSelect>
                  <TextField
                    required
                    autoComplete="off"
                    label="Explain"
                    sx={{ flexGrow: 1, mx: 1 }}
                    {...register(`why.${index}.explain`)}
                  />
                  <Button
                    sx={{ maxHeight: '55px', verticalAlign: 'middle' }}
                    variant="contained"
                    color="error"
                    onClick={() => removeWhy(index)}
                  >
                    <DeleteIcon />
                  </Button>
                </Box>
              ))}
            </Box>
            <Button
              variant="outlined"
              color="secondary"
              sx={{ mt: 1 }}
              onClick={() => appendWhy({ type: ChangeRequestReason.Design, explain: '' })}
            >
              Add Reason
            </Button>
          </Grid>
        </Grid>
      </PageBlock>
      <PageBlock title="Proposed Solutions">
        <CreateProposedSolutionsList proposedSolutions={proposedSolutions} setProposedSolutions={setProposedSolutions} />
      </PageBlock>
      <Box textAlign="center">
        <Button variant="contained" color="success" type="submit" sx={{ mx: 2 }}>
          Submit
        </Button>
        <Button variant="contained" color="error" onClick={handleCancel} sx={{ mx: 2 }}>
          Cancel
        </Button>
      </Box>
    </form>
  );
};

export default CreateChangeRequestsView;
