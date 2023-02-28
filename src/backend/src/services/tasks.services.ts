import { Role, Task_Priority, Task_Status, User } from '@prisma/client';
import { isUnderWordCount, Task, WbsNumber, wbsPipe } from 'shared';
import taskQueryArgs from '../prisma-query-args/tasks.query-args';
import prisma from '../prisma/prisma';
import taskTransformer from '../transformers/tasks.transformer';
import { NotFoundException, AccessDeniedException, HttpException } from '../utils/errors.utils';
import { hasPermissionToEditTask } from '../utils/tasks.utils';
import { getUsers } from '../utils/users.utils';

export default class TasksService {
  /**
   * Creates a Task in the database
   * @param createdBy the user creating the task
   * @param wbsNum the WBS Number to create the task for
   * @param title the title of the tas
   * @param notes the notes of the task
   * @param deadline the deadline of the task
   * @param priority the priority of the task
   * @param status the status of the task
   * @param assignees the assignees ids of the task
   * @returns the id of the successfully created task
   * @throws if the user does not have access to create a task, wbs element does not exist, or wbs element is deleted
   */
  static async createTask(
    createdBy: User,
    wbsNum: WbsNumber,
    title: string,
    notes: string,
    deadline: Date,
    priority: Task_Priority,
    status: Task_Status,
    assignees: number[]
  ): Promise<Task> {
    if (createdBy.role === Role.GUEST) throw new AccessDeniedException();

    if (!isUnderWordCount(title, 15)) throw new HttpException(400, 'Title must be less than 15 words');

    if (!isUnderWordCount(notes, 150)) throw new HttpException(400, 'Notes must be less than 250 words');

    const requestedWbsElement = await prisma.wBS_Element.findUnique({ where: { wbsNumber: wbsNum } });

    if (!requestedWbsElement) throw new NotFoundException('WBS Element', wbsPipe(wbsNum));

    if (requestedWbsElement.dateDeleted) throw new HttpException(400, "This task's wbs element has been deleted!");

    // this throws if any of the users aren't found
    const users = await getUsers(assignees);

    const createdTask = await prisma.task.create({
      data: {
        wbsElement: { connect: { wbsNumber: wbsNum } },
        title,
        notes,
        deadline,
        priority,
        status,
        createdBy: { connect: { userId: createdBy.userId } },
        assignees: { connect: users.map((user) => ({ userId: user.userId })) }
      },
      ...taskQueryArgs
    });

    return taskTransformer(createdTask);
  }

  /**
   * Edits a Task in the database
   * @param user the user editing the task
   * @param taskId the task that is being edited
   * @param title the new title for the task
   * @param notes the new notes for the task
   * @param priority the new priority for the task
   * @param deadline the new deadline for the task
   * @returns the sucessfully edited task
   */
  static async editTask(user: User, taskId: string, title: string, notes: string, priority: Task_Priority, deadline: Date) {
    const hasPermission = await hasPermissionToEditTask(user, taskId);
    if (!hasPermission) throw new AccessDeniedException();

    const originalTask = await prisma.task.findUnique({ where: { taskId } });
    if (!originalTask) throw new NotFoundException('Task', taskId);
    if (originalTask.dateDeleted) throw new HttpException(400, 'Cant edit a deleted Task!');

    if (!isUnderWordCount(title, 15)) throw new HttpException(400, 'Title must be less than 15 words');

    if (!isUnderWordCount(notes, 250)) throw new HttpException(400, 'Notes must be less than 250 words');

    const updatedTask = await prisma.task.update({
      where: { taskId },
      data: { title, notes, priority, deadline },
      ...taskQueryArgs
    });
    return taskTransformer(updatedTask);
  }

  /**
   * Edits the status of a task in the database
   * @param user the user editing the task
   * @param taskId the id of the task
   * @param status the new status
   * @returns the updated task
   * @throws if the task does not exist, the task is already deleted, or if the user does not have permissions
   */
  static async editTaskStatus(user: User, taskId: string, status: Task_Status) {
    // Get the original task and check if it exists
    const originalTask = await prisma.task.findUnique({ where: { taskId } });
    if (!originalTask) throw new NotFoundException('Task', taskId);
    if (originalTask.dateDeleted) throw new HttpException(400, 'Cant edit a deleted Task!');

    const hasPermission = await hasPermissionToEditTask(user, taskId);
    if (!hasPermission)
      throw new AccessDeniedException(
        'Only admins, app admins, task creators, project leads, project managers, or project assignees can edit a task'
      );

    const updatedTask = await prisma.task.update({ where: { taskId }, data: { status }, ...taskQueryArgs });
    return taskTransformer(updatedTask);
  }

  /**
   * Edits the assignees of a task in the database
   * @param user the user editing the task
   * @param taskId the id of the task
   * @param assignees the new assignees
   * @returns the updated task
   * @throws if the task does not exist, the task is already deleted, any of the assignees don't exist, or if the user does not have permissions
   */
  static async editTaskAssignees(user: User, taskId: string, assignees: number[]): Promise<Task> {
    // Get the original task and check if it exists
    const originalTask = await prisma.task.findUnique({ where: { taskId } });
    if (!originalTask) throw new NotFoundException('Task', taskId);
    if (originalTask.dateDeleted) throw new HttpException(400, 'Cant edit a deleted Task!');

    const hasPermission = await hasPermissionToEditTask(user, taskId);
    if (!hasPermission)
      throw new AccessDeniedException(
        'Only admins, app admins, task creators, project leads, project managers, or project assignees can edit a task'
      );

    // this throws if any of the users aren't found
    const assigneeUsers = await getUsers(assignees);

    // retrieve userId for every assignee to update task's assignees in the database
    const transformedAssigneeUsers = assigneeUsers.map((user) => {
      return {
        userId: user.userId
      };
    });

    const updatedTask = await prisma.task.update({
      where: { taskId },
      data: {
        assignees: {
          set: transformedAssigneeUsers
        }
      },
      ...taskQueryArgs
    });

    return taskTransformer(updatedTask);
  }

  /**
   * Delete task in the database
   * @param taskId the id number of the given task
   * @param currentUser the current user currently accessing the task
   * @returns the deleted task
   * @throws if the user does not have permission
   */
  static async deleteTask(currentUser: User, taskId: string): Promise<string> {
    const task = await prisma.task.findUnique({ where: { taskId }, ...taskQueryArgs });
    if (!task) throw new NotFoundException('Task', taskId);
    if (task.dateDeleted) throw new HttpException(400, 'Cant delete a deleted Task!');

    const wbsElement = await prisma.wBS_Element.findUnique({ where: { wbsElementId: task.wbsElementId } });
    if (!wbsElement) throw new NotFoundException('WBS Element', task.wbsElementId);
    if (wbsElement.dateDeleted) throw new HttpException(400, "This task's wbs element has been deleted!");

    // this checks the current users permissions
    const isAdmin = currentUser.role === Role.APP_ADMIN || currentUser.role === Role.ADMIN;
    const isLead = wbsElement.projectLeadId === currentUser.userId || wbsElement.projectManagerId === currentUser.userId;
    if (!isAdmin && !isLead) {
      throw new AccessDeniedException();
    }

    const deletedTask = await prisma.task.update({
      where: { taskId },
      data: { dateDeleted: new Date(), deletedByUserId: currentUser.userId }
    });

    return deletedTask.taskId;
  }
}