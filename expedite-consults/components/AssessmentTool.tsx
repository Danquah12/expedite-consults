'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data (we will expand this)
const questions = [
    {
        id: 1,
        question: "Do you have formal Incident Response and Disaster Recovery plans documented?",
        options: [
            { text: "Yes, fully documented and tested annually.", score: 10 },
            { text: "Documented, but rarely tested.", score: 5 },
            { text: "We have an informal plan.", score: 2 },
            { text: "No plan currently exists.", score: 0 },
        ],
    },
    {
        id: 2,
        question: "How do you manage privileged access to sensitive systems?",
        options: [
            { text: "Full Zero Trust Architecture with MFA everywhere.", score: 10 },
            { text: "MFA on VPN and major apps, PAM for admins.", score: 7 },
            { text: "MFA on some external systems.", score: 3 },
            { text: "Just usernames and complex passwords.", score: 0 },
        ],
    },
    {
        id: 3,
        question: "Do you perform regular vulnerability scanning and penetration testing?",
        options: [
            { text: "Continuous scanning + Annual manual pentesting.", score: 10 },
            { text: "Quarterly automated scans.", score: 5 },
            { text: "Occasional ad-hoc scans.", score: 2 },
            { text: "No formal scanning program.", score: 0 },
        ],
    },
    {
        id: 4,
        question: "Are security logs centralized, monitored, and retained according to policy?",
        options: [
            { text: "Yes, full SIEM with 24/7 SOC monitoring.", score: 10 },
            { text: "Logs centralized, but alert-driven monitoring only.", score: 6 },
            { text: "Logs kept locally, reviewed if an issue occurs.", score: 2 },
            { text: "No centralized logging.", score: 0 },
        ],
    },
];

export default function AssessmentTool() {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [showResults, setShowResults] = useState(false);

    const handleAnswer = (score: number) => {
        const newAnswers = [...answers, score];
        setAnswers(newAnswers);

        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setShowResults(true);
        }
    };

    const calculateScore = () => {
        const total = answers.reduce((acc, curr) => acc + curr, 0);
        const maxScore = questions.length * 10;
        return Math.round((total / maxScore) * 100);
    };

    const resetAssessment = () => {
        setCurrentStep(0);
        setAnswers([]);
        setShowResults(false);
    };

    return (
        <div className="w-full max-w-3xl mx-auto bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            {/* Decorative background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-blue-500/10 blur-[100px] pointer-events-none" />

            <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Federal Compliance Readiness Assessment
            </h2>

            <div className="relative min-h-[400px]">
                <AnimatePresence mode="wait">
                    {!showResults ? (
                        <motion.div
                            key={`question-${currentStep}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0"
                        >
                            <div className="mb-8">
                                <div className="flex justify-between text-sm text-gray-400 mb-2">
                                    <span>Question {currentStep + 1} of {questions.length}</span>
                                    <span>{Math.round(((currentStep) / questions.length) * 100)}% Complete</span>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${((currentStep) / questions.length) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <h3 className="text-2xl font-semibold mb-6 leading-relaxed">
                                {questions[currentStep].question}
                            </h3>

                            <div className="space-y-4">
                                {questions[currentStep].options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswer(option.score)}
                                        className="w-full text-left p-4 rounded-xl border border-gray-800 bg-gray-900/40 hover:bg-gray-800 hover:border-blue-500/50 transition-all group flex items-start gap-4"
                                    >
                                        <div className="mt-1 w-5 h-5 rounded-full border border-gray-600 group-hover:border-blue-400 flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="text-gray-300 group-hover:text-white transition-colors">
                                            {option.text}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 flex flex-col items-center justify-center text-center"
                        >
                            <div className="mb-6 relative">
                                <svg className="w-48 h-48 transform -rotate-90">
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="88"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="transparent"
                                        className="text-gray-800"
                                    />
                                    <motion.circle
                                        cx="96"
                                        cy="96"
                                        r="88"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="transparent"
                                        strokeDasharray={2 * Math.PI * 88}
                                        initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                                        animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - calculateScore() / 100) }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className={`${calculateScore() >= 80 ? 'text-green-500' :
                                                calculateScore() >= 50 ? 'text-yellow-500' : 'text-red-500'
                                            }`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl font-bold">{calculateScore()}</span>
                                    <span className="text-sm text-gray-400 mt-1">/100</span>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold mb-4">
                                {calculateScore() >= 80 ? 'Strong Posture' : calculateScore() >= 50 ? 'Moderate Risk' : 'High Risk Area'}
                            </h3>
                            <p className="text-gray-400 mb-8 max-w-md">
                                Based on your answers, your organization may have gaps in meeting federal compliance mandates (NIST 800-171, FedRAMP).
                            </p>

                            <div className="w-full max-w-md bg-gray-900 border border-gray-800 p-6 rounded-xl text-left">
                                <h4 className="font-semibold mb-4">Unlock Full Detailed Report</h4>
                                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Lead Captured!"); resetAssessment(); }}>
                                    <input type="email" placeholder="Work Email" required className="w-full bg-gray-800 border-none rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-colors">
                                        Get Actionable Mitigation Guide
                                    </button>
                                </form>
                            </div>

                            <button onClick={resetAssessment} className="mt-6 text-sm text-gray-500 hover:text-gray-300">
                                Retake Assessment
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
