import { Box, CircuitBoard, Cpu, HardDrive, Headphones, Keyboard, Laptop, MemoryStick, Monitor, MonitorSmartphone, Mouse, type LucideIcon } from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  Laptop,
  Monitor,
  Box,
  Cpu,
  MemoryStick,
  HardDrive,
  Gpu: CircuitBoard,
  Keyboard,
  Mouse,
  Headphones,
  MonitorSmartphone,
}

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Box
  return <Icon className={className} />
}
