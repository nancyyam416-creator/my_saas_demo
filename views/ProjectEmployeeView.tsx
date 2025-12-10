
import React, { useState } from 'react';
import { ProjectSubMenuId } from '../types';
import { Search, Filter, Download, Building2, User, UserSquare2, X, Droplets, CreditCard, ChevronRight, Activity, Calendar, Phone, Hash, Info, Wallet } from 'lucide-react';

interface ProjectEmployeeViewProps {
    subType: ProjectSubMenuId;
}

// --- Interfaces ---

interface Employee {
    id: string; // 员工编号
    name: string; // 员工姓名
    category: string; // 员工分类
    department: string; // 所属部门
    phone: string; // 联系电话
    gender: '男' | '女'; // 性别
    moveInDate: string; // 入宿日期
    hireDate: string; // 入职日期
    buildingId: string;
    buildingName: string; // 楼栋
    floorName: string; // 楼层
    roomName: string; // 房间
    bedName: string; // 床位
    idCard: string; // 身份证号
    shift: string; // 班别
    schoolType: string; // 学校员工类型
    source: string; // 来源
    faceStatus: 'active' | 'inactive' | 'pending'; // 人脸状态
    activeStatus: 'active' | 'left' | 'suspended'; // 激活状态
    createdAt: string; // 创建时间
    accountBalance: number; // 账户余额
}

interface RechargeRecord {
    id: string;
    time: string;
    amount: number;
    volume: number;
    method: string;
    orderId: string;
}

interface WaterUsageRecord {
    id: string;
    date: string;
    totalUsage: number; // 总用量 L
    freeQuotaDeduced: number; // 免费抵扣 L
    paidUsage: number; // 计费水量 L
    cost: number; // 产生费用 元
    status: 'settled' | 'pending';
}

// --- Mock Data ---

const MOCK_BUILDINGS = [
    { id: 'all', name: '全部楼栋' },
    { id: 'b1', name: '1号宿舍楼' },
    { id: 'b2', name: '2号宿舍楼' },
    { id: 'b3', name: '3号宿舍楼' },
];

const MOCK_EMPLOYEES: Employee[] = [
    {
        id: 'EMP001', name: '张伟', category: '正式工', department: '制造部-一组', phone: '13800138000', gender: '男',
        moveInDate: '2023-01-15', hireDate: '2023-01-10', buildingId: 'b1', buildingName: '1号宿舍楼', floorName: '2层', roomName: '201', bedName: '01',
        idCard: '32050019900101****', shift: '早班', schoolType: '社招', source: '直招', faceStatus: 'active', activeStatus: 'active', createdAt: '2023-01-10 10:00',
        accountBalance: 125.50
    },
    {
        id: 'EMP002', name: '李娜', category: '实习生', department: '研发部', phone: '13900139000', gender: '女',
        moveInDate: '2023-06-20', hireDate: '2023-06-18', buildingId: 'b1', buildingName: '1号宿舍楼', floorName: '3层', roomName: '305', bedName: '02',
        idCard: '32050019950505****', shift: '常白', schoolType: '校招', source: '中介', faceStatus: 'active', activeStatus: 'active', createdAt: '2023-06-18 09:30',
        accountBalance: 56.00
    },
    {
        id: 'EMP003', name: '王强', category: '正式工', department: '物流部', phone: '13700137000', gender: '男',
        moveInDate: '2023-03-10', hireDate: '2023-03-05', buildingId: 'b2', buildingName: '2号宿舍楼', floorName: '1层', roomName: '102', bedName: '01',
        idCard: '32050019881111****', shift: '晚班', schoolType: '社招', source: '内推', faceStatus: 'pending', activeStatus: 'active', createdAt: '2023-03-05 14:00',
        accountBalance: 200.00
    },
     {
        id: 'EMP004', name: '陈敏', category: '临时工', department: '后勤部', phone: '15900159000', gender: '女',
        moveInDate: '2023-09-01', hireDate: '2023-09-01', buildingId: 'b2', buildingName: '2号宿舍楼', floorName: '2层', roomName: '204', bedName: '03',
        idCard: '32050019920202****', shift: '常白', schoolType: '社招', source: '直招', faceStatus: 'inactive', activeStatus: 'suspended', createdAt: '2023-09-01 08:00',
        accountBalance: 0.00
    },
];

const MOCK_RECHARGES: RechargeRecord[] = [
    { id: 'R001', orderId: 'ORD20231001001', time: '2023-10-01 10:00:00', amount: 100, volume: 2000, method: '微信支付' },
    { id: 'R002', orderId: 'ORD20231015005', time: '2023-10-15 18:30:00', amount: 50, volume: 1000, method: '支付宝' },
    { id: 'R003', orderId: 'SYS20231001000', time: '2023-10-01 00:00:00', amount: 0, volume: 3000, method: '每月赠送' },
];

const MOCK_WATER_USAGE: WaterUsageRecord[] = [
    { id: 'W001', date: '2023-10-27', totalUsage: 120, freeQuotaDeduced: 80, paidUsage: 40, cost: 2.0, status: 'settled' },
    { id: 'W002', date: '2023-10-26', totalUsage: 60, freeQuotaDeduced: 60, paidUsage: 0, cost: 0.0, status: 'settled' },
    { id: 'W003', date: '2023-10-25', totalUsage: 90, freeQuotaDeduced: 80, paidUsage: 10, cost: 0.5, status: 'settled' },
    { id: 'W004', date: '2023-10-24', totalUsage: 200, freeQuotaDeduced: 80, paidUsage: 120, cost: 6.0, status: 'settled' },
];

// --- Helper Components ---

const DetailModal: React.FC<{ employee: Employee, onClose: () => void }> = ({ employee, onClose }) => {
    const [activeTab, setActiveTab] = useState<'info' | 'recharge' | 'usage'>('info');

    return (
        <div className="fixed inset-0 bg-slate-900/50 flex justify-end z-50 backdrop-blur-sm">
            <div className="bg-white w-[800px] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                            {employee.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                {employee.name}
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded border border-slate-200 font-normal">
                                    {employee.id}
                                </span>
                            </h3>
                            <p className="text-xs text-slate-500">{employee.department} | {employee.category}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-6 border-b border-slate-100 flex gap-6">
                    <button 
                        onClick={() => setActiveTab('info')}
                        className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'info' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <UserSquare2 size={16} /> 员工详情
                    </button>
                    <button 
                        onClick={() => setActiveTab('recharge')}
                        className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'recharge' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <CreditCard size={16} /> 充值记录
                    </button>
                    <button 
                        onClick={() => setActiveTab('usage')}
                        className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'usage' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <Droplets size={16} /> 水量使用记录
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                    
                    {/* Tab: Info */}
                    {activeTab === 'info' && (
                        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                            <div className="col-span-2 mb-2">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">基本信息</h4>
                                <div className="bg-white p-4 rounded-lg border border-slate-200 grid grid-cols-2 gap-4">
                                    <div><label className="text-xs text-slate-500 block mb-1">联系电话</label><div className="text-sm font-medium text-slate-800">{employee.phone}</div></div>
                                    <div><label className="text-xs text-slate-500 block mb-1">身份证号</label><div className="text-sm font-medium text-slate-800">{employee.idCard}</div></div>
                                    <div><label className="text-xs text-slate-500 block mb-1">性别</label><div className="text-sm font-medium text-slate-800">{employee.gender}</div></div>
                                    <div><label className="text-xs text-slate-500 block mb-1">来源 / 学校类型</label><div className="text-sm font-medium text-slate-800">{employee.source} / {employee.schoolType}</div></div>
                                </div>
                            </div>

                            <div className="col-span-2 mb-2">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">住宿与考勤信息</h4>
                                <div className="bg-white p-4 rounded-lg border border-slate-200 grid grid-cols-2 gap-4">
                                     <div><label className="text-xs text-slate-500 block mb-1">楼栋位置</label><div className="text-sm font-medium text-slate-800">{employee.buildingName} - {employee.floorName} - {employee.roomName}</div></div>
                                     <div><label className="text-xs text-slate-500 block mb-1">床位号</label><div className="text-sm font-medium text-slate-800">{employee.bedName}号床</div></div>
                                     <div><label className="text-xs text-slate-500 block mb-1">入宿日期</label><div className="text-sm font-medium text-slate-800">{employee.moveInDate}</div></div>
                                     <div><label className="text-xs text-slate-500 block mb-1">入职日期</label><div className="text-sm font-medium text-slate-800">{employee.hireDate}</div></div>
                                     <div><label className="text-xs text-slate-500 block mb-1">班别</label><div className="text-sm font-medium text-slate-800">{employee.shift}</div></div>
                                </div>
                            </div>

                            <div className="col-span-2">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">系统状态</h4>
                                <div className="bg-white p-4 rounded-lg border border-slate-200 grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs text-slate-500 block mb-1">人脸状态</label>
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${employee.faceStatus === 'active' ? 'bg-green-100 text-green-700' : (employee.faceStatus === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700')}`}>
                                            {employee.faceStatus === 'active' ? '已下发' : (employee.faceStatus === 'pending' ? '下发中' : '未录入')}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 block mb-1">激活状态</label>
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${employee.activeStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {employee.activeStatus === 'active' ? '在宿' : '离宿/挂起'}
                                        </span>
                                    </div>
                                     <div><label className="text-xs text-slate-500 block mb-1">创建时间</label><div className="text-xs text-slate-600 mt-1">{employee.createdAt}</div></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab: Recharge */}
                    {activeTab === 'recharge' && (
                        <div className="space-y-6">
                            {/* Prominent Balance Display */}
                            <div className="mb-4">
                                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg shadow-indigo-200 relative overflow-hidden flex justify-between items-center">
                                    <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 pointer-events-none"></div>
                                    <div>
                                        <div className="flex items-center gap-2 opacity-90 mb-3">
                                            <Wallet size={18} />
                                            <span className="text-sm font-medium uppercase tracking-wide">账户余额 (Balance)</span>
                                        </div>
                                        <div className="text-4xl font-bold flex items-baseline gap-1">
                                            <span className="text-2xl opacity-80">¥</span>
                                            {employee.accountBalance.toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                         <div className="text-[10px] opacity-70 flex items-center justify-end gap-1">
                                            <Info size={10} />
                                            可用于支付水费
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-bold text-slate-700">充值流水记录</h4>
                                </div>
                                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">充值时间</th>
                                                <th className="px-4 py-3 font-medium">订单号</th>
                                                <th className="px-4 py-3 font-medium">支付方式</th>
                                                <th className="px-4 py-3 font-medium text-right">充值金额</th>
                                                <th className="px-4 py-3 font-medium text-right">到账水量</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {MOCK_RECHARGES.map(r => (
                                                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-3 text-slate-600">{r.time}</td>
                                                    <td className="px-4 py-3 text-slate-500 text-xs font-mono">{r.orderId}</td>
                                                    <td className="px-4 py-3 text-slate-600">{r.method}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-orange-600">+{r.amount}</td>
                                                    <td className="px-4 py-3 text-right font-medium text-blue-600">{r.volume} L</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab: Usage */}
                    {activeTab === 'usage' && (
                        <div className="space-y-4">
                             <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
                                <div className="p-2 bg-white rounded-full text-blue-500 shadow-sm"><Info size={16}/></div>
                                <div>
                                    <h5 className="text-sm font-bold text-blue-900">计费说明：先免后付</h5>
                                    <p className="text-xs text-blue-700/80 mt-1">
                                        系统优先扣除每日免费用水额度（通常为80L）。当免费额度耗尽后，超出部分将从个人账户余额中扣除。
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">结算时间</th>
                                            <th className="px-4 py-3 font-medium text-right">总用量 (L)</th>
                                            <th className="px-4 py-3 font-medium text-right text-emerald-600 bg-emerald-50/50">免费额度抵扣</th>
                                            <th className="px-4 py-3 font-medium text-right text-orange-600 bg-orange-50/50">计费水量</th>
                                            <th className="px-4 py-3 font-medium text-right">产生费用</th>
                                            <th className="px-4 py-3 font-medium">状态</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {MOCK_WATER_USAGE.map(u => (
                                            <tr key={u.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 text-slate-600 font-medium">{u.date}</td>
                                                <td className="px-4 py-3 text-right font-bold text-slate-800">{u.totalUsage}</td>
                                                <td className="px-4 py-3 text-right text-emerald-600 bg-emerald-50/30 font-medium">-{u.freeQuotaDeduced}</td>
                                                <td className="px-4 py-3 text-right text-orange-600 bg-orange-50/30 font-medium">{u.paidUsage}</td>
                                                <td className="px-4 py-3 text-right font-bold text-slate-800">¥{u.cost.toFixed(2)}</td>
                                                <td className="px-4 py-3">
                                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs">已结算</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ProjectEmployeeView: React.FC<ProjectEmployeeViewProps> = ({ subType }) => {
    
    const [selectedBuildingId, setSelectedBuildingId] = useState<string>('all');
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    // Filter employees
    const filteredEmployees = MOCK_EMPLOYEES.filter(emp => {
        if (selectedBuildingId === 'all') return true;
        return emp.buildingId === selectedBuildingId;
    });

    return (
        <div className="h-full flex flex-col">
            {/* Detail Modal */}
            {selectedEmployee && <DetailModal employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />}

            {/* Header */}
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">员工列表</h2>
                    <p className="text-slate-500 mt-1">管理入住员工档案、考勤与宿舍分配信息。</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm shadow-emerald-200">
                        <UserSquare2 size={16} /> 员工入住登记
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                        <Download size={16} /> 导出花名册
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-4 overflow-hidden">
                {/* Left: Building Filter */}
                <div className="w-56 flex-shrink-0 bg-white border border-slate-200 rounded-xl flex flex-col shadow-sm">
                    <div className="p-4 border-b border-slate-100">
                        <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                            <Building2 size={16} className="text-slate-400" /> 楼栋筛选
                        </h3>
                    </div>
                    <div className="p-2 space-y-1 overflow-y-auto flex-1">
                        {MOCK_BUILDINGS.map(b => (
                            <button
                                key={b.id}
                                onClick={() => setSelectedBuildingId(b.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center ${
                                    selectedBuildingId === b.id 
                                    ? 'bg-emerald-50 text-emerald-700' 
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {b.name}
                                {selectedBuildingId === b.id && <ChevronRight size={14} />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Table */}
                <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
                     {/* Toolbar */}
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                         <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="搜索姓名/工号/手机号..."
                                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64"
                            />
                        </div>
                        <div className="h-6 w-px bg-slate-200 mx-1"></div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="font-medium text-slate-800">{filteredEmployees.length}</span> 位员工
                        </div>
                    </div>
                    
                    {/* Table with horizontal scroll for many columns */}
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-4 py-3 sticky left-0 bg-slate-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">员工姓名</th>
                                    <th className="px-4 py-3">员工编号</th>
                                    <th className="px-4 py-3">所属部门</th>
                                    <th className="px-4 py-3">员工分类</th>
                                    <th className="px-4 py-3">联系电话</th>
                                    <th className="px-4 py-3">性别</th>
                                    <th className="px-4 py-3">楼栋位置</th>
                                    <th className="px-4 py-3">床位</th>
                                    <th className="px-4 py-3">入宿日期</th>
                                    <th className="px-4 py-3">入职日期</th>
                                    <th className="px-4 py-3">班别</th>
                                    <th className="px-4 py-3">身份证号</th>
                                    <th className="px-4 py-3">来源/学校</th>
                                    <th className="px-4 py-3">人脸状态</th>
                                    <th className="px-4 py-3">激活状态</th>
                                    <th className="px-4 py-3 text-right sticky right-0 bg-slate-50 z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredEmployees.map(emp => (
                                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-800 sticky left-0 bg-white group-hover:bg-slate-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] flex items-center gap-2">
                                            <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                                                {emp.name.charAt(0)}
                                            </div>
                                            {emp.name}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">{emp.id}</td>
                                        <td className="px-4 py-3 text-slate-600">{emp.department}</td>
                                        <td className="px-4 py-3 text-slate-600">
                                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-xs">{emp.category}</span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{emp.phone}</td>
                                        <td className="px-4 py-3 text-slate-600">{emp.gender}</td>
                                        <td className="px-4 py-3 text-slate-600">{emp.buildingName}-{emp.roomName}</td>
                                        <td className="px-4 py-3 text-slate-600">{emp.bedName}</td>
                                        <td className="px-4 py-3 text-slate-500 text-xs">{emp.moveInDate}</td>
                                        <td className="px-4 py-3 text-slate-500 text-xs">{emp.hireDate}</td>
                                        <td className="px-4 py-3 text-slate-600">{emp.shift}</td>
                                        <td className="px-4 py-3 text-slate-500 text-xs">{emp.idCard}</td>
                                        <td className="px-4 py-3 text-slate-600 text-xs">{emp.source}</td>
                                        <td className="px-4 py-3">
                                            {emp.faceStatus === 'active' && <span className="text-emerald-600 text-xs flex items-center gap-1"><User size={12}/> 已下发</span>}
                                            {emp.faceStatus === 'pending' && <span className="text-amber-600 text-xs flex items-center gap-1"><Activity size={12}/> 下发中</span>}
                                            {emp.faceStatus === 'inactive' && <span className="text-slate-400 text-xs flex items-center gap-1"><X size={12}/> 未录入</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                             <span className={`w-2 h-2 rounded-full inline-block mr-1.5 ${emp.activeStatus === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                             <span className="text-xs text-slate-600">{emp.activeStatus === 'active' ? '在宿' : '离宿'}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right sticky right-0 bg-white group-hover:bg-slate-50 z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                            <button 
                                                onClick={() => setSelectedEmployee(emp)}
                                                className="text-emerald-600 hover:text-emerald-800 text-xs font-medium border border-emerald-200 hover:bg-emerald-50 px-2 py-1 rounded"
                                            >
                                                查看详情
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
