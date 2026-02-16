"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

/**
 * Internal helpers
 */
function composeEventHandlers<E>(
  theirHandler: ((event: E) => void) | undefined,
  ourHandler: (event: E) => void
) {
  return (event: E) => {
    theirHandler?.(event)
    ourHandler(event)
  }
}

function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue
      if (typeof ref === "function") ref(node)
      else (ref as React.MutableRefObject<T | null>).current = node
    }
  }
}

type TooltipCtxValue = {
  hovered: boolean
  setHovered: (v: boolean) => void
  pinned: boolean
  setPinned: (v: boolean) => void
  /** True when this Tooltip is managing open state itself */
  internal: boolean
  /** Used to detect clicks on the trigger so we don't treat them as outside-clicks */
  triggerRef: React.RefObject<React.ElementRef<typeof TooltipPrimitive.Trigger> | null>
}

const TooltipCtx = React.createContext<TooltipCtxValue | null>(null)

function useTooltipCtx() {
  return React.useContext(TooltipCtx)
}

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

/**
 * Tooltip
 *
 * Default behavior implemented here:
 * - Hover shows tooltip (temporary)
 * - Click/pointer down pins tooltip open
 * - Click outside / Escape closes (unpins)
 *
 * If consumer passes `open` prop, we consider it externally controlled and we do NOT apply pin/hover state.
 */
function Tooltip({
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  const isExternallyControlled = open !== undefined

  const [hovered, setHovered] = React.useState(Boolean(defaultOpen))
  const [pinned, _setPinned] = React.useState(false)

  // Ref used to avoid race conditions with Radix closing on pointer down.
  const pinnedRef = React.useRef(false)

  // Keep ref in sync for non-pointer paths (e.g., outside click handler).
  React.useEffect(() => {
    pinnedRef.current = pinned
  }, [pinned])

  const setPinned = React.useCallback((v: boolean) => {
    pinnedRef.current = v
    _setPinned(v)
  }, [])

  const triggerRef = React.useRef<React.ElementRef<typeof TooltipPrimitive.Trigger> | null>(null)

  const internalOpen = hovered || pinned

  // When we're controlling, ignore Radix close requests while pinned; otherwise allow close.
  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!isExternallyControlled) {
        // If pinned, keep it open regardless of Radix attempting to close.
        if (pinnedRef.current && !nextOpen) return

        // Keep hovered in sync with Radix-driven open changes (e.g., focus/blur)
        // but never auto-pin.
        setHovered(nextOpen)
      }

      onOpenChange?.(nextOpen)
    },
    [isExternallyControlled, onOpenChange]
  )

  const ctxValue = React.useMemo<TooltipCtxValue>(
    () => ({
      hovered,
      setHovered,
      pinned,
      setPinned,
      internal: !isExternallyControlled,
      triggerRef,
    }),
    [hovered, pinned, isExternallyControlled, setPinned]
  )

  return (
    <TooltipCtx.Provider value={ctxValue}>
      <TooltipPrimitive.Root
        data-slot="tooltip"
        // If externally controlled, pass through `open`; otherwise use our own state.
        open={isExternallyControlled ? open : internalOpen}
        // `defaultOpen` only matters for uncontrolled Radix usage; we manage initial state ourselves.
        onOpenChange={handleOpenChange}
        {...props}
      />
    </TooltipCtx.Provider>
  )
}

const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(
  (
    {
      onPointerEnter,
      onPointerLeave,
      onFocus,
      onBlur,
      onPointerDownCapture,
      onPointerDown,
      ...props
    },
    ref
  ) => {
    const ctx = useTooltipCtx()

    return (
      <TooltipPrimitive.Trigger
        ref={composeRefs(ref, ctx?.triggerRef)}
        data-slot="tooltip-trigger"
        onPointerEnter={composeEventHandlers(onPointerEnter, () => {
          if (!ctx?.internal) return
          ctx.setHovered(true)
        })}
        onPointerLeave={composeEventHandlers(onPointerLeave, () => {
          if (!ctx?.internal) return
          // Hover out hides only if not pinned.
          if (!ctx.pinned) ctx.setHovered(false)
        })}
        onFocus={composeEventHandlers(onFocus, () => {
          if (!ctx?.internal) return
          ctx.setHovered(true)
        })}
        onBlur={composeEventHandlers(onBlur, () => {
          if (!ctx?.internal) return
          if (!ctx.pinned) ctx.setHovered(false)
        })}
        onPointerDownCapture={composeEventHandlers(onPointerDownCapture, () => {
          if (!ctx?.internal) return
          // Pin as early as possible to avoid Radix closing on the same pointer down.
          ctx.setPinned(true)
          ctx.setHovered(true)
        })}
        onPointerDown={composeEventHandlers(onPointerDown, () => {
          if (!ctx?.internal) return
          // Pin open on click / pointer down.
          ctx.setPinned(true)
          ctx.setHovered(true)
        })}
        {...props}
      />
    )
  }
)
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName

type TooltipContentProps = React.ComponentProps<typeof TooltipPrimitive.Content> & {
  arrowClassName?: string
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  arrowClassName,
  onPointerEnter,
  onPointerLeave,
  onEscapeKeyDown,
  onPointerDownOutside,
  ...props
}: TooltipContentProps) {
  const ctx = useTooltipCtx()

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          className
        )}
        // Keep tooltip open while pointer is over the content in hover mode.
        onPointerEnter={composeEventHandlers(onPointerEnter, () => {
          if (!ctx?.internal) return
          ctx.setHovered(true)
        })}
        onPointerLeave={composeEventHandlers(onPointerLeave, () => {
          if (!ctx?.internal) return
          if (!ctx.pinned) ctx.setHovered(false)
        })}
        // Escape should unpin and close
        onEscapeKeyDown={composeEventHandlers(onEscapeKeyDown, () => {
          if (!ctx?.internal) return
          ctx.setPinned(false)
          ctx.setHovered(false)
        })}
        // Clicking outside should unpin and close
        onPointerDownOutside={composeEventHandlers(onPointerDownOutside, (event) => {
          if (!ctx?.internal) return

          // If the pointer down originated from the trigger, don't treat it as an outside click.
          const target =
            (event )?.detail?.originalEvent?.target ??
            (event )?.target

          if (target instanceof Node && ctx.triggerRef.current?.contains(target)) {
            return
          }

          ctx.setPinned(false)
          ctx.setHovered(false)
        })}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow
          className={cn(
            "bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]",
            arrowClassName
          )}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
