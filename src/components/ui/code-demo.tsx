"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Share2, Zap, Play, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

// Define a simple graph structure
const nodes = [
    { id: 1, x: 50, y: 50 },
    { id: 2, x: 150, y: 30 },
    { id: 3, x: 150, y: 120 },
    { id: 4, x: 250, y: 50 },
    { id: 5, x: 250, y: 150 },
    { id: 6, x: 350, y: 100 },
]

const edges = [
    { from: 1, to: 2 }, { from: 1, to: 3 },
    { from: 2, to: 4 }, { from: 3, to: 4 },
    { from: 3, to: 5 }, { from: 4, to: 6 },
    { from: 5, to: 6 }
]

export function CodeDemo() {
    const [visited, setVisited] = useState<number[]>([])
    const [activeEdge, setActiveEdge] = useState<number | null>(null)
    const [isRunning, setIsRunning] = useState(false)

    const startTraversal = async () => {
        setIsRunning(true)
        setVisited([1])

        // Simple simulated BFS delay for visualization
        const sequence = [
            { v: [1, 2], e: 0 }, { v: [1, 2, 3], e: 1 },
            { v: [1, 2, 3, 4], e: 2 }, { v: [1, 2, 3, 4, 5], e: 4 },
            { v: [1, 2, 3, 4, 5, 6], e: 5 }
        ]

        for (const step of sequence) {
            await new Promise(r => setTimeout(r, 800))
            setVisited(step.v)
            setActiveEdge(step.e)
        }
        setIsRunning(false)
    }

    const reset = () => {
        setVisited([])
        setActiveEdge(null)
        setIsRunning(false)
    }

    return (
        <section className="py-24 relative bg-background overflow-hidden border-y border-border/50">
            <div className="container px-4 mx-auto z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                            <Zap className="w-3 h-3" />
                            Algorithm Visualizer
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                            Master Complex <span className="text-primary">Data Structures</span>
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8 max-w-125">
                            Visualize how algorithms traverse graphs, trees, and matrices in real-time.
                            CPAssist breaks down complex CP problems into digestible steps.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={startTraversal}
                                disabled={isRunning}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all disabled:opacity-50"
                            >
                                <Play className="w-4 h-4 fill-current" />
                                Run BFS Demo
                            </button>
                            <button
                                onClick={reset}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary border border-border font-semibold hover:bg-muted transition-all"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reset
                            </button>
                        </div>
                    </div>

                    <div className="relative aspect-square md:aspect-video bg-card/30 rounded-3xl border border-border backdrop-blur-sm p-8 overflow-hidden">
                        <svg className="w-full h-full" viewBox="0 0 400 200">
                            {/* Edges */}
                            {edges.map((edge, i) => {
                                const fromNode = nodes.find(n => n.id === edge.from)!
                                const toNode = nodes.find(n => n.id === edge.to)!
                                const isActive = visited.includes(edge.from) && visited.includes(edge.to)

                                return (
                                    <motion.line
                                        key={i}
                                        x1={fromNode.x} y1={fromNode.y}
                                        x2={toNode.x} y2={toNode.y}
                                        stroke={isActive ? "var(--color-primary)" : "var(--color-border)"}
                                        strokeWidth={isActive ? "2" : "1"}
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 1 }}
                                    />
                                )
                            })}

                            {/* Nodes */}
                            {nodes.map((node) => (
                                <motion.g key={node.id} initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                    <motion.circle
                                        cx={node.x} cy={node.y} r="12"
                                        className={cn(
                                            "transition-colors duration-500",
                                            visited.includes(node.id) ? "fill-primary" : "fill-card stroke-border"
                                        )}
                                        strokeWidth="2"
                                    />
                                    <text
                                        x={node.x} y={node.y + 4}
                                        textAnchor="middle"
                                        className="text-[8px] font-bold fill-background"
                                    >
                                        {node.id}
                                    </text>
                                </motion.g>
                            ))}
                        </svg>

                        {/* Floating Stats Card */}
                        <div className="absolute bottom-6 right-6 p-4 rounded-xl border border-border bg-background/80 backdrop-blur-md shadow-xl">
                            <div className="text-[10px] text-muted-foreground uppercase font-bold mb-2">Queue State</div>
                            <div className="flex gap-2">
                                {visited.slice(-3).map((v, i) => (
                                    <div key={i} className="w-6 h-6 rounded bg-primary/20 border border-primary/40 flex items-center justify-center text-xs text-primary font-mono">
                                        {v}
                                    </div>
                                ))}
                                <div className="w-6 h-6 rounded border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                                    ...
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background decoration from globals.css patterns */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--color-primary),transparent_70%)]" />
            </div>
        </section>
    )
}