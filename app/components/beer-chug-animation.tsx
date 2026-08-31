"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface BeerChugAnimationProps {
  isOpen: boolean
  playerName: string
  sipsCount?: number
  onClose: () => void
  durationSeconds?: number
}

export function BeerChugAnimation({
  isOpen,
  playerName,
  sipsCount = 1,
  onClose,
  durationSeconds = 6,
}: BeerChugAnimationProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds)
  const [isChugging, setIsChugging] = useState(false)
  const [isFinished, setIsFinished] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(durationSeconds)
      setIsChugging(true)
      setIsFinished(false)
    }
  }, [isOpen, durationSeconds])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isOpen && isChugging && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsChugging(false)
            setIsFinished(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isOpen, isChugging, timeLeft])

  if (!isOpen) return null

  // Calculate percentage of beer remaining (100% down to 0%)
  const liquidPercent = (timeLeft / durationSeconds) * 100

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-zinc-950 border border-amber-500/30 rounded-3xl p-6 text-white text-center shadow-2xl overflow-hidden flex flex-col items-center"
        >
          {/* Top Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Banner */}
          <div className="mb-4">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-black font-extrabold text-xs uppercase px-4 py-1.5 rounded-full tracking-widest shadow-lg"
            >
              CHUG! CHUG! CHUG! 🍺
            </motion.div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white mt-2">
              {playerName} is Chugging!
            </h2>
            <p className="text-xs text-amber-400 font-bold uppercase tracking-wider mt-1">
              Penalty: {sipsCount} {sipsCount === 1 ? "Sip" : "Sips"} / Shot
            </p>
          </div>

          {/* Animated Beer Mug Container */}
          <div className="relative w-48 h-64 my-2 flex items-center justify-center">
            {/* Beer Mug Outer Handle */}
            <div className="absolute right-3 top-16 w-12 h-32 border-8 border-zinc-700/80 rounded-r-3xl border-l-0 z-0"></div>

            {/* Glass Body */}
            <div className="relative w-40 h-56 border-4 border-zinc-600/60 bg-zinc-900/40 rounded-b-3xl rounded-t-lg overflow-hidden shadow-2xl backdrop-blur-sm z-10 flex flex-col justify-end">
              
              {/* Foam Layer (moves down with liquid level) */}
              <motion.div
                className="w-full bg-amber-50 border-b-2 border-amber-200/50 shadow-md relative z-20 transition-all duration-1000 ease-linear"
                style={{
                  height: liquidPercent > 0 ? "24px" : "0px",
                }}
                animate={{
                  y: [0, -2, 0],
                }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
              >
                {/* Foam Bubbles Detail */}
                <div className="absolute inset-0 flex justify-around items-center opacity-60">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <div className="w-4 h-4 bg-white rounded-full -mt-1"></div>
                  <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                  <div className="w-3.5 h-3.5 bg-white rounded-full"></div>
                </div>
              </motion.div>

              {/* Golden Beer Liquid */}
              <motion.div
                className="w-full bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-400 relative overflow-hidden transition-all duration-1000 ease-linear"
                style={{
                  height: `${liquidPercent}%`,
                }}
              >
                {/* Animated Bubbles Floating Up */}
                {liquidPercent > 5 && (
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute bg-yellow-100/60 rounded-full"
                        style={{
                          width: `${Math.random() * 6 + 4}px`,
                          height: `${Math.random() * 6 + 4}px`,
                          left: `${(i + 1) * 11}%`,
                          bottom: "0%",
                        }}
                        animate={{
                          y: ["0%", "-200%"],
                          opacity: [0.8, 0],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5 + Math.random(),
                          delay: i * 0.2,
                          ease: "easeOut",
                        }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Timer & Status */}
          <div className="mt-3 w-full">
            {!isFinished ? (
              <div>
                <span className="font-mono text-3xl font-black text-amber-400">
                  {timeLeft}s
                </span>
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mt-1">
                  Bottoms Up! Don't Stop Drinking!
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="py-1"
              >
                <span className="text-xl font-extrabold uppercase text-green-400 tracking-wider block">
                  🎉 CHUG COMPLETE! 🎉
                </span>
                <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider mt-0.5">
                  Glass Empty! Legend status achieved.
                </p>
              </motion.div>
            )}

            <Button
              onClick={onClose}
              className="mt-4 w-full h-11 bg-amber-400 hover:bg-amber-300 text-black font-extrabold uppercase tracking-wider text-xs rounded-xl transition-all border-0 shadow-lg"
            >
              {isFinished ? "Continue Party" : "Skip / Done Chugging"}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
