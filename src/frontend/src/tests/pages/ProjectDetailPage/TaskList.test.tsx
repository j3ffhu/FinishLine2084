/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '@testing-library/react';
import { routerWrapperBuilder } from '../../test-support/test-utils';
import * as authHooks from '../../../hooks/auth.hooks';
import { mockAuth } from '../../test-support/test-data/test-utils.stub';
import { exampleAdminUser, exampleGuestUser, exampleLeadershipUser } from '../../test-support/test-data/users.stub';
import TaskList from '../../../pages/ProjectDetailPage/ProjectViewContainer/TaskList';

jest.mock('../../../hooks/auth.hooks');
// TODO: delete me when you actually implement onClick
jest.mock('../../../hooks/toasts.hooks');

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <TaskList />
    </RouterWrapper>
  );
};

describe('TaskList component', () => {
  const spyUseAuthHook = jest.spyOn(authHooks, 'useAuth');

  beforeEach(() => {
    spyUseAuthHook.mockReturnValue(mockAuth(false, exampleAdminUser));
  });

  it('renders "Task List" on top', () => {
    renderComponent();
    expect(screen.getByText('Task List')).toBeInTheDocument();
  });

  it('renders all 3 labels', () => {
    renderComponent();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('In Backlog')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  describe('New Task button', () => {
    it('renders New Task button', () => {
      renderComponent();
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });

    it('enables New Task button for leadership', () => {
      spyUseAuthHook.mockReturnValue(mockAuth(false, exampleLeadershipUser));
      renderComponent();
      expect(screen.getByText('New Task')).toBeEnabled();
    });

    it('disables New Task button for guests', () => {
      spyUseAuthHook.mockReturnValue(mockAuth(false, exampleGuestUser));
      renderComponent();
      expect(screen.getByText('New Task')).toBeDisabled();
    });
  });
});
