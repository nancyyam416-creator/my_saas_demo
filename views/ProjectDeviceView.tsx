
import React, { useState } from 'react';
import { Search, Filter, Download, Droplets, Settings, Save, User, Clock } from 'lucide-react';
import { ProjectSubMenuId } from '../types';

interface ProjectDeviceViewProps {
    subType: ProjectSubMenuId;
}

// Mock Data
const MOCK_DEVICES = [
    { id: 'd1', name: '智能水表-101', type: 'NB-IoT 水表', location: '1号楼 101室', status: 'online', lastActive: '2023-10-27 10:00' },
    { id: 'd2', name: '智能水表-102', type: 'NB-IoT 水表', location: '1号楼 102室', status: 'online', lastActive: '2023-10-27 09:45' },
    { id: 'd3', name: '智能电表-101', type: '智能电表 Pro', location: '1号楼 101室', status: 'offline', lastActive: '2023-10-26 18:00' },
];

const MOCK_RECHARGE_RECORDS = [
    { id: 'r1', orderId: 'ORD-20231027-01', room: '1号楼 101室', userName: '张伟', userType: '本科生', amount: 50, unit: '元', volume: 1000, method: '微信支付', time: '2023-10-27 08:30:00' },
    { id: 'r2', orderId: 'ORD-20231026-05', room: '1号楼 102室', userName: '李娜', userType: '研究生', amount: 100, unit: '元', volume: 2000, method: '支付宝', time: '2023-10-26 14:20:00' },
    { id: 'r3', orderId: 'SYS-20231001-00', room: '1号楼 101室', userName: '系统', userType: '系统管理员', amount: 0, unit: '元', volume: 50, method: '系统赠送', time: '2023-10-01 00:00:00' },
    { id: 'r4', orderId: 'ORD-20231025-12', room: '2号楼 205室', userName: '王强', userType: '教职工', amount: 200, unit: '元', volume: 4000, method: '一卡通', time: '2023-10-25 11:10:00' },
];

const MOCK_USAGE_RECORDS = [
    { id: 'u1', room: '1号楼 101室', usage: 120, cost: 0.6, time: '2023-10-26', status: 'settled' },
    { id: 'u2', room: '1号楼 101室', usage: 85, cost: 0.42, time: '2023-10-25', status: 'settled' },
    { id: 'u3', room: '1号楼 102室', usage: 200, cost: 1.0, time: '2023-10-26', status: 'settled' },
];

export const ProjectDeviceView: React.FC<ProjectDeviceViewProps> = ({ subType }) => {
    
    // State for Water Conversion Definition
    const [conversionRate, setConversionRate] = useState<number>(20); // Default: 1 Yuan = 20 L
    const [isEditingRate, setIsEditingRate] = useState(false);
    const [tempRate, setTempRate] = useState<number>(20);

    const handleSaveRate = () => {
        setConversionRate(tempRate);
        setIsEditingRate(false);
    };

    // Determine content based on subType
    let title = '设备列表';
    let desc = '监控项目内所有智能设备的状态与运行情况。';
    let contentKey = 'devices';
    let searchPlaceholder = "搜索设备/房间号...";

    if (subType === 'water-recharge') {
        title = '水量充值记录';
        desc = '查看房间的水费充值流水与定义金额换算规则。';
        contentKey = 'recharge';
        searchPlaceholder = "搜索姓名/订单号...";
    } else if (subType === 'water-usage') {
        title = '水量使用记录';
        desc = '查看每日/每月的用水量与扣费明细。';
        contentKey = 'usage';
        searchPlaceholder = "搜索房间/姓名...";
    }

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
                    <p className="text-slate-500 mt-1">{desc}</p>
                </div>
            </div>

            {/* Top Section: Only for Water Recharge */}
            {contentKey === 'recharge' && (
                <div className="w-full">
                    {/* Config Card: Water Definition - Takes full space now */}
                    <div className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-xl border border-indigo-100 shadow-sm flex flex-col justify-center relative">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                                <Settings size={14} /> 水量定义 (金额换算)
                            </p>
                            {!isEditingRate ? (
                                <button 
                                    onClick={() => { setTempRate(conversionRate); setIsEditingRate(true); }}
                                    className="text-xs text-indigo-600 hover:underline"
                                >
                                    修改规则
                                </button>
                            ) : (
                                <button 
                                    onClick={handleSaveRate}
                                    className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded flex items-center gap-1 hover:bg-indigo-700"
                                >
                                    <Save size={10} /> 保存
                                </button>
                            )}
                        </div>
                        
                        <div className="flex items-end gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-600 font-medium">1 元 =</span>
                                {isEditingRate ? (
                                    <input 
                                        type="number" 
                                        className="w-20 px-2 py-1 border border-indigo-300 rounded text-lg font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={tempRate}
                                        onChange={(e) => setTempRate(Number(e.target.value))}
                                    />
                                ) : (
                                    <span className="text-2xl font-bold text-indigo-700">{conversionRate}</span>
                                )}
                                <span className="text-sm text-slate-600 font-medium">L (升)</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">
                            系统将根据此汇率自动折算充值金额对应的下发水量。
                        </p>
                    </div>
                </div>
            )}

            {/* Main Content Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
                {/* Toolbar */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                        />
                    </div>
                    {/* Hide Filter/Download for Recharge view */}
                    {contentKey !== 'recharge' && (
                        <div className="flex gap-2">
                            <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                                <Filter size={16} /> 筛选
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                                <Download size={16} /> 导出报表
                            </button>
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                {contentKey === 'devices' && (
                                    <>
                                        <th className="px-6 py-3">设备名称</th>
                                        <th className="px-6 py-3">类型</th>
                                        <th className="px-6 py-3">安装位置</th>
                                        <th className="px-6 py-3">状态</th>
                                        <th className="px-6 py-3">最后上报</th>
                                    </>
                                )}
                                {contentKey === 'recharge' && (
                                    <>
                                        <th className="px-6 py-3">充值订单号</th>
                                        <th className="px-6 py-3">充值员工</th>
                                        <th className="px-6 py-3">员工类型</th>
                                        <th className="px-6 py-3">充值时间</th>
                                        <th className="px-6 py-3">充值金额</th>
                                        <th className="px-6 py-3">到账水量 (L)</th>
                                        <th className="px-6 py-3">支付渠道</th>
                                        <th className="px-6 py-3 text-right">操作</th>
                                    </>
                                )}
                                {contentKey === 'usage' && (
                                    <>
                                        <th className="px-6 py-3">记录ID</th>
                                        <th className="px-6 py-3">房间</th>
                                        <th className="px-6 py-3">用量 (L)</th>
                                        <th className="px-6 py-3">费用 (元)</th>
                                        <th className="px-6 py-3">日期</th>
                                        <th className="px-6 py-3">结算状态</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {contentKey === 'devices' && MOCK_DEVICES.map(d => (
                                <tr key={d.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-800">{d.name}</td>
                                    <td className="px-6 py-4 text-slate-600">{d.type}</td>
                                    <td className="px-6 py-4 text-slate-600">{d.location}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${d.status === 'online' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {d.status === 'online' ? '在线' : '离线'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{d.lastActive}</td>
                                </tr>
                            ))}
                            {contentKey === 'recharge' && MOCK_RECHARGE_RECORDS.map(r => (
                                <tr key={r.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{r.orderId}</td>
                                    <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                            <User size={12} />
                                        </div>
                                        {r.userName}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                                            {r.userType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                         <div className="flex items-center gap-1.5 text-xs">
                                            <Clock size={12} />
                                            {r.time}
                                         </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-orange-600">
                                        {r.amount > 0 ? `+${r.amount}` : r.amount} <span className="text-xs font-normal text-slate-400">元</span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-blue-600">
                                        +{r.volume} L
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <span className={`flex items-center gap-1 ${r.method.includes('微信') ? 'text-green-600' : (r.method.includes('支付宝') ? 'text-blue-500' : 'text-slate-600')}`}>
                                            {r.method}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-indigo-600 hover:text-indigo-800 text-xs font-medium border border-indigo-200 hover:bg-indigo-50 px-2 py-1 rounded transition-colors">
                                            查看详情
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {contentKey === 'usage' && MOCK_USAGE_RECORDS.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono text-slate-500">{u.id}</td>
                                    <td className="px-6 py-4 font-medium text-slate-800">{u.room}</td>
                                    <td className="px-6 py-4 font-medium">{u.usage}</td>
                                    <td className="px-6 py-4">{u.cost}</td>
                                    <td className="px-6 py-4 text-slate-500">{u.time}</td>
                                    <td className="px-6 py-4">
                                         <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">已结算</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
