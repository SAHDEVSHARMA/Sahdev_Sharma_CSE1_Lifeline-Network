"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistance } from 'date-fns';
import { Notification } from '@/lib/types';
import { cn } from '@/lib/utils';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  className?: string;
}

export function NotificationList({ notifications, onMarkAsRead, className }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className={cn('text-center py-6 text-muted-foreground', className)}>
        No notifications to display
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {notifications.map((notification) => (
        <Card 
          key={notification.id}
          className={cn('cursor-pointer transition-all', 
            notification.read ? 'bg-muted/50' : 'bg-card shadow-md'
          )}
          onClick={() => !notification.read && onMarkAsRead?.(notification.id)}
        >
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-base font-medium flex justify-between items-center">
              <span>Notification</span>
              <span className="text-xs text-muted-foreground">
                {formatDistance(new Date(notification.createdAt), new Date(), { addSuffix: true })}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2 px-4">
            <p className="text-sm">{notification.message}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
