import fs from "fs"
import path from "path"
import {
  CategorizedNotificationItem,
  INITIAL_CATEGORIZED_NOTIFICATIONS
} from "./notifications-engine-data"

class ConnectInNotificationsStore {
  private items: CategorizedNotificationItem[] = []
  private filePath: string

  constructor() {
    const dir = path.join(process.cwd(), "data", "db")
    try {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    } catch {}
    this.filePath = path.join(dir, "connectin_notifications.json")
    this.load()
  }

  private load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf8")
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.items = parsed
          return
        }
      }
    } catch (e) {
      console.warn("Could not read notifications file, using initial dataset:", e)
    }
    this.items = [...INITIAL_CATEGORIZED_NOTIFICATIONS]
  }

  private save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.items, null, 2), "utf8")
    } catch {}
  }

  public getAll(): CategorizedNotificationItem[] {
    if (this.items.length === 0) {
      this.load()
    }
    return [...this.items]
  }

  public addAlert(alert: Partial<CategorizedNotificationItem>): CategorizedNotificationItem {
    const newItem: CategorizedNotificationItem = {
      id: alert.id || `notif_noctis_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      category: alert.category || 'Security',
      subType: (alert.subType as any) || 'Security Advisory',
      actor: alert.actor || {
        name: 'Noctis Frontier & Benchmark Engine',
        role: 'Autonomous Invariant Daemon',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
        isVerified: true
      },
      title: alert.title || '🔴 Noctis Automated Invariant Alert',
      description: alert.description || 'Frontier challenge executed with zero violations.',
      timestamp: alert.timestamp || 'Just now',
      unread: true,
      actionText: alert.actionText || 'Inspect Challenge & Telemetry',
      targetTab: (alert.targetTab as any) || 'pulserooms',
      targetPayload: alert.targetPayload,
      priority: alert.priority || 'high'
    }

    // Prepend to top of list
    this.items.unshift(newItem)
    this.save()
    return newItem
  }

  public markAsRead(id: string): boolean {
    const item = this.items.find(n => n.id === id)
    if (item) {
      item.unread = false
      this.save()
      return true
    }
    return false
  }

  public markAllAsRead(): void {
    this.items.forEach(n => { n.unread = false })
    this.save()
  }

  public getUnreadCount(): number {
    return this.items.filter(n => n.unread).length
  }
}

export const connectinNotificationsStore = new ConnectInNotificationsStore()
