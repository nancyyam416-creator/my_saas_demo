import React from 'react';
import { SimulationState } from '../types';
import { User, Thermometer, Droplets, Power, Zap } from 'lucide-react';

interface SimulationPanelProps {
  state: SimulationState;
  updateState: (newState: Partial<SimulationState>) => void;
  triggerEntry: () => void;
  triggerExit: () => void;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({ 
  state, 
  updateState, 
  triggerEntry, 
  triggerExit 
}) => {
  return (
    <div className="fixed right-6 top-24 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-10 transition-all">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          IoT 模拟器 (101室)
        </h3>
        <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 animate-pulse">
          实时
        </span>
      </div>

      <div className="p-4 space-y-6">
        {/* Occupancy Control */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
            人员监控 (人脸识别)
          </label>
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${state.roomOccupancy > 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                <User size={20} />
              </div>
              <div>
                <span className="block text-2xl font-bold text-slate-800">{state.roomOccupancy}</span>
                <span className="text-xs text-slate-500">当前人数</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <button 
                onClick={triggerEntry}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded transition-colors"
              >
                + 进入
              </button>
              <button 
                onClick={triggerExit}
                disabled={state.roomOccupancy <= 0}
                className="px-3 py-1 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 text-white text-xs font-medium rounded transition-colors"
              >
                - 离开
              </button>
            </div>
          </div>
        </div>

        {/* Temperature Control */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
            环境传感器
          </label>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2 text-slate-700">
                <Thermometer size={16} />
                <span className="text-sm font-medium">室内温度</span>
              </div>
              <span className="text-lg font-bold text-slate-800">{state.roomTemperature}°C</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="40" 
              value={state.roomTemperature} 
              onChange={(e) => updateState({ roomTemperature: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>10°C</span>
              <span>25°C</span>
              <span>40°C</span>
            </div>
          </div>
        </div>

        {/* Water Usage Simulation */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
            资源使用模拟
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => updateState({ accumulatedWater: state.accumulatedWater + 10 })}
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
            >
              <Droplets className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-xs font-medium text-slate-600">+10L 用水</span>
            </button>
             <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 bg-slate-50">
              <span className="text-xs text-slate-500">当前负载</span>
              <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                 <Zap size={12} className={state.powerState ? 'text-amber-500' : 'text-slate-300'} fill="currentColor" />
                 {state.powerState ? (state.acState ? '1.2 kW' : '0.1 kW') : '0 kW'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Device Status Indicators */}
        <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-4">
           <div className="flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${state.powerState ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-400'}`} />
             <span className="text-xs font-medium text-slate-600">总电源</span>
           </div>
           <div className="flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${state.acState ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-300'}`} />
             <span className="text-xs font-medium text-slate-600">空调设备</span>
           </div>
        </div>
      </div>
      
      <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 text-[10px] text-slate-400 text-center">
        变更将实时反映在仪表盘中
      </div>
    </div>
  );
};

// Helper component for Icon
function Cpu(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
      <rect x="9" y="9" width="6" height="6"></rect>
      <line x1="9" y1="1" x2="9" y2="4"></line>
      <line x1="15" y1="1" x2="15" y2="4"></line>
      <line x1="9" y1="20" x2="9" y2="23"></line>
      <line x1="15" y1="20" x2="15" y2="23"></line>
      <line x1="20" y1="9" x2="23" y2="9"></line>
      <line x1="20" y1="14" x2="23" y2="14"></line>
      <line x1="1" y1="9" x2="4" y2="9"></line>
      <line x1="1" y1="14" x2="4" y2="14"></line>
    </svg>
  );
}