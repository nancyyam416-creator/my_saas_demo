import React from 'react';
import { Alarm } from '../types';
import { AlertTriangle, Clock, Eye, CheckSquare, Search } from 'lucide-react';

interface AlarmViewProps {
    alarms: Alarm[];
}

export const AlarmView: React.FC<AlarmViewProps> = ({ alarms }) => {
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">报警策略中心</h2>
          <p className="text-slate-500">监控自动安全触发并管理处置流程。</p>
        </div>
        <div className="flex gap-2">
             <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input 
                    type="text" 
                    placeholder="搜索事件..." 
                    className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
             </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">等级</th>
                    <th className="px-6 py-4 font-semibold">事件内容</th>
                    <th className="px-6 py-4 font-semibold">对象 / 位置</th>
                    <th className="px-6 py-4 font-semibold">时间</th>
                    <th className="px-6 py-4 font-semibold text-right">操作</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {alarms.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                            <div className="flex flex-col items-center gap-2">
                                <CheckSquare size={32} className="text-slate-300" />
                                <p>系统正常，无活跃报警。</p>
                            </div>
                        </td>
                    </tr>
                ) : (
                    alarms.map(alarm => (
                        <tr key={alarm.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                    alarm.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                    <AlertTriangle size={12} />
                                    {alarm.severity}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <p className="text-sm font-semibold text-slate-800">{alarm.title}</p>
                                <p className="text-xs text-slate-500">{alarm.description}</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                                {alarm.target}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">
                                <div className="flex items-center gap-2">
                                    <Clock size={14} />
                                    {alarm.timestamp.toLocaleTimeString()}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Eye size={16} /> 详情
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>

      {/* Configuration Section for Alarms (Demo) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <h3 className="font-bold text-slate-700 mb-4">规则: 长期未出入 (超期滞留)</h3>
              <div className="space-y-4">
                  <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">阈值 (天)</label>
                      <input type="number" defaultValue={7} className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm" />
                  </div>
                  <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" />
                      <label className="text-sm text-slate-700">自动生成宿管工单</label>
                  </div>
                  <div className="flex items-center gap-2">
                       <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" />
                       <label className="text-sm text-slate-700">通知项目管理员</label>
                  </div>
              </div>
          </div>
          
           <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex items-center justify-center text-slate-400 border-dashed">
              <p>+ 添加自定义报警规则</p>
          </div>
      </div>
    </div>
  );
};