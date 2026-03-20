"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { DashboardLayout } from "@/components/DashboardLayout";

interface Factor {
  name: string;
  points: number;
  max_points: number;
  description: string;
  impact: "positive" | "negative" | "neutral";
}

interface CreditScoreData {
  score: number;
  rating: string;
  color: string;
  factors: Factor[];
  rating_breakdown: Record<string, { min: number; max: number }>;
  tips: string[];
}

const RATING_COLORS: Record<string, string> = {
  Poor: "#ef4444",
  Fair: "#f59e0b",
  Good: "#22c55e",
  "Very Good": "#3b82f6",
  Excellent: "#8b5cf6",
};

const RATING_ORDER = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

export default function CreditScorePage() {
  const [data, setData] = useState<CreditScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCreditScore();
  }, []);

  const fetchCreditScore = async () => {
    try {
      const response = await api.get("/users/credit-score/");
      setData(response.data);
    } catch {
      setError("Failed to load credit score");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
          <p className="text-red-300 text-lg">{error || "Unable to load credit score"}</p>
          <button onClick={() => { setLoading(true); setError(""); fetchCreditScore(); }}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-colors">
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Gauge calculations — semicircle arc from 300 to 850
  const scoreRange = 850 - 300;
  const scorePct = Math.max(0, Math.min(1, (data.score - 300) / scoreRange));
  const angle = 180 * scorePct; // 0° to 180°
  const gaugeRadius = 100;
  const gaugeStroke = 18;
  const cx = 120;
  const cy = 115;

  // SVG arc endpoint for the colored portion
  const endAngleRad = ((180 - angle) * Math.PI) / 180;
  const arcX = cx + gaugeRadius * Math.cos(endAngleRad);
  const arcY = cy - gaugeRadius * Math.sin(endAngleRad);
  const largeArc = angle > 180 ? 1 : 0;

  // Needle endpoint
  const needleLen = gaugeRadius - 10;
  const needleAngleRad = ((180 - angle) * Math.PI) / 180;
  const nX = cx + needleLen * Math.cos(needleAngleRad);
  const nY = cy - needleLen * Math.sin(needleAngleRad);

  const scoreColor = RATING_COLORS[data.rating] || "#8b5cf6";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Credit Score</h1>
          <p className="text-purple-300">Your simulated credit score based on banking activity</p>
        </div>

        {/* Score Gauge Card */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/20">
          <div className="flex flex-col items-center">
            <svg width="240" height="140" viewBox="0 0 240 140">
              {/* Background arc */}
              <path
                d={`M ${cx - gaugeRadius} ${cy} A ${gaugeRadius} ${gaugeRadius} 0 0 1 ${cx + gaugeRadius} ${cy}`}
                fill="none" stroke="#334155" strokeWidth={gaugeStroke} strokeLinecap="round"
              />
              {/* Colored arc */}
              {angle > 0 && (
                <path
                  d={`M ${cx + gaugeRadius} ${cy} A ${gaugeRadius} ${gaugeRadius} 0 ${largeArc} 1 ${arcX} ${arcY}`}
                  fill="none" stroke={scoreColor} strokeWidth={gaugeStroke} strokeLinecap="round"
                />
              )}
              {/* Needle */}
              <line x1={cx} y1={cy} x2={nX} y2={nY} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx={cx} cy={cy} r="5" fill="white" />
              {/* Min/Max labels */}
              <text x={cx - gaugeRadius - 5} y={cy + 18} textAnchor="middle" fill="#94a3b8" fontSize="11">300</text>
              <text x={cx + gaugeRadius + 5} y={cy + 18} textAnchor="middle" fill="#94a3b8" fontSize="11">850</text>
            </svg>

            <div className="text-center -mt-2">
              <div className="text-5xl font-bold text-white">{data.score}</div>
              <div className="mt-1 px-4 py-1.5 rounded-full text-sm font-semibold inline-block" style={{ backgroundColor: `${scoreColor}20`, color: scoreColor, border: `1px solid ${scoreColor}40` }}>
                {data.rating}
              </div>
            </div>
          </div>

          {/* Rating Scale Bar */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="flex rounded-full overflow-hidden h-3">
              {RATING_ORDER.map((r) => (
                <div key={r} className="flex-1" style={{ backgroundColor: RATING_COLORS[r] }} />
              ))}
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-purple-400">
              {RATING_ORDER.map((r) => (
                <span key={r} className={data.rating === r ? "text-white font-bold" : ""}>{r}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Factor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.factors.map((factor) => {
            const pct = (factor.points / factor.max_points) * 100;
            const barColor = pct >= 70 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444";
            const impactColor = factor.impact === "positive" ? "text-emerald-400" : factor.impact === "negative" ? "text-red-400" : "text-purple-400";
            const impactIcon = factor.impact === "positive" ? "▲" : factor.impact === "negative" ? "▼" : "●";
            return (
              <div key={factor.name} className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-5 border border-purple-500/20">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-white font-semibold text-sm">{factor.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${impactColor}`}>{impactIcon} {factor.impact}</span>
                    <span className="text-white font-bold text-sm">{factor.points}/{factor.max_points}</span>
                  </div>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2.5 mb-3">
                  <div className="h-2.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                </div>
                <p className="text-purple-300 text-xs leading-relaxed">{factor.description}</p>
              </div>
            );
          })}
        </div>

        {/* Tips Section */}
        {data.tips.length > 0 && (
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM4 11a1 1 0 100-2H3a1 1 0 000 2h1zM10 18a1 1 0 001-1v-1a1 1 0 10-2 0v1a1 1 0 001 1z" />
                <path fillRule="evenodd" d="M10 2a6 6 0 00-3.815 10.631C7.237 13.723 8 14.978 8 16.4V17a2 2 0 104 0v-.6c0-1.422.763-2.677 1.815-3.769A6 6 0 0010 2zm0 2a4 4 0 00-2.545 7.088c.838.86 1.545 1.889 1.545 3.312V15h2v-.6c0-1.423.707-2.452 1.545-3.312A4 4 0 0010 4z" clipRule="evenodd" />
              </svg>
              Tips to Improve Your Score
            </h2>
            <div className="space-y-3">
              {data.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 bg-slate-800/40 rounded-xl p-3.5">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-400 text-xs font-bold">{i + 1}</span>
                  </div>
                  <p className="text-purple-200 text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Score History Placeholder */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/20 text-center">
          <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Score History</h3>
          <p className="text-purple-300">Score tracking over time will be available soon</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
