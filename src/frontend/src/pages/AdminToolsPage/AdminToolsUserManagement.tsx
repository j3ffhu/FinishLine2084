import Autocomplete from '@mui/material/Autocomplete';
import { NERButton } from '../../components/NERButton';
import { Grid, InputAdornment, Typography, useTheme } from '@mui/material';
import PageBlock from '../../layouts/PageBlock';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import { useAllUsers, useUpdateUserRole } from '../../hooks/users.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { fullNamePipe } from '../../utils/pipes';

interface UserData {
  userId: number;
  role: string;
}

const AdminToolsUserMangaement: React.FC = () => {
  const [role, setRole] = useState('');
  const [user, setUser] = useState<UserData | null>(null);
  const [isDisabled, setIsDisabled] = useState(true);
  const [hideSuccessLabel, setHideSuccessLabel] = useState(true);
  const { isLoading, isError, error, data } = useAllUsers();
  const update = useUpdateUserRole();
  const theme = useTheme();
  const autoCompleteStyle = {
    height: '40px',
    backgroundColor: theme.palette.background.default,
    width: '100%',
    borderRadius: '25px',
    border: 0,
    '.MuiOutlinedInput-notchedOutline': {
      borderColor: 'black',
      borderRadius: '25px'
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'red'
    }
  };

  const selectStyle = {
    width: '100%',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '25px',
    height: '40px',
    '.MuiOutlinedInput-notchedOutline': { borderRadius: '25px', borderColor: 'black' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 0 },
    '&.Mui-disabled': { backgroundColor: theme.palette.background.paper }
  };
  if (isLoading || !data) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error?.message} />;

  const handleSearchChange = (event: React.SyntheticEvent<Element, Event>, value: string | null) => {
    if (value) {
      const user = data.find((user) => fullNamePipe(user) === value.split(' -')[0]);
      if (user) setUser(user);
    } else {
      setUser(null);
    }
  };

  const handleRoleChange = (event: SelectChangeEvent) => {
    setRole(event.target.value);
    if (user && event.target.value === user.role) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  };

  const handleClick = async () => {
    setHideSuccessLabel(true);
    await update.mutateAsync({ userId: user?.userId, role }).catch((error) => {
      alert(error);
      throw new Error(error);
    });
    setHideSuccessLabel(false);
  };

  const createTextField = (params: any) => {
    return (
      <TextField
        {...params}
        InputProps={{
          ...params.InputProps,
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          )
        }}
        placeholder="Select a User"
      />
    );
  };
  return (
    <PageBlock title={'Role Management'}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Autocomplete
            disablePortal
            id="autocomplete"
            onChange={handleSearchChange}
            options={data.map((user) => `${fullNamePipe(user)} - ${user.email}`)}
            sx={autoCompleteStyle}
            size="small"
            renderInput={createTextField}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Select
            displayEmpty={true}
            renderValue={(value) => (value ? value : user ? user.role : 'Current Role')}
            id="role-select"
            value={role}
            onChange={handleRoleChange}
            sx={selectStyle}
            disabled={!user}
          >
            <MenuItem value={'ADMIN'}>Admin</MenuItem>
            <MenuItem value={'LEADERSHIP'}>Leadership</MenuItem>
            <MenuItem value={'MEMBER'}>Member</MenuItem>
            <MenuItem value={'GUEST'}>Guest</MenuItem>
          </Select>
        </Grid>
      </Grid>
      <NERButton
        sx={{ mt: '20px', float: 'right' }}
        variant="contained"
        disabled={isDisabled || !user}
        onClick={handleClick}
      >
        Confirm
      </NERButton>
      <Typography hidden={hideSuccessLabel} style={{ color: theme.palette.primary.main, marginTop: '20px' }}>
        Successfully Updated User
      </Typography>
    </PageBlock>
  );
};

export default AdminToolsUserMangaement;
