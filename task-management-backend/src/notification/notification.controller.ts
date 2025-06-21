import { Controller, Param, Get, Patch, Sse, Res } from '@nestjs/common';
import { NotificationService } from './notification.service';

import { Observable, map } from 'rxjs';
// import {
//   NotificationDto,
//   NotificationsResponseDto,
//   SSENotificationResponse,
// } from '../usecase/dto/notificationResponse.dto';

interface MessageEvent {
  id: string;
  event: string;
}

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('/user/:userId')
  async getNotification(
    @Param('userId') userId:string){
    return await this.notificationService.getNotifications(
      userId,
    );
  }

  @Get('/unreadNotifications/:userId')
  async getUnreadNotifications(
    @Param('userId') userId: string,
  ) {
    return this.notificationService.getUnreadNotifications(userId);
  }

  @Patch(':notificationId')
  async markAsRead(@Param('notificationId') notificationId: string) {
    return await this.notificationService.markAsRead(notificationId);
  }


}
