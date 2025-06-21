export class TaskUpdatedEvent {
    constructor(public readonly taskId: string) {}
  }
  
  export class TaskAssignedEvent {
    constructor(public readonly taskId: string, public readonly assignedTo: string) {}
  }
  
  export class TaskDeadlineApproachingEvent {
    constructor(public readonly taskId: string, public readonly dueDate: Date) {}
  }
  
  export class TaskCompletedEvent {
    constructor(public readonly taskId: string) {}
  }
  