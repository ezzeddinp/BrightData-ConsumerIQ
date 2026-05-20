import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"

const stitchScreens = {
  onboardingSignup: {
    src: "/stitch/onboarding-signup.html",
    title: "ConsumerIQ Onboarding - Signup (Restyled)",
  },
  onboardingSurvey: {
    src: "/stitch/onboarding-intelligence-survey.html",
    title: "ConsumerIQ Onboarding - Intelligence Survey (Restyled)",
  },
  onboardingMarket: {
    src: "/stitch/onboarding-market-preferences.html",
    title: "ConsumerIQ Onboarding - Market Preferences (Restyled)",
  },
  onboardingGenerating: {
    src: "/stitch/onboarding-generating-intelligence.html",
    title: "ConsumerIQ Onboarding - Generating Intelligence (Restyled)",
  },
  marketOverview: {
    src: "/stitch/market-intelligence-overview.html",
    title: "ConsumerIQ - Market Intelligence Overview (Vercel Style)",
  },
  demandPulse: {
    src: "/stitch/demand-pulse.html",
    title: "ConsumerIQ - Demand Pulse (Unified)",
  },
  personaDecode: {
    src: "/stitch/persona-decode.html",
    title: "ConsumerIQ - Persona Decode (Unified v2)",
  },
  competitorMirror: {
    src: "/stitch/competitor-mirror.html",
    title: "ConsumerIQ - Competitor Mirror (Restyled v2)",
  },
  launchCompass: {
    src: "/stitch/launch-compass.html",
    title: "ConsumerIQ - Launch Compass (Restyled v2)",
  },
  dataSettings: {
    src: "/stitch/data-settings.html",
    title: "ConsumerIQ - Data Settings (Restyled v2)",
  },
}

type OnboardingStage = "step-1" | "step-2" | "step-3" | "ai-process"

const onboardingSequence: Record<OnboardingStage, typeof stitchScreens.onboardingSignup> = {
  "step-1": stitchScreens.onboardingSignup,
  "step-2": stitchScreens.onboardingSurvey,
  "step-3": stitchScreens.onboardingMarket,
  "ai-process": stitchScreens.onboardingGenerating,
}

const dashboardOrder = [
  "marketOverview",
  "demandPulse",
  "personaDecode",
  "competitorMirror",
  "launchCompass",
  "dataSettings",
] as const

type DashboardKey = (typeof dashboardOrder)[number]

function StitchFrame({
  className,
  iframeRef,
  onLoad,
  src,
  title,
}: {
  className?: string
  iframeRef?: React.RefObject<HTMLIFrameElement>
  onLoad?: () => void
  src: string
  title: string
}) {
  return (
    <div className={cn("h-full w-full", className)}>
      <iframe
        ref={iframeRef}
        className="h-full w-full min-h-screen border-0"
        onLoad={onLoad}
        src={src}
        title={title}
      />
    </div>
  )
}

function shouldIgnoreKeyEvent(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const tag = target.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable
}

export function ConsumerIQOnboarding({
  onComplete,
}: {
  onComplete: () => void
}) {
  const [stage, setStage] = useState<OnboardingStage>("step-1")
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (stage !== "ai-process") {
      return
    }

    const timeout = window.setTimeout(() => {
      onComplete()
    }, 1600)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [onComplete, stage])

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (shouldIgnoreKeyEvent(event.target)) {
        return
      }

      if (event.key === "ArrowRight" || event.key === "Enter") {
        if (stage === "step-1") {
          setStage("step-2")
        } else if (stage === "step-2") {
          setStage("step-3")
        } else if (stage === "step-3") {
          setStage("ai-process")
        }
      }

      if (event.key === "ArrowLeft") {
        if (stage === "step-2") {
          setStage("step-1")
        } else if (stage === "step-3") {
          setStage("step-2")
        }
      }
    }

    window.addEventListener("keydown", handleKey)
    return () => {
      window.removeEventListener("keydown", handleKey)
    }
  }, [stage])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) {
      return
    }

    const handlers: Array<{
      button: HTMLButtonElement
      handler: (event: MouseEvent) => void
    }> = []

    const normalize = (value: string) =>
      value
        .toLowerCase()
        .replace(/arrow_forward|chevron_right/gi, " ")
        .replace(/[^a-z\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim()

    const getNextStage = (
      label: string,
      currentStage: OnboardingStage,
    ): OnboardingStage | null => {
      if (!label) {
        return null
      }

      if (label.includes("back")) {
        if (currentStage === "step-2") {
          return "step-1"
        }
        if (currentStage === "step-3") {
          return "step-2"
        }
        return null
      }

      if (label.includes("continue")) {
        if (currentStage === "step-1") {
          return "step-2"
        }
        if (currentStage === "step-2") {
          return "step-3"
        }
        if (currentStage === "step-3") {
          return "ai-process"
        }
      }

      if (label.includes("next step")) {
        return "ai-process"
      }

      if (label.includes("complete setup")) {
        return "ai-process"
      }

      if (label.includes("launch dashboard")) {
        return "ai-process"
      }

      return null
    }

    const attachHandlers = () => {
      const doc = iframe.contentDocument
      if (!doc) {
        return
      }

      const buttons = Array.from(doc.querySelectorAll("button"))
      buttons.forEach((button) => {
        const label = normalize(button.textContent ?? "")
        const nextStage = getNextStage(label, stage)
        if (!nextStage) {
          return
        }

        const handler = (event: MouseEvent) => {
          if (event.cancelable) {
            event.preventDefault()
          }
          event.stopPropagation()
          setStage(nextStage)
        }

        button.addEventListener("click", handler, true)
        handlers.push({ button, handler })
      })
    }

    const handleLoad = () => {
      attachHandlers()
    }

    iframe.addEventListener("load", handleLoad)
    if (iframe.contentDocument?.readyState === "complete") {
      attachHandlers()
    }

    return () => {
      iframe.removeEventListener("load", handleLoad)
      handlers.forEach(({ button, handler }) => {
        button.removeEventListener("click", handler, true)
      })
    }
  }, [stage])

  const frame = onboardingSequence[stage]

  return (
    <section className="min-h-screen bg-background text-foreground">
      <StitchFrame
        iframeRef={iframeRef}
        src={frame.src}
        title={frame.title}
      />
      <span className="sr-only">
        Tekan Enter atau panah kanan untuk lanjut, panah kiri untuk kembali.
      </span>
    </section>
  )
}

export function ConsumerIQDashboard({ className }: { className?: string }) {
  const [activeScreen, setActiveScreen] = useState<DashboardKey>(
    "marketOverview",
  )

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (shouldIgnoreKeyEvent(event.target)) {
        return
      }

      const indexFromKey = Number.parseInt(event.key, 10)
      if (indexFromKey >= 1 && indexFromKey <= dashboardOrder.length) {
        setActiveScreen(dashboardOrder[indexFromKey - 1])
        return
      }

      if (event.key === "ArrowRight") {
        setActiveScreen((previous) => {
          const index = dashboardOrder.indexOf(previous)
          return dashboardOrder[(index + 1) % dashboardOrder.length]
        })
      }

      if (event.key === "ArrowLeft") {
        setActiveScreen((previous) => {
          const index = dashboardOrder.indexOf(previous)
          return dashboardOrder[
            (index - 1 + dashboardOrder.length) % dashboardOrder.length
          ]
        })
      }
    }

    window.addEventListener("keydown", handleKey)
    return () => {
      window.removeEventListener("keydown", handleKey)
    }
  }, [])

  const frame = useMemo(() => {
    return stitchScreens[activeScreen]
  }, [activeScreen])

  return (
    <section
      className={cn("min-h-screen bg-background text-foreground", className)}
    >
      <StitchFrame src={frame.src} title={frame.title} />
      <span className="sr-only">
        Tekan 1-6 untuk pindah screen, panah kiri atau kanan untuk menggeser.
      </span>
    </section>
  )
}
