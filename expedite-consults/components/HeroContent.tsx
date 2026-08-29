"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";

import { routes } from "@/constant/routes";
import { highlightLastWord } from "@/lib/utils";

interface HeroContentProps {
    heroHeading: string;
    heroSubheading: string;
}

export default function HeroContent({ heroHeading, heroSubheading }: HeroContentProps) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 70,
                damping: 15,
            },
        },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className=" max-w-[750px] font-medium text-white"
        >
            <motion.div variants={itemVariants} className="flex items-center gap-2 mb-6 text-primary px-4 py-2 rounded-full w-fit bg-primary/10 border border-primary/20 backdrop-blur-md shadow-[0_0_15px_rgba(67,187,209,0.15)]">
                <ShieldCheck className="size-4" />
                <span className="text-xs font-semibold tracking-wide uppercase">Trusted Cybersecurity Solutions</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl/tight font-bold tracking-tight">
                {highlightLastWord(heroHeading ?? "")}
            </motion.h1>

            <motion.span
                variants={itemVariants}
                aria-hidden="true"
                className="block my-6 rounded-full lg:my-8 w-2/3 max-w-[300px] h-[2px] bg-gradient-to-r from-primary via-primary/50 to-transparent"
            />

            <motion.div variants={itemVariants} className="text-base md:text-lg lg:text-xl max-w-[600px] text-white/90 font-light leading-relaxed">
                {heroSubheading ?? ""}
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-5 mt-10">
                <Link
                    href={routes.incidentResponse}
                    className="text-sm border border-transparent hover:border-white/20 text-white font-semibold lg:text-base mb-0 px-8 py-3.5 bg-primary/80 hover:bg-primary backdrop-blur-md shadow-lg shadow-primary/20 transition-all duration-300 rounded-[4px] relative overflow-hidden group"
                >
                    <span className="relative z-10 flex items-center gap-2">Get Immediate Help</span>
                    <div className="absolute inset-0 h-full w-0 bg-white/20 transition-all duration-500 ease-out group-hover:w-full"></div>
                </Link>
                <Link
                    href={routes.assessment}
                    className="text-sm border border-blue-500/50 hover:border-blue-400 text-white font-medium lg:text-base mb-0 px-8 py-3.5 bg-blue-600/20 hover:bg-blue-600/30 backdrop-blur-md transition-all duration-300 rounded-[4px] shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                >
                    Free Compliance Assessment
                </Link>
            </motion.div>
        </motion.div>
    );
}
