import AssessmentTool from '@/components/AssessmentTool';

export const metadata = {
    title: 'Compliance Readiness Assessment | Expedite Consults',
    description: 'Evaluate your organization\'s readiness for federal compliance (NIST 800-171, FedRAMP). Get an instant score and actionable mitigation plan.',
};

export default function AssessmentPage() {
    return (
        <div className="min-h-screen bg-black pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Grid & Effects */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 pointer-events-none" />
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto flex flex-col items-center">
                {/* Header Section */}
                <div className="text-center max-w-3xl mb-16 relative z-10">
                    <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm">
                        <span className="text-sm font-medium text-blue-400">
                            Free Technical Assessment
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
                        Measure Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Compliance Stance</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 leading-relaxed font-light">
                        In just 2 minutes, identify critical gaps in your security posture against NIST 800-171, FedRAMP, and CMMC frameworks. Receive an automated, actionable risk report.
                    </p>
                </div>

                {/* Assessment Tool Component */}
                <div className="w-full relative z-10">
                    <AssessmentTool />
                </div>

                {/* Trust Indicators */}
                <div className="mt-24 pt-12 border-t border-gray-800/50 w-full text-center">
                    <p className="text-sm text-gray-500 mb-6 uppercase tracking-widest font-semibold">Trusted by Security Leaders</p>
                    <div className="flex justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
                        {/* Placeholders for logos, assuming they exist or will be added */}
                        <div className="flex items-center gap-2"><span className="text-xl font-bold text-gray-400">GovTier</span></div>
                        <div className="flex items-center gap-2"><span className="text-xl font-bold text-gray-400">CyberDefend</span></div>
                        <div className="flex items-center gap-2"><span className="text-xl font-bold text-gray-400">FedSecure</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
