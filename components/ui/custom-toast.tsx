"use client"

import { toast as sonnerToast } from "sonner"
import { X } from "lucide-react"

type ToastType = "success" | "error" | "info" | "warning"

const toastConfig: Record<
  ToastType,
  { bg: string; ring: string; iconPath: string }
> = {
  success: {
    bg: "bg-gradient-to-r from-green-500 to-emerald-500",
    ring: "ring-green-500/20",
    iconPath: "M5 13l4 4L19 7",
  },
  error: {
    bg: "bg-gradient-to-r from-red-500 to-rose-500",
    ring: "ring-red-500/20",
    iconPath: "M6 18L18 6M6 6l12 12",
  },
  info: {
    bg: "bg-gradient-to-r from-blue-500 to-indigo-500",
    ring: "ring-blue-500/20",
    iconPath: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  warning: {
    bg: "bg-gradient-to-r from-yellow-500 to-orange-500",
    ring: "ring-yellow-500/20",
    iconPath: "M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
}

function CustomToastContent({
  id,
  type,
  message,
  duration = 4000,
}: {
  id: string | number
  type: ToastType
  message: string
  duration?: number
}) {
  const config = toastConfig[type]

  return (
    <div
      className={`toast-container relative w-full sm:w-auto sm:min-w-80 max-w-md backdrop-blur-lg border border-white/20 rounded-lg shadow-2xl overflow-hidden ring-1 ${config.bg} ${config.ring}`}
    >
      <div className="relative p-4 pl-5">
        <button
          onClick={() => sonnerToast.dismiss(id)}
          className="absolute top-2 right-2 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors w-7 h-7 min-w-[44px] min-h-[44px] sm:min-w-[28px] sm:min-h-[28px]"
          aria-label="关闭提示"
        >
          <X className="w-4 h-4 text-white" />
        </button>
        <div className="flex items-start gap-3 pr-8">
          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center mt-0.5">
            <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.iconPath} />
            </svg>
          </div>
          <p className="text-sm font-medium text-white leading-relaxed break-words">{message}</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-white/60 animate-shrink"
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      </div>
    </div>
  )
}

export function showToast(type: ToastType, message: string, duration = 4000) {
  sonnerToast.custom(
    (id) => (
      <CustomToastContent id={id} type={type} message={message} duration={duration} />
    ),
    { duration }
  )
}

export const customToast = {
  success: (message: string) => showToast("success", message),
  error: (message: string) => showToast("error", message),
  info: (message: string) => showToast("info", message),
  warning: (message: string) => showToast("warning", message),
}
