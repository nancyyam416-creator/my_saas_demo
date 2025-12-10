
import React, { useState } from 'react';
import { ProjectSubMenuId, DeviceFeature } from '../types';
import { 
    Plus, Search, FileText, Zap, Droplets, Shield, AlertTriangle, CreditCard, X, 
    ChevronRight, ChevronDown, Layers, Save, Trash2, Clock, Building2, UserCircle, Activity, Edit, Hash,
    Bell, Info, BookOpen, AlertCircle, Coins, Gift
} from 'lucide-react';

interface ProjectPolicyViewProps {
    subType: ProjectSubMenuId;
}

interface ActionItem {
    id: string;
    targetModelId: string;
    targetActionIdentifier: string;
    value: string;
}

interface RuleItem {
    id: string;
    selectedModelId: string;
    selectedFeatureIdentifier: string;
    operator: string;
    threshold: string;
    rangeMin: string;
    rangeMax: string;
    resetType: 'never' | 'daily' | 'monthly';
    resetDay: number;
    resetTime: string;
    
    // Billing specific
    billingMode?: 'free' | 'paid';
    billingPrice?: string;
}

interface PolicyInstance {
    id: string;
    name: string;
    description?: string;
    sourceType: 'custom' | 'template'; 
    sourceTemplateName?: string;
    status: 'active' | 'inactive';
    updatedAt: string;
    scopeSummary: string;
    ruleSummary: string;
    tags: string[];
    scopeBuildings?: string[];
    scopeUserTypes?: string[];
    rules?: RuleItem[];
    // Control Specific
    actions?: ActionItem[];
    // Alarm Specific
    alarmType?: string;
    alarmLevel?: string;
}

// --- MOCK DATA (Synced with PolicyTemplateView) ---

const DEVICE_TYPES: {
    id: string;
    name: string;
    features: Partial<DeviceFeature>[];
}[] = [
    {
        id: 'energy_meter',
        name: '电能计量类 (Electricity)',
        features: [
            { name: '累计电量', identifier: 'total_energy', dataType: 'float', unit: 'kWh', specs: { min: 0 }, accessMode: 'r' },
            { name: '有功功率', identifier: 'active_power', dataType: 'float', unit: 'W', specs: { min: 0 }, accessMode: 'r' },
            { name: '通断控制', identifier: 'power_switch', dataType: 'boolean', unit: '', specs: { trueLabel: '合闸', falseLabel: '跳闸' }, accessMode: 'rw' },
        ]
    },
    {
        id: 'water_meter',
        name: '水务计量类 (Water)',
        features: [
            { name: '累计水量', identifier: 'total_water', dataType: 'float', unit: 'm³', specs: { min: 0 }, accessMode: 'r' },
            { name: '阀门控制', identifier: 'valve_control', dataType: 'enum', unit: '', specs: { '0': '关阀', '1': '开阀', '2': '半开' }, accessMode: 'rw' },
        ]
    },
    {
        id: 'env_sensor',
        name: '环境传感类 (Environment)',
        features: [
            { name: '室内温度', identifier: 'temperature', dataType: 'float', unit: '℃', specs: { min: -40, max: 80 }, accessMode: 'r' },
            { name: '工作模式', identifier: 'work_mode', dataType: 'enum', unit: '', specs: { '0': '省电', '1': '性能' }, accessMode: 'rw' }
        ]
    }
];

const DEVICE_MODELS = [
    { id: 'model_meter_pro', name: '智能电表 Pro (v2)', typeId: 'energy_meter' },
    { id: 'model_water_iot', name: 'NB-IoT 远传水表', typeId: 'water_meter' },
    { id: 'model_th_sensor', name: '温湿度传感器 X1', typeId: 'env_sensor' }
];

interface SpatialNode {
    id: string;
    name: string;
    type: 'building' | 'floor' | 'room';
    children?: SpatialNode[];
}

const MOCK_SPATIAL_HIERARCHY: SpatialNode[] = [
    {
        id: 'b_1', name: '1号宿舍楼', type: 'building',
        children: [
            {
                id: 'b_1_f_1', name: '1层', type: 'floor', children: [{ id: 'r_101', name: '101室', type: 'room' }]
            }
        ]
    },
    {
        id: 'b_2', name: '2号宿舍楼', type: 'building', children: []
    }
];

const MOCK_USER_TYPES = [
    { id: 'u_1', name: '本科生' },
    { id: 'u_2', name: '研究生' },
    { id: 'u_3', name: '教职工' }
];

const OPS_NUMERIC_STRING = [
    { value: '>', label: '大于 (>)' },
    { value: '>=', label: '大于等于 (≥)' },
    { value: '<', label: '小于 (<)' },
    { value: '<=', label: '小于等于 (≤)' },
    { value: '=', label: '等于 (=)' },
    { value: '!=', label: '不等于 (≠)' },
    { value: 'BETWEEN', label: '区间包含 (Between)' },
];

const OPS_ENUM_BOOL = [
    { value: '=', label: '等于 (=)' },
    { value: '!=', label: '不等于 (≠)' },
];

const OPS_DATETIME = [
    { value: '=', label: '等于 (=)' },
    { value: '!=', label: '不等于 (≠)' },
    { value: '>', label: '晚于 (>)' },
    { value: '<', label: '早于 (<)' },
];

const getOperators = (dataType?: string) => {
    if (!dataType) return OPS_NUMERIC_STRING;
    if (['enum', 'boolean'].includes(dataType)) return OPS_ENUM_BOOL;
    if (['datetime'].includes(dataType)) return OPS_DATETIME;
    return OPS_NUMERIC_STRING;
};

const ALARM_TYPES = [
    { id: 'security', label: '安防报警' },
    { id: 'environment', label: '环境报警' },
    { id: 'device', label: '设备故障' }
];

const ALARM_LEVELS = [
    { id: 'critical', label: '严重 (Critical)' },
    { id: 'warning', label: '警告 (Warning)' },
    { id: 'info', label: '提示 (Info)' }
];

// --- Mock Templates from Tenant/Platform ---
interface TemplateOption {
    id: string;
    name: string;
    type: 'billing' | 'control' | 'alarm';
    rules: RuleItem[];
    actions?: ActionItem[];
    alarmType?: string;
    alarmLevel?: string;
}

const TEMPLATE_OPTIONS: TemplateOption[] = [
    {
        id: 'tpl_1',
        name: '标准商业用电计费 (Tenant)',
        type: 'billing',
        rules: [{
            id: 'r_t1', selectedModelId: 'model_meter_pro', selectedFeatureIdentifier: 'total_energy',
            operator: '>', threshold: '0', rangeMin: '', rangeMax: '',
            resetType: 'monthly', resetDay: 1, resetTime: '00:00', billingMode: 'paid', billingPrice: '1.2'
        }]
    },
    {
        id: 'tpl_2',
        name: '恶性负载保护 (Tenant)',
        type: 'control',
        rules: [{
            id: 'r_t2', selectedModelId: 'model_meter_pro', selectedFeatureIdentifier: 'active_power',
            operator: '>', threshold: '3000', rangeMin: '', rangeMax: '',
            resetType: 'never', resetDay: 1, resetTime: '00:00'
        }],
        actions: [{
            id: 'a_t2', targetModelId: 'model_meter_pro', targetActionIdentifier: 'power_switch', value: '0'
        }]
    },
    {
        id: 'tpl_3',
        name: '高温火灾预警 (Tenant)',
        type: 'alarm',
        alarmType: 'security',
        alarmLevel: 'critical',
        rules: [{
            id: 'r_t3', selectedModelId: 'model_th_sensor', selectedFeatureIdentifier: 'temperature',
            operator: '>', threshold: '60', rangeMin: '', rangeMax: '',
            resetType: 'never', resetDay: 1, resetTime: '00:00'
        }]
    }
];

// --- Component: Spatial Tree Item ---
const SpatialNodeItem: React.FC<{ node: SpatialNode, selectedIds: string[], onToggle: (id: string) => void, level?: number }> = ({ node, selectedIds, onToggle, level = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedIds.includes(node.id);
    const Icon = node.type === 'building' ? Building2 : (node.type === 'floor' ? Layers : FileText); // Simple icon fallback
    
    return (
        <div className="select-none">
            <div className={`flex items-center gap-2 py-1.5 px-2 rounded hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`} style={{ paddingLeft: `${level * 16 + 8}px` }}>
                <button onClick={() => setIsExpanded(!isExpanded)} className={`p-0.5 rounded text-slate-400 hover:bg-slate-200 ${hasChildren ? 'visible' : 'invisible'}`}>
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                <input type="checkbox" checked={isSelected} onChange={() => onToggle(node.id)} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300" />
                <div className="flex items-center gap-2 cursor-pointer flex-1" onClick={() => hasChildren ? setIsExpanded(!isExpanded) : onToggle(node.id)}>
                    <Icon size={14} className={isSelected ? 'text-blue-600' : 'text-slate-500'} />
                    <span className={`text-sm ${isSelected ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>{node.name}</span>
                </div>
            </div>
            {hasChildren && isExpanded && <div>{node.children!.map(child => <SpatialNodeItem key={child.id} node={child} selectedIds={selectedIds} onToggle={onToggle} level={level + 1} />)}</div>}
        </div>
    );
};

export const ProjectPolicyView: React.FC<ProjectPolicyViewProps> = ({ subType }) => {
    // Determine mapping from subType to internal type strings
    const policyTypeMap = {
        'policy-billing': 'billing',
        'policy-control': 'control',
        'policy-alarm': 'alarm'
    };
    const currentType = policyTypeMap[subType];

    const [policies, setPolicies] = useState<PolicyInstance[]>([
        {
            id: 'p1', name: '1号楼基础电费', sourceType: 'custom', status: 'active', updatedAt: '2023-10-27',
            scopeSummary: '1号宿舍楼 (本科生)', ruleSummary: '累计电量 > 0 kWh (单价: 0.58 元/kWh)',
            tags: ['电费'], scopeBuildings: ['b_1'], scopeUserTypes: ['u_1'],
            rules: [{ id: 'r1', selectedModelId: 'model_meter_pro', selectedFeatureIdentifier: 'total_energy', operator: '>', threshold: '0', rangeMin: '', rangeMax: '', resetType: 'monthly', resetDay: 1, resetTime: '00:00', billingMode: 'paid', billingPrice: '0.58' }]
        }
    ]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createForm, setCreateForm] = useState({
        name: '', description: '',
        sourceType: 'custom' as 'custom' | 'template',
        selectedTemplateId: '',
        scopeBuildings: [] as string[], scopeUserTypes: [] as string[],
        rules: [] as RuleItem[], actions: [] as ActionItem[],
        alarmType: '', alarmLevel: ''
    });

    // --- Actions ---

    const openCreateModal = (policy?: PolicyInstance) => {
        if (policy) {
            // Edit Mode (Simplified for Demo: Treats as Custom edit)
            setCreateForm({
                name: policy.name, description: policy.description || '',
                sourceType: 'custom', selectedTemplateId: '',
                scopeBuildings: policy.scopeBuildings || [],
                scopeUserTypes: policy.scopeUserTypes || [],
                rules: policy.rules || [],
                actions: policy.actions || [],
                alarmType: policy.alarmType || '', alarmLevel: policy.alarmLevel || ''
            });
        } else {
            // New Mode
            setCreateForm({
                name: '', description: '', sourceType: 'custom', selectedTemplateId: '',
                scopeBuildings: [], scopeUserTypes: [],
                rules: [{ 
                    id: Date.now().toString(), selectedModelId: '', selectedFeatureIdentifier: '', 
                    operator: '>', threshold: '', rangeMin: '', rangeMax: '', 
                    resetType: 'never', resetDay: 1, resetTime: '00:00', 
                    billingMode: 'paid', billingPrice: '' 
                }],
                actions: [{ id: `act_${Date.now()}`, targetModelId: '', targetActionIdentifier: '', value: '' }],
                alarmType: '', alarmLevel: ''
            });
        }
        setIsCreateModalOpen(true);
    };

    const handleTemplateSelect = (tplId: string) => {
        const tpl = TEMPLATE_OPTIONS.find(t => t.id === tplId);
        if (tpl) {
            setCreateForm(prev => ({
                ...prev,
                sourceType: 'template',
                selectedTemplateId: tplId,
                name: prev.name || tpl.name.replace(' (Tenant)', ''), // Auto-fill name if empty
                rules: JSON.parse(JSON.stringify(tpl.rules)), // Deep copy
                actions: tpl.actions ? JSON.parse(JSON.stringify(tpl.actions)) : prev.actions,
                alarmType: tpl.alarmType || prev.alarmType,
                alarmLevel: tpl.alarmLevel || prev.alarmLevel
            }));
        } else {
            setCreateForm(prev => ({ ...prev, sourceType: 'custom', selectedTemplateId: '' }));
        }
    };

    const toggleScope = (field: 'scopeBuildings' | 'scopeUserTypes', id: string) => {
        setCreateForm(prev => {
            const current = prev[field];
            const exists = current.includes(id);
            return { ...prev, [field]: exists ? current.filter(x => x !== id) : [...current, id] };
        });
    };

    const updateRule = (id: string, field: keyof RuleItem, value: any) => {
        setCreateForm(prev => ({
            ...prev,
            rules: prev.rules.map(r => r.id === id ? { ...r, [field]: value } : r)
        }));
    };

    const updateAction = (id: string, field: keyof ActionItem, value: any) => {
        setCreateForm(prev => ({
            ...prev,
            actions: prev.actions.map(a => a.id === id ? { ...a, [field]: value } : a)
        }));
    };

    const handleSavePolicy = () => {
        if (!createForm.name) return;

        // Generate Summaries
        let ruleSummary = '';
        createForm.rules.forEach(r => {
            const feat = DEVICE_TYPES.flatMap(t => t.features).find(f => f.identifier === r.selectedFeatureIdentifier);
            const unit = feat?.unit || '';
            ruleSummary += `${feat?.name || r.selectedFeatureIdentifier} ${r.operator} ${r.threshold} ${unit}`;
            
            if (currentType === 'billing') {
                if (r.billingMode === 'free') {
                    ruleSummary += ` (免费)`;
                } else {
                    ruleSummary += ` (单价: ${r.billingPrice} 元/${unit})`;
                }
            }
        });

        const newPolicy: PolicyInstance = {
            id: `p_${Date.now()}`,
            name: createForm.name,
            description: createForm.description,
            sourceType: createForm.sourceType,
            sourceTemplateName: createForm.sourceType === 'template' ? TEMPLATE_OPTIONS.find(t => t.id === createForm.selectedTemplateId)?.name : undefined,
            status: 'active',
            updatedAt: new Date().toLocaleDateString(),
            scopeSummary: `${createForm.scopeBuildings.length}个空间, ${createForm.scopeUserTypes.length}类人员`,
            ruleSummary: ruleSummary,
            tags: [currentType === 'billing' ? '计费' : (currentType === 'control' ? '控制' : '报警')],
            scopeBuildings: createForm.scopeBuildings,
            scopeUserTypes: createForm.scopeUserTypes,
            rules: createForm.rules,
            actions: createForm.actions,
            alarmType: createForm.alarmType,
            alarmLevel: createForm.alarmLevel
        };

        setPolicies([newPolicy, ...policies]);
        setIsCreateModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (confirm('确定要删除此策略吗？')) {
            setPolicies(policies.filter(p => p.id !== id));
        }
    };

    const toggleStatus = (id: string) => {
        setPolicies(policies.map(p => p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p));
    };

    // --- Helper: Smart Input Renderer ---
    // Renders the appropriate input (Text, Number, Select, DatePicker) based on data type
    const renderSmartInput = (feature: any, value: string, onChange: (val: string) => void, placeholder: string = "Value") => {
        if (!feature) {
            return <input type="text" className="w-full text-sm border border-slate-300 rounded p-2" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled />;
        }

        const commonClass = "w-full text-sm border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none";

        switch (feature.dataType) {
            case 'boolean':
                return (
                    <select className={commonClass} value={value} onChange={(e) => onChange(e.target.value)}>
                        <option value="">-- 请选择状态 --</option>
                        <option value="1">{feature.specs?.trueLabel || 'True (开启)'}</option>
                        <option value="0">{feature.specs?.falseLabel || 'False (关闭)'}</option>
                    </select>
                );
            case 'enum':
                return (
                    <select className={commonClass} value={value} onChange={(e) => onChange(e.target.value)}>
                        <option value="">-- 请选择选项 --</option>
                        {feature.specs && Object.entries(feature.specs).map(([k, v]) => (
                            <option key={k} value={k}>{v as string}</option>
                        ))}
                    </select>
                );
            case 'datetime':
                return (
                     <input 
                        type="datetime-local" 
                        className={commonClass}
                        value={value} 
                        onChange={(e) => onChange(e.target.value)} 
                    />
                );
            case 'integer':
            case 'float':
                return (
                     <input 
                        type="number" 
                        step={feature.dataType === 'float' ? '0.01' : '1'}
                        className={commonClass}
                        value={value} 
                        onChange={(e) => onChange(e.target.value)} 
                        placeholder={placeholder}
                    />
                );
            default: // String
                 return (
                     <input 
                        type="text" 
                        className={commonClass}
                        value={value} 
                        onChange={(e) => onChange(e.target.value)} 
                        placeholder={placeholder}
                    />
                );
        }
    };

    // --- Renders ---

    const renderRuleRow = (rule: RuleItem, idx: number) => {
        const model = DEVICE_MODELS.find(m => m.id === rule.selectedModelId);
        const type = DEVICE_TYPES.find(t => t.id === model?.typeId);
        const features = type?.features || [];
        const feature = features.find(f => f.identifier === rule.selectedFeatureIdentifier);
        const ops = getOperators(feature?.dataType);

        return (
            <div key={rule.id} className="relative bg-slate-50 p-4 rounded-lg border border-slate-200 mb-3">
                 {idx > 0 && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-xs text-slate-400">AND</div>}
                 {createForm.rules.length > 1 && <button onClick={() => setCreateForm(prev => ({...prev, rules: prev.rules.filter(r => r.id !== rule.id)}))} className="absolute top-2 right-2 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>}
                 
                 {/* BILLING MODE SWITCHER (New) */}
                 {currentType === 'billing' && (
                    <div className="mb-4">
                        <div className="flex p-1 bg-slate-200 rounded-lg w-fit">
                            <button
                                onClick={() => updateRule(rule.id, 'billingMode', 'paid')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${
                                    rule.billingMode === 'paid' || !rule.billingMode
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <Coins size={14} />
                                付费计费
                            </button>
                            <button
                                onClick={() => updateRule(rule.id, 'billingMode', 'free')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${
                                    rule.billingMode === 'free'
                                    ? 'bg-white text-emerald-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <Gift size={14} />
                                免费/赠送额度
                            </button>
                        </div>
                    </div>
                 )}

                 <div className="grid grid-cols-12 gap-3 items-start">
                    <div className="col-span-3">
                        <label className="block text-xs text-slate-500 mb-1">触发源 (设备模型)</label>
                        <select className="w-full text-sm border border-slate-300 rounded p-2" value={rule.selectedModelId} onChange={(e) => updateRule(rule.id, 'selectedModelId', e.target.value)}>
                            <option value="">-- 选择模型 --</option>
                            {DEVICE_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>
                    <div className="col-span-3">
                        <label className="block text-xs text-slate-500 mb-1">指标</label>
                        <select className="w-full text-sm border border-slate-300 rounded p-2" value={rule.selectedFeatureIdentifier} onChange={(e) => updateRule(rule.id, 'selectedFeatureIdentifier', e.target.value)}>
                            <option value="">-- 选择指标 --</option>
                            {features.map(f => <option key={f.identifier} value={f.identifier}>{f.name}</option>)}
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs text-slate-500 mb-1">运算符</label>
                        <select className="w-full text-sm border border-slate-300 rounded p-2" value={rule.operator} onChange={(e) => updateRule(rule.id, 'operator', e.target.value)}>
                            {ops.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs text-slate-500 mb-1">阈值</label>
                        {/* Smart Input for Rule Threshold */}
                        {renderSmartInput(feature, rule.threshold, (val) => updateRule(rule.id, 'threshold', val), "触发值")}
                    </div>
                    
                    {/* Billing Price Input (Paid Mode Only) */}
                    {currentType === 'billing' && (
                        <div className="col-span-2">
                            <label className="block text-xs text-slate-500 mb-1">计费单价</label>
                            {rule.billingMode === 'free' ? (
                                <div className="w-full px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg text-sm text-emerald-700 font-medium flex items-center justify-center">
                                    免费 / 0元
                                </div>
                            ) : (
                                <div className="relative">
                                     <input 
                                        type="number" 
                                        className="w-full text-sm border border-slate-300 rounded p-2 font-bold text-orange-600 pr-8" 
                                        value={rule.billingPrice} 
                                        onChange={(e) => updateRule(rule.id, 'billingPrice', e.target.value)} 
                                        placeholder="0.00" 
                                    />
                                    <span className="absolute right-2 top-2 text-xs text-slate-400">元</span>
                                </div>
                            )}
                        </div>
                    )}
                 </div>
                 
                 {/* Reset Cycle - Only for Billing Type AND Free Mode */}
                 {currentType === 'billing' && rule.billingMode === 'free' && (
                     <div className="mt-3 pt-3 border-t border-slate-200 border-dashed flex items-center gap-4 text-xs animate-in slide-in-from-top-2 fade-in">
                         <span className="font-bold text-emerald-600 flex items-center gap-1"><Clock size={12}/> 数据重置周期 (免费额度):</span>
                         <label className="flex gap-1 cursor-pointer"><input type="radio" checked={rule.resetType === 'never'} onChange={() => updateRule(rule.id, 'resetType', 'never')} />不重置</label>
                         <label className="flex gap-1 cursor-pointer"><input type="radio" checked={rule.resetType === 'daily'} onChange={() => updateRule(rule.id, 'resetType', 'daily')} />每日</label>
                         <label className="flex gap-1 cursor-pointer"><input type="radio" checked={rule.resetType === 'monthly'} onChange={() => updateRule(rule.id, 'resetType', 'monthly')} />每月</label>
                         
                         {rule.resetType !== 'never' && (
                            <div className="flex items-center gap-2 ml-2">
                                {rule.resetType === 'monthly' && (
                                    <select 
                                        className="border border-slate-300 rounded px-1 py-0.5"
                                        value={rule.resetDay}
                                        onChange={(e) => updateRule(rule.id, 'resetDay', parseInt(e.target.value))}
                                    >
                                        {Array.from({length: 31}, (_, i) => i + 1).map(d => (
                                            <option key={d} value={d}>{d}日</option>
                                        ))}
                                    </select>
                                )}
                                <input 
                                    type="time" 
                                    className="border border-slate-300 rounded px-1 py-0.5"
                                    value={rule.resetTime}
                                    onChange={(e) => updateRule(rule.id, 'resetTime', e.target.value)}
                                />
                            </div>
                         )}
                     </div>
                 )}

                 {/* Paid Mode Info */}
                 {currentType === 'billing' && (rule.billingMode === 'paid' || !rule.billingMode) && (
                     <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1 pl-1">
                         <Info size={10} /> 付费模式下数据将根据系统账期统一计算，无需单独配置重置周期。
                     </div>
                 )}
            </div>
        );
    };

    // Render Logic for Action Row
    const renderActionRow = (action: ActionItem) => {
        const selectedModel = DEVICE_MODELS.find(m => m.id === action.targetModelId);
        const selectedType = DEVICE_TYPES.find(t => t.id === selectedModel?.typeId);
        
        // Filter: Command action can only be 'writable' (rw or w)
        const writableFeatures = selectedType?.features.filter(f => f.accessMode === 'rw' || f.accessMode === 'w') || [];
        const targetFeature = writableFeatures.find(f => f.identifier === action.targetActionIdentifier);

        return (
             <div key={action.id} className="bg-slate-50 p-3 rounded border border-slate-200 grid grid-cols-3 gap-2 items-start">
                <div>
                    <label className="block text-xs text-slate-500 mb-1">执行对象 (设备模型)</label>
                    <select 
                        className="w-full text-sm border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={action.targetModelId} 
                        onChange={(e) => updateAction(action.id, 'targetModelId', e.target.value)}
                    >
                        <option value="">-- 请选择执行对象 --</option>
                        {DEVICE_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-xs text-slate-500 mb-1">指令动作 (点位属性)</label>
                    <select 
                        className="w-full text-sm border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={action.targetActionIdentifier} 
                        onChange={(e) => updateAction(action.id, 'targetActionIdentifier', e.target.value)}
                        disabled={!action.targetModelId}
                    >
                        <option value="">-- 请选择指定动作 --</option>
                        {writableFeatures.map(f => <option key={f.identifier} value={f.identifier}>{f.name}</option>)}
                        {writableFeatures.length === 0 && action.targetModelId && <option disabled>无可用控制点位</option>}
                    </select>
                </div>

                <div>
                    <label className="block text-xs text-slate-500 mb-1">设定状态</label>
                    {/* Smart Input for Action Value */}
                    {renderSmartInput(targetFeature, action.value, (val) => updateAction(action.id, 'value', val), "设定状态")}
                </div>
            </div>
        );
    };

    const renderCreateModal = () => {
        if (!isCreateModalOpen) return null;
        const isControl = currentType === 'control';
        const isAlarm = currentType === 'alarm';
        const isBilling = currentType === 'billing';

        return (
            <div className="fixed inset-0 bg-slate-900/50 flex justify-end z-50 backdrop-blur-sm">
                <div className="bg-white w-[800px] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-800">新建{isBilling ? '计费' : (isControl ? '控制' : '报警')}策略</h3>
                        <button onClick={() => setIsCreateModalOpen(false)}><X size={24} className="text-slate-400" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        
                        {/* 0. Template Reference */}
                        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-start gap-3">
                             <BookOpen className="text-indigo-500 mt-1" size={18} />
                             <div className="flex-1">
                                 <label className="block text-sm font-bold text-indigo-900 mb-1">引用标准模板 (可选)</label>
                                 <p className="text-xs text-indigo-700/70 mb-2">从租户标准库中选择模板，系统将自动填充规则与参数。</p>
                                 <select 
                                    className="w-full border-indigo-200 rounded text-sm p-2"
                                    value={createForm.selectedTemplateId}
                                    onChange={(e) => handleTemplateSelect(e.target.value)}
                                 >
                                     <option value="">-- 自定义配置 (不使用模板) --</option>
                                     {TEMPLATE_OPTIONS.filter(t => t.type === currentType).map(t => (
                                         <option key={t.id} value={t.id}>{t.name}</option>
                                     ))}
                                 </select>
                             </div>
                        </div>

                        {/* 1. Basic Info */}
                        <div>
                            <div className="flex items-center gap-2 mb-2"><span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span><h4 className="font-bold text-slate-700">基础信息</h4></div>
                            <div className="pl-8 grid grid-cols-1 gap-4">
                                <input type="text" className="w-full border border-slate-300 rounded p-2 text-sm" placeholder="策略名称" value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} />
                                {isAlarm && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <select className="border border-slate-300 rounded p-2 text-sm" value={createForm.alarmType} onChange={e => setCreateForm({...createForm, alarmType: e.target.value})}>
                                            <option value="">-- 请选择报警类型 --</option>{ALARM_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                        </select>
                                        <select className="border border-slate-300 rounded p-2 text-sm" value={createForm.alarmLevel} onChange={e => setCreateForm({...createForm, alarmLevel: e.target.value})}>
                                            <option value="">-- 请选择报警等级 --</option>{ALARM_LEVELS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Scope */}
                        <div className="border-t border-slate-100 pt-4">
                            <div className="flex items-center gap-2 mb-2"><span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span><h4 className="font-bold text-slate-700">适用范围</h4></div>
                            <div className="pl-8 grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-600 flex items-center gap-1.5"><Building2 size={16} /> 空间范围</label>
                                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 h-40 overflow-y-auto">
                                        {MOCK_SPATIAL_HIERARCHY.map(node => <SpatialNodeItem key={node.id} node={node} selectedIds={createForm.scopeBuildings} onToggle={(id) => toggleScope('scopeBuildings', id)} />)}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-600 flex items-center gap-1.5"><UserCircle size={16} /> 人员类型</label>
                                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 h-40 overflow-y-auto space-y-2">
                                        {MOCK_USER_TYPES.map(u => (
                                            <label key={u.id} className="flex items-center gap-2 cursor-pointer p-1"><input type="checkbox" checked={createForm.scopeUserTypes.includes(u.id)} onChange={() => toggleScope('scopeUserTypes', u.id)} className="rounded" /><span className="text-sm">{u.name}</span></label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Rules */}
                        <div className="border-t border-slate-100 pt-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2"><span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</span><h4 className="font-bold text-slate-700">规则定义</h4></div>
                                <button onClick={() => setCreateForm(prev => ({...prev, rules: [...prev.rules, { id: Date.now().toString(), selectedModelId: '', selectedFeatureIdentifier: '', operator: '>', threshold: '', rangeMin: '', rangeMax: '', resetType: 'never', resetDay: 1, resetTime: '00:00', billingMode: 'paid', billingPrice: '' }]}))} className="text-xs text-blue-600 flex items-center gap-1"><Plus size={14}/> 添加</button>
                            </div>
                            <div className="pl-8">{createForm.rules.map((r, i) => renderRuleRow(r, i))}</div>
                        </div>

                        {/* 4. Actions (Control Only) */}
                        {isControl && (
                            <div className="border-t border-slate-100 pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2"><span className="bg-rose-100 text-rose-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">4</span><h4 className="font-bold text-slate-700">触发动作</h4></div>
                                    <button onClick={() => setCreateForm(prev => ({...prev, actions: [...prev.actions, { id: `a_${Date.now()}`, targetModelId: '', targetActionIdentifier: '', value: '' }]}))} className="text-xs text-blue-600 flex items-center gap-1"><Plus size={14}/> 添加</button>
                                </div>
                                <div className="pl-8 space-y-3">
                                    {createForm.actions.map(a => renderActionRow(a))}
                                </div>
                            </div>
                        )}
                        
                        {/* 4. Result (Alarm Only) */}
                        {isAlarm && (
                            <div className="border-t border-slate-100 pt-4">
                                <div className="flex items-center gap-2 mb-2">
                                     <span className="bg-rose-100 text-rose-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                                     <h4 className="font-bold text-slate-700">触发结果 (THEN)</h4>
                                </div>
                                <div className="pl-8">
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-start gap-4">
                                        <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm text-rose-500">
                                             <Bell size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="font-bold text-slate-800 text-sm">产生报警 (Generate Alarm)</h5>
                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                                系统将根据配置的等级自动生成报警记录。
                                                <br/>
                                                <span className="text-indigo-600 flex items-center gap-1 mt-1">
                                                    <Info size={12} />
                                                    说明：报警记录会展示在“事件管理 - 报警事件”模块中。
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 mt-auto">
                        <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded">取消</button>
                        <button onClick={handleSavePolicy} className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded shadow flex items-center gap-2"><Save size={16} /> 保存策略</button>
                    </div>
                </div>
            </div>
        );
    };

    let title = '计费策略';
    if (currentType === 'control') title = '智能控制策略';
    if (currentType === 'alarm') title = '报警策略';

    return (
        <div className="h-full flex flex-col">
            {renderCreateModal()}
            <div className="flex justify-between items-end mb-6">
                <div><h2 className="text-2xl font-bold text-slate-800">{title}</h2><p className="text-slate-500 mt-1">管理项目级策略配置，支持引用标准模板。</p></div>
                <button onClick={() => openCreateModal()} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-blue-700"><Plus size={18} /><span>新建策略</span></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pb-4">
                {policies.map(p => (
                    <div key={p.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        <div className="flex justify-between items-start mb-3">
                            <div className={`p-3 rounded-lg ${currentType === 'control' ? 'bg-red-100 text-red-600' : (currentType === 'alarm' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600')}`}>
                                {currentType === 'control' ? <Shield size={24} /> : (currentType === 'alarm' ? <AlertTriangle size={24} /> : <FileText size={24} />)}
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => openCreateModal(p)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-50"><Edit size={16}/></button>
                                <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-50"><Trash2 size={16}/></button>
                            </div>
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg mb-1">{p.name}</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {p.sourceType === 'template' && <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded border border-indigo-100">引用模板</span>}
                            {p.tags.map(t => <span key={t} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded">{t}</span>)}
                        </div>
                        <div className="mb-4 bg-slate-50 rounded-lg p-3 border border-slate-100 text-xs space-y-2">
                             <div><span className="font-bold text-slate-500 uppercase flex items-center gap-1"><Hash size={12}/> 规则</span><p className="font-mono mt-1 text-slate-700">{p.ruleSummary}</p></div>
                             <div><span className="font-bold text-slate-500 uppercase flex items-center gap-1"><Building2 size={12}/> 范围</span><p className="mt-1 text-slate-700">{p.scopeSummary}</p></div>
                        </div>
                        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                             <button onClick={() => toggleStatus(p.id)} className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded ${p.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />{p.status === 'active' ? '运行中' : '已停用'}
                            </button>
                            <span className="text-xs text-slate-400">{p.updatedAt}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
