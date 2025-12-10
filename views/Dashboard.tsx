import React, { useState, useEffect } from 'react';
import { SimulationState, BillingAccount, Alarm } from '../types';
import { analyzeSystemState } from '../services/geminiService';
import { 
  Zap, 
  Droplets, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  Activity,
  Bot
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  simState: SimulationState;
  billing: BillingAccount;
  alarms: Alarm[];
}

export const Dashboard: React.FC<DashboardProps> = ({ simState, billing, alarms }) => {
  const [aiInsight, setAiInsight] = useState<string>("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Trigger AI analysis when relevant state changes significantly or on mount
  useEffect(() => {
    const fetchInsight = async () => {
      setIsLoadingAi(true);
      const insight = await analyzeSystemState(simState, alarms, billing);
      setAiInsight(insight);
      setIsLoadingAi(false);
    };
    
    // Debounce simple effect
    const timer = setTimeout(() => {
      fetchInsight();
    }, 1000);

    return () => clearTimeout(timer);
  }, [simState.roomOccupancy, simState.powerState, alarms.length]);

  const stats = [
    { 
      label: '总电源', 
      value: simState.powerState ? '通电' : '断电', 
      icon: Zap, 
      color: simState.powerState ? 'text-green-600' : 'text-slate-400',
      bg: simState.powerState ? 'bg-green-100' : 'bg-slate-100'
    },
    { 
      label: '今日用水', 
      value: `${billing.dailyWaterUsage} L`, 
      icon: Droplets, 
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    { 
      label: '在室人数', 
      value: simState.roomOccupancy, 
      icon: Users, 
      color: 'text-indigo-600',
      bg: 'bg-indigo-100'
    },
    { 
      label: '活跃报警', 
      value: alarms.length, 
      icon: AlertTriangle, 
      color: alarms.length > 0 ? 'text-red-600' : 'text-slate-400',
      bg: alarms.length > 0 ? 'bg-red-100' : 'bg-slate-100'
    },
  ];

  // Mock data for charts
  const usageData = [
    { name: '周一', water: 40, elec: 2.4 },
    { name: '周二', water: 65, elec: 3.1 },
    { name: '周三', water: 30, elec: 1.8 },
    { name: '周四', water: billing.dailyWaterUsage, elec: 5.2 }, // Use current state for today
    { name: '周五', water: 0, elec: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">101 宿舍概览</h2>
          <p className="text-slate-500">实时监控与策略执行</p>
        </div>
        <div className="flex gap-2">
            {simState.powerState ? (
                <span className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full border border-green-200 text-sm font-medium">
                    <Activity size={16} className="animate-pulse" /> 电网在线
                </span>
            ) : (
                <span className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-full border border-slate-200 text-sm font-medium">
                    <PowerOffIcon size={16} /> 自动断电
                </span>
            )}
        </div>
      </div>

      {/* AI Copilot Card */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-white opacity-5 rounded-full transform translate-x-10 -translate-y-10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
             <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
               <Bot size={24} className="text-white" />
             </div>
             <h3 className="font-semibold text-lg">AI 策略助手</h3>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
             {isLoadingAi ? (
                 <div className="flex items-center gap-2 text-indigo-100 animate-pulse">
                     <div className="w-2 h-2 bg-indigo-300 rounded-full"></div>
                     <div className="w-2 h-2 bg-indigo-300 rounded-full animation-delay-200"></div>
                     <div className="w-2 h-2 bg-indigo-300 rounded-full animation-delay-400"></div>
                     <span className="text-sm">正在分析遥测数据...</span>
                 </div>
             ) : (
                 <p className="text-indigo-50 leading-relaxed text-sm">
                     {aiInsight}
                 </p>
             )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between transition-transform hover:-translate-y-1">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">能耗趋势</h3>
            <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-2 text-slate-500"><div className="w-3 h-3 bg-blue-500 rounded-full"></div>用水 (L)</span>
                <span className="flex items-center gap-2 text-slate-500"><div className="w-3 h-3 bg-indigo-500 rounded-full"></div>用电 (kWh)</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="water" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="elec" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Rules Status */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4">生效逻辑</h3>
            <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-slate-700">自动断电策略</p>
                        <p className="text-xs text-slate-500">触发条件: 人数 = 0</p>
                        <p className="text-xs text-slate-500 mt-1">状态: {simState.roomOccupancy === 0 ? <span className="text-emerald-600 font-bold">激活 (已断电)</span> : <span className="text-slate-400">待机 (有人)</span>}</p>
                    </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-slate-700">温控免单策略</p>
                        <p className="text-xs text-slate-500">免费区间: 26°C - 30°C</p>
                        <p className="text-xs text-slate-500 mt-1">当前: {simState.roomTemperature}°C ({simState.roomTemperature >= 26 && simState.roomTemperature <= 30 ? '免费' : '付费'})</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const PowerOffIcon = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
        <line x1="12" y1="2" x2="12" y2="12"></line>
    </svg>
)