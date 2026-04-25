"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react"
import {
  CircleDollarSign,
  CreditCard,
  Settings,
  Tag,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    href: "/dashboard",
    label: "订阅",
    en: "subs",
    icon: CreditCard,
    accent: "var(--nordic-sage)",
  },
  {
    href: "/categories",
    label: "分类",
    en: "cats",
    icon: Tag,
    accent: "var(--nordic-honey)",
  },
  {
    href: "/exchange-rates",
    label: "汇率",
    en: "rates",
    icon: CircleDollarSign,
    accent: "var(--nordic-clay)",
  },
  {
    href: "/settings",
    label: "设置",
    en: "pref",
    icon: Settings,
    accent: "var(--nordic-sand)",
  },
] as const

export function BottomNav() {
  const pathname = usePathname()
  const activeIndex = navItems.findIndex((it) =>
    it.href === "/dashboard"
      ? pathname === "/" || pathname.startsWith("/dashboard")
      : pathname.startsWith(it.href),
  )
  const activeItem = activeIndex >= 0 ? navItems[activeIndex] : null

  const [activeEl, setActiveEl] = useState<HTMLAnchorElement | null>(null)
  const [rect, setRect] = useState<
    { x: number; y: number; w: number; h: number } | null
  >(null)
  const [animated, setAnimated] = useState(false)
  const hasAnimatedRef = useRef(false)

  const handleActiveRef = useCallback((node: HTMLAnchorElement | null) => {
    setActiveEl(node)
  }, [])

  useLayoutEffect(() => {
    if (!activeEl) return
    const measure = () => {
      setRect({
        x: activeEl.offsetLeft,
        y: activeEl.offsetTop,
        w: activeEl.offsetWidth,
        h: activeEl.offsetHeight,
      })
      if (!hasAnimatedRef.current) {
        hasAnimatedRef.current = true
        requestAnimationFrame(() => setAnimated(true))
      }
    }
    const ro = new ResizeObserver(measure)
    ro.observe(activeEl)
    return () => ro.disconnect()
  }, [activeEl])

  return (
    <nav
      className="fixed left-1/2 z-50 -translate-x-1/2"
      style={{ bottom: "calc(24px + env(safe-area-inset-bottom))" }}
      aria-label="主导航"
    >
      {/* 外岛壳 */}
      <div
        className={cn(
          "relative flex max-w-[calc(100vw-16px)] items-stretch gap-1.5 overflow-hidden",
          "rounded-[32px] border border-[color:var(--border)]/60",
          "bg-[color:var(--card)]/82 backdrop-blur-xl",
          "px-3 py-2.5",
          // 三层合成阴影：浅贴地投影 + 中景 + 远景扩散
          "shadow-[0_1px_1px_oklch(0.22_0.015_55/0.04),0_6px_16px_-6px_oklch(0.22_0.015_55/0.10),0_24px_60px_-18px_oklch(0.22_0.015_55/0.14)]",
          "dark:shadow-[0_1px_1px_oklch(0_0_0/0.30),0_10px_22px_-6px_oklch(0_0_0/0.32),0_32px_72px_-16px_oklch(0_0_0/0.48)]",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {/* 顶部高光 hairline：呼应 demo 的 nordic-hairline */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[color:var(--border)] to-transparent"
        />

        {/* Active 嵌入块 */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-0 top-0",
            "rounded-[22px] bg-[color:var(--card-sunken)]",
            "ring-1 ring-[color:var(--border)]",
            // 内层玻璃高光
            "shadow-[inset_0_1px_0_color-mix(in_oklch,white,transparent_72%)]",
            "dark:shadow-[inset_0_1px_0_color-mix(in_oklch,white,transparent_88%)]",
            animated
              ? "transition-[transform,width,height] duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              : "",
            rect ? "opacity-100" : "opacity-0",
          )}
          style={
            (rect
              ? {
                  transform: `translate3d(${rect.x}px, ${rect.y}px, 0)`,
                  width: rect.w,
                  height: rect.h,
                }
              : undefined) as CSSProperties | undefined
          }
        />

        {/* Active 底部色条：北欧 tier 色，随 active 平移、颜色淡入 */}
        {activeItem && rect && (
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute left-0 top-0 h-[2px] rounded-full",
              animated
                ? "transition-[transform,width,background-color] duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                : "",
            )}
            style={{
              transform: `translate3d(${rect.x + rect.w / 2 - 10}px, ${
                rect.y + rect.h - 7
              }px, 0)`,
              width: 20,
              backgroundColor: activeItem.accent,
            }}
          />
        )}

        {navItems.map((it, i) => {
          const Icon = it.icon
          const active = activeIndex === i
          return (
            <Link
              key={it.href}
              href={it.href}
              ref={active ? handleActiveRef : undefined}
              className={cn(
                "group relative z-10 flex min-w-[92px] flex-shrink-0 flex-col items-center justify-center gap-1.5",
                "rounded-[22px] px-4 py-3",
                "transition-colors duration-200",
                active
                  ? "text-[color:var(--nordic-cocoa)]"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              {/* 微呼吸点：demo 里 nordic-dot-active 的再现 */}
              <span
                aria-hidden
                className={cn(
                  "absolute left-1/2 top-[6px] h-1.5 w-1.5 -translate-x-1/2 rounded-full",
                  "transition-opacity duration-200",
                  active ? "opacity-100" : "opacity-0",
                )}
                style={{
                  backgroundColor: it.accent,
                  boxShadow: active
                    ? `0 0 0 4px color-mix(in oklch, ${it.accent}, transparent 82%)`
                    : undefined,
                  animation: active
                    ? "nordic-breathe 2.6s ease-in-out infinite"
                    : undefined,
                }}
              />

              <Icon className="h-[22px] w-[22px]" strokeWidth={1.4} />

              {/* 双语 label：中文主 + serif 英文副 */}
              <span className="flex flex-col items-center leading-none">
                <span className="text-[13px] font-medium tracking-[0.02em]">
                  {it.label}
                </span>
                <span
                  className={cn(
                    "font-display mt-1 text-[9px] italic tracking-[0.18em]",
                    "transition-opacity duration-200",
                    active
                      ? "opacity-55"
                      : "opacity-35 group-hover:opacity-45",
                  )}
                >
                  {it.en}
                </span>
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
