import React from 'react';
import { BillingAccount, SimulationState } from '../types';
import { CreditCard, Thermometer, Droplets, Info } from 'lucide-react';

interface BillingViewProps {
    billing: BillingAccount;
    simState: SimulationState;
}

export const BillingView: React.FC<BillingViewProps> = ({ billing, simState }) => {
  const isAcFree = simState.roomTemperature >= 26 && simState.roomTemperature <= 30;
  const isWaterFree = billing.dailyWaterUsage < 80;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">通用计费引擎</h2>
          <p className="text-slate-500">配置不同资源的配额、费率和逻辑。</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
            <CreditCard className="text-slate-400" size={20} />
            <div className="flex flex-col items-end">
                <span className="text-xs text-slate-500">账户余额</span>
                <span className={`font-bold ${billing.balance < 10 ? 'text-red-500' : 'text-slate-800'}`}>¥{billing.balance.toFixed(2)}</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* AC Billing Logic */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                        <Thermometer size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">空调用电策略</h3>
                        <p className="text-xs text-slate-500">模板: 季节性标准</p>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${isAcFree ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {isAcFree ? '当前免费' : '当前计费'}
                </div>
            </div>
            
            <div className="p-6">
                <div className="mb-6 relative pt-6 pb-2">
                    <div className="h-4 bg-slate-100 rounded-full w-full overflow-hidden flex">
                        <div className="w-[30%] bg-orange-300/50 border-r border-white flex items-center justify-center text-[10px] text-orange-700 font-medium">付费 (&lt;26°)</div>
                        <div className="w-[40%] bg-emerald-400 flex items-center justify-center text-[10px] text-white font-medium shadow-inner">免费区间 (26-30°)</div>
                        <div className="w-[30%] bg-orange-300/50 border-l border-white flex items-center justify-center text-[10px] text-orange-700 font-medium">付费 (&gt;30°)</div>
                    </div>
                    {/* Current Temp Indicator */}
                    <div 
                        className="absolute top-0 w-1 h-12 bg-slate-800 transition-all duration-500 z-10"
                        style={{ left: `${Math.min(100, Math.max(0, (simState.roomTemperature - 10) / (40 - 10) * 100))}%` }}
                    >
                         <div className="absolute -top-6 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded">
                            {simState.roomTemperature}°C
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600 space-y-2">
                    <div className="flex justify-between">
                        <span>费率 (非免费区间)</span>
                        <span className="font-medium">0.50元 / 小时</span>
                    </div>
                    <div className="flex justify-between">
                        <span>额度抵扣</span>
                        <span className="font-medium">优先抵扣免费额度</span>
                    </div>
                </div>
            </div>
        </div>

         {/* Water Billing Logic */}
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Droplets size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">淋浴用水策略</h3>
                        <p className="text-xs text-slate-500">模板: 员工福利</p>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${isWaterFree ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {isWaterFree ? '额度内' : '超额计费'}
                </div>
            </div>
            
            <div className="p-6">
                <div className="flex justify-between text-sm mb-2 text-slate-600">
                    <span>今日用量</span>
                    <span className="font-medium">{billing.dailyWaterUsage}L / 80L (免费)</span>
                </div>
                <div className="h-4 bg-slate-100 rounded-full w-full overflow-hidden mb-6">
                    <div 
                        className={`h-full transition-all duration-500 ${billing.dailyWaterUsage > 80 ? 'bg-orange-500' : 'bg-blue-500'}`} 
                        style={{ width: `${Math.min(100, (billing.dailyWaterUsage / 120) * 100)}%` }}
                    />
                </div>

                <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600 space-y-2">
                    <div className="flex justify-between">
                        <span>超额费率</span>
                        <span className="font-medium">1.00元 / 升</span>
                    </div>
                    <div className="flex items-start gap-2 mt-2 pt-2 border-t border-slate-200 text-xs text-slate-500">
                        <Info size={14} className="mt-0.5" />
                        <p>余额不足时自动关阀。用户充值后恢复。</p>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};