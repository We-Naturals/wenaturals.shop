"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export function RootTransition({ children }: { children: ReactNode }) {
    return (
        <motion.main
            initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
            {children}
        </motion.main>
    );
}
