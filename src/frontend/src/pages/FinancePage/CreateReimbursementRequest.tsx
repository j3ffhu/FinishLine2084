/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useCreateReimbursementRequest } from '../../hooks/finance.hooks';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import { routes } from '../../utils/routes';
import ReimbursementRequestForm from './ReimbursementRequestForm/ReimbursementRequestForm';

const CreateReimbursementRequestPage: React.FC = () => {
  const { isLoading, mutateAsync } = useCreateReimbursementRequest();
  return (
    <>
      <PageTitle
        title="Create Reimbursement Request"
        previousPages={[{ name: 'Reimbursement Requests', route: routes.FINANCE }]}
      />
      <ReimbursementRequestForm submitText="Submit" mutateAsync={mutateAsync} isLoading={isLoading} />;
    </>
  );
};

export default CreateReimbursementRequestPage;
