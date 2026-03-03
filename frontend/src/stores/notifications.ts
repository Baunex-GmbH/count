import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Notification } from '@/types'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  let counter = 0

  function add(severity: Notification['severity'], summary: string, detail: string = '', life: number = 3000) {
    const notification: Notification = {
      id: `notif-${++counter}`,
      severity,
      summary,
      detail,
      life,
    }
    notifications.value.push(notification)
    if (life > 0) {
      setTimeout(() => {
        remove(notification.id)
      }, life)
    }
    return notification.id
  }

  function remove(id: string) {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  function success(summary: string, detail: string = '') {
    return add('success', summary, detail)
  }

  function info(summary: string, detail: string = '') {
    return add('info', summary, detail)
  }

  function warn(summary: string, detail: string = '') {
    return add('warn', summary, detail)
  }

  function error(summary: string, detail: string = '') {
    return add('error', summary, detail, 5000)
  }

  return { notifications, add, remove, success, info, warn, error }
})
