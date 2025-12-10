import React from 'react';
import { ArrowRight, Box, Play, Clock, Power } from 'lucide-react';

export const ControlPolicyView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">智能控制策略中心</h2>
          <p className="text-slate-500">定义设备与事件之间的自动化交互规则。</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          + 新建策略
        </button>
      </div>

      {/* Visual Rule Builder Visualization (Read Only for Demo) */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Policy Card 1: Power Off */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              人走断电 (空房)
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 bg-slate-200 px-2 py-1 rounded">优先级: 高</span>
              <div className="w-10 h-6 bg-emerald-500 rounded-full flex items-center p-1 cursor-pointer justify-end">
                 <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              
              {/* Trigger */}
              <div className="flex-1 bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300 w-full relative group hover:border-indigo-400 transition-colors">
                <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-indigo-100 text-indigo-600 p-1 rounded shadow-sm">
                    <Box size={14} />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">如果 (触发条件)</p>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded shadow-sm text-indigo-600">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="font-medium text-slate-700">人员变动</p>
                        <p className="text-sm text-slate-500">人数变为 0</p>
                    </div>
                </div>
              </div>

              <ArrowRight className="text-slate-300 transform rotate-90 md:rotate-0" />

              {/* Action */}
              <div className="flex-1 bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300 w-full relative group hover:border-indigo-400 transition-colors">
                 <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-rose-100 text-rose-600 p-1 rounded shadow-sm">
                    <Play size={14} />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">那么 (执行动作)</p>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded shadow-sm text-rose-500">
                        <Power size={20} />
                    </div>
                    <div>
                        <p className="font-medium text-slate-700">切断电源</p>
                        <p className="text-sm text-slate-500">操作设备: 总断路器</p>
                    </div>
                </div>
              </div>

              <ArrowRight className="text-slate-300 transform rotate-90 md:rotate-0" />

               {/* Result */}
               <div className="flex-1 bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300 w-full">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">执行日志</p>
                <div className="text-sm text-slate-600 font-mono bg-white p-2 rounded border border-slate-200">
                    [信息] 101室 电源已切断<br/>
                    [信息] 节能模式已激活
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Policy Card 2: Return Power */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              人来通电 (首次返回)
            </h3>
             <div className="w-10 h-6 bg-emerald-500 rounded-full flex items-center p-1 cursor-pointer justify-end">
                 <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </div>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Box size={16} /> <span>如果 <strong>人数 &gt; 0</strong> (从 0 变动)</span>
                <ArrowRight size={16} />
                <Play size={16} /> <span>那么 <strong>恢复供电</strong></span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};