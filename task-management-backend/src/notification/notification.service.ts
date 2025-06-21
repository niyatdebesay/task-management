import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from './schema/notification.schema';

@Injectable()
export class NotificationService {

  constructor(
    @InjectModel(Notification.name) private readonly notificationModel: Model<Notification>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createNotification(
    message: string,
    link: string,
    userId: string,
    organizationId: string,
  ): Promise<Notification> {
    const newNotification = new this.notificationModel({
      message,
      link,
      readAt: null,
      userId,
      organizationId,
      createdAt: new Date(),
    });
    const notification = await newNotification.save();
    this.eventEmitter.emit('notification.created', notification);
    return notification;
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    const notification = await this.notificationModel.findById(notificationId);
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${notificationId} not found`);
    }
    notification.readAt = new Date();
    return await notification.save();
  }

  async getNotifications(userId: string,): Promise<Notification[]> {
    return await this.notificationModel
      .find({ userId })
      .sort({ readAt: -1, createdAt: -1 })
      .exec();
  }

  async getUnreadNotifications(userId: string) {
    const unreadNotifications = await this.notificationModel
      .find({ userId,  readAt: null })
      .sort({ createdAt: -1 })
      .exec();

    return { notifications: unreadNotifications, count: unreadNotifications.length };
  }

  
}
