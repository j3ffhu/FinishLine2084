import prisma from '../src/prisma/prisma';
import { batman, wonderwoman, superman } from './test-data/users.test-data';
import { AccessDeniedException, HttpException, NotFoundException } from '../src/utils/errors.utils';
import TasksService from '../src/services/tasks.services';
import { prismaWbsElement1 } from './test-data/wbs-element.test-data';
import { invalidTaskNotes, taskSaveTheDayPrisma, taskSaveTheDayShared } from './test-data/tasks.test-data';
import { WbsNumber } from 'shared';
import { Task_Priority } from '@prisma/client';
import taskTransformer from '../src/transformers/tasks.transformer';

describe('Tasks', () => {
  const mockDate = new Date('2022-12-25T00:00:00.000Z');
  const mockWBSNum: WbsNumber = {
    carNumber: 1,
    projectNumber: 2,
    workPackageNumber: 0
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    test('create task fails when user does not have permission', async () => {
      await expect(() =>
        TasksService.createTask(wonderwoman, mockWBSNum, 'hellow world', '', mockDate, 'HIGH', 'DONE', [])
      ).rejects.toThrow(new AccessDeniedException());
    });

    test('create task fails when title is over word count', async () => {
      await expect(() =>
        TasksService.createTask(
          batman,
          mockWBSNum,
          'WE NEED TO SAVE THE DAY VERY VERY VERY VERY VERY VERY VERY VERY VERY QUICKLY',
          'DO IT NOW',
          mockDate,
          'HIGH',
          'DONE',
          []
        )
      ).rejects.toThrow(new HttpException(400, 'Title must be less than 15 words'));
    });

    test('create task fails when notes is over word count', async () => {
      await expect(() =>
        TasksService.createTask(batman, mockWBSNum, 'hellow world', invalidTaskNotes, mockDate, 'HIGH', 'DONE', [])
      ).rejects.toThrow(new HttpException(400, 'Notes must be less than 250 words'));
    });

    test('create task fails when wbs element doesnt exist', async () => {
      jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue(null);

      await expect(() =>
        TasksService.createTask(batman, mockWBSNum, 'hellow world', '', mockDate, 'HIGH', 'DONE', [])
      ).rejects.toThrow(new NotFoundException('WBS Element', '1.2.0'));

      expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(1);
    });

    test('create task fails when wbs element has been deleted', async () => {
      jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue({ ...prismaWbsElement1, dateDeleted: mockDate });

      await expect(() =>
        TasksService.createTask(batman, mockWBSNum, 'hellow world', '', mockDate, 'HIGH', 'DONE', [])
      ).rejects.toThrow(new HttpException(400, "This task's wbs element has been deleted!"));

      expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(1);
    });

    test('create task succeeds', async () => {
      jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue(prismaWbsElement1);
      jest.spyOn(prisma.task, 'create').mockResolvedValue(taskSaveTheDayPrisma);

      const task = await TasksService.createTask(batman, mockWBSNum, 'hellow world', '', mockDate, 'HIGH', 'DONE', []);

      expect(task).toStrictEqual(taskSaveTheDayShared);
      expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(1);
    });
  });
});

describe('Edit Tasks', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const taskId = '1';
  const fakeTitle = 'Dont save the day';
  const fakeNotes = 'Leave the people in the burning building';
  const fakePriority = Task_Priority.LOW;
  const fakeDeadline = new Date();

  test('user access denied', async () => {
    await expect(() =>
      TasksService.editTask(wonderwoman, taskId, fakeTitle, fakeNotes, fakePriority, fakeDeadline)
    ).rejects.toThrow(new AccessDeniedException());
  });

  test('Task not found', async () => {
    jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(null);
    await expect(() =>
      TasksService.editTask(superman, taskId, fakeTitle, fakeNotes, fakePriority, fakeDeadline)
    ).rejects.toThrow(new NotFoundException('Task', taskId));
    expect(prisma.task.findUnique).toHaveBeenCalledTimes(1);
  });

  test('Task deleted', async () => {
    jest.spyOn(prisma.task, 'findUnique').mockResolvedValue({ ...taskSaveTheDayPrisma, dateDeleted: new Date('1/1/2023') });
    await expect(() =>
      TasksService.editTask(superman, taskId, fakeTitle, fakeNotes, fakePriority, fakeDeadline)
    ).rejects.toThrow(new HttpException(400, 'Cant edit a deleted Task!'));
    expect(prisma.task.findUnique).toHaveBeenCalledTimes(1);
  });

  test('Title over Limit', async () => {
    jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(taskSaveTheDayPrisma);
    await expect(() =>
      TasksService.editTask(superman, taskId, 'A B C D E F G H I J K L M N O', invalidTaskNotes, fakePriority, fakeDeadline)
    ).rejects.toThrow(new HttpException(400, 'Title must be less than 15 words'));
    expect(prisma.task.findUnique).toHaveBeenCalledTimes(1);
  });

  test('Notes over limit', async () => {
    jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(taskSaveTheDayPrisma);
    await expect(() =>
      TasksService.editTask(superman, taskId, fakeTitle, invalidTaskNotes, fakePriority, fakeDeadline)
    ).rejects.toThrow(new HttpException(400, 'Notes must be less than 250 words'));
    expect(prisma.task.findUnique).toHaveBeenCalledTimes(1);
  });

  test('Task successfully edited', async () => {
    jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(taskSaveTheDayPrisma);
    const updatedSaveTheDay = {
      ...taskSaveTheDayPrisma,
      title: fakeTitle,
      notes: fakeNotes,
      priority: fakePriority,
      deadline: fakeDeadline
    };
    jest.spyOn(prisma.task, 'update').mockResolvedValue(updatedSaveTheDay);
    const response = await TasksService.editTask(superman, taskId, fakeTitle, fakeNotes, fakePriority, fakeDeadline);

    expect(prisma.task.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.task.update).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual(taskTransformer(updatedSaveTheDay));
  });
});
