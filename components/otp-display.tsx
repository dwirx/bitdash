
'use client';

import { useEffect, useState } from 'react';
import { authenticator } from 'otplib';
import { motion } from 'framer-motion';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

export function OtpDisplay({ secret }: { secret: string }) {
    const [token, setToken] = useState('');
    const [nextToken, setNextToken] = useState('');
    const [timeLeft, setTimeLeft] = useState(30);
    const [showNext, setShowNext] = useState(true); // Default enabled for premium look

    useEffect(() => {
        if (!secret) return;

        // Create independent instance for next token by inheriting from global authenticator
        const nextAuth = Object.create(authenticator);
        // Shift epoch by -30 seconds to simulate "future" time relative to standard epoch
        nextAuth.options = { ...authenticator.allOptions(), epoch: -30 };

        const update = () => {
            try {
                const current = authenticator.generate(secret);
                setToken(current);

                const next = nextAuth.generate(secret);
                setNextToken(next);

                setTimeLeft(authenticator.timeRemaining());
            } catch (e) {
                console.error("Invalid secret", e);
                setToken('INVALID');
            }
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [secret]);

    const copyToClipboard = (text: string) => {
        if (!text || text === 'INVALID') return;
        navigator.clipboard.writeText(text);
        toast.success('OTP copied');
    };

    if (!secret) return <div className="text-zinc-500 text-sm">No Secret key</div>;

    // Radius for SVG circle
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (timeLeft / 30) * circumference;

    return (
        <div className="flex w-full relative h-[70px]">
            {/* Absolute Timer at Top Right (Visual trick: moves up to align with header if used in card) 
                Actually, let's keep it simple: Flex row.
            */}

            {/* Left Col: Main Token */}
            <div className="flex-1 flex items-end pb-1">
                <div
                    className="cursor-pointer group/main-token"
                    onClick={() => copyToClipboard(token)}
                >
                    <div className="text-3xl md:text-4xl font-mono tracking-wider text-white font-bold select-none tabular-nums drop-shadow-lg whitespace-nowrap">
                        {token.substring(0, 3)} {token.substring(3)}
                    </div>
                </div>
            </div>

            {/* Right Col: Timer & Next Token */}
            <div className="flex flex-col items-end justify-between h-full min-w-[80px]">

                {/* Circular Timer */}
                <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                    <svg className="transform -rotate-90 w-full h-full">
                        <circle
                            className="text-zinc-800"
                            strokeWidth="3"
                            stroke="currentColor"
                            fill="transparent"
                            r={radius}
                            cx="20"
                            cy="20"
                        />
                        <circle
                            className={`${timeLeft < 5 ? 'text-red-500' : 'text-purple-500'} transition-colors duration-300`}
                            strokeWidth="3"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r={radius}
                            cx="20"
                            cy="20"
                            style={{ transition: 'stroke-dashoffset 1s linear' }}
                        />
                    </svg>
                    <span className="absolute text-[10px] font-bold text-zinc-400 select-none">
                        {timeLeft}
                    </span>
                </div>

                {/* Next Token */}
                <div className="flex flex-col items-end opacity-60 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => copyToClipboard(nextToken)}>
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 mb-[-2px]">Next</span>
                    <span className="font-mono text-sm font-semibold text-zinc-300 tabular-nums">
                        {nextToken.substring(0, 3)} {nextToken.substring(3)}
                    </span>
                </div>
            </div>
        </div>
    );
}
