import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    isPeerHovered?: boolean;
}

export function GlassCard({ children, className, isPeerHovered }: GlassCardProps) {
    return (
        <motion.div
            animate={{
                boxShadow: isPeerHovered ? [
                    "0 0 0px rgba(59, 130, 246, 0)",
                    "0 0 20px rgba(59, 130, 246, 0.1)",
                    "0 0 0px rgba(59, 130, 246, 0)"
                ] : "0 0 0px rgba(0,0,0,0)"
            }}
            transition={{
                boxShadow: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            className={cn(
                "glass-morphism p-6 transition-all duration-300 hover:scale-[1.02]",
                className
            )}
        >
            {children}
        </motion.div>
    );
}
