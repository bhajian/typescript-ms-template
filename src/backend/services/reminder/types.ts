export type GetReminderParams = {
  id: string
}

export type Reminder = {
  name: string
  description: string
}

export type CreateReminderResponse = {
  id: string
}

export type GetReminderResponse = Reminder;
export type ReminderEntity = Reminder & CreateReminderResponse

export type DeleteReminderParams = GetReminderParams;
export type CreateReminderParams = Reminder;
