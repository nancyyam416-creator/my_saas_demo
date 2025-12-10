
import React, { useState } from 'react';
import { SubMenuId, DeviceFeature } from '../types';
import { 
    Plus, Search, MoreHorizontal, Zap, Droplets, Shield, Activity, 
    FileText, CreditCard, Clock, Hash, X, Save,
    Calendar, Users, Trash2, ArrowDown, Edit, AlertTriangle, Play, ArrowRight, 
    Building2, UserCircle, ChevronRight, ChevronDown, Layers, DoorOpen, Bell, Info, Gift, Coins
} from 'lucide-react';

interface PolicyTemplateViewProps {
    subType: SubMenuId;
}

interface TemplateCardData {
    id: string;
    title: string;
    description: string;
    tags: string[];
    status: 'published' | 'draft';
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    updatedAt: string;
    ruleSummary?: string; 
    usageCount: number; // To track if the template is in use
    // Mock storage for form re-hydration
    _rules?: RuleItem[];
    _actions?: ActionItem[];
    // Billing specific scopes
    scopeBuildings?: string[]; // Keeps the IDs of selected nodes (Building/Floor/Room)
    scopeUserTypes?: string[];
    // Alarm specific fields
    alarmType?: string;
    alarmLevel?: string;
}

// --- MOCK DATA: DEVICE TYPES & STANDARD ATTRIBUTES ---

interface DeviceTypeOption {
    id: string;
    name: string;
    features: Partial<DeviceFeature>[];
}

const DEVICE_TYPES: DeviceTypeOption[] = [
    {
        id: 'energy_meter',
        name: '电能计量类 (Electricity)',
        features: [
            { name: '累计电量', identifier: 'total_energy', dataType: 'float', unit: 'kWh', specs: { min: 0 }, accessMode: 'r' },
            { name: '有功功率', identifier: 'active_power', dataType: 'float', unit: 'W', specs: { min: 0 }, accessMode: 'r' },
            { name: '当前电压', identifier: 'voltage', dataType: 'float', unit: 'V', specs: { min: 0 }, accessMode: 'r' },
            { name: '当前电流', identifier: 'current', dataType: 'float', unit: 'A', specs: { min: 0 }, accessMode: 'r' },
            { name: '通断控制', identifier: 'power_switch', dataType: 'boolean', unit: '', specs: { trueLabel: '合闸', falseLabel: '跳闸' }, accessMode: 'rw' },
        ]
    },
    {
        id: 'water_meter',
        name: '水务计量类 (Water)',
        features: [
            { name: '累计水量', identifier: 'total_water', dataType: 'float', unit: 'm³', specs: { min: 0 }, accessMode: 'r' },
            { name: '瞬时流量', identifier: 'flow_rate', dataType: 'float', unit: 'm³/h', specs: { min: 0 }, accessMode: 'r' },
            { name: '阀门控制', identifier: 'valve_control', dataType: 'boolean', unit: '', specs: { trueLabel: '开阀', falseLabel: '关阀' }, accessMode: 'rw' },
        ]
    },
    {
        id: 'env_sensor',
        name: '环境传感类 (Environment)',
        features: [
            { name: '室内温度', identifier: 'temperature', dataType: 'float', unit: '℃', specs: { min: -40, max: 80 }, accessMode: 'r' },
            { name: '室内湿度', identifier: 'humidity', dataType: 'float', unit: '%', specs: { min: 0, max: 100 }, accessMode: 'r' },
        ]
    }
];

// Mock Device Models
interface DeviceModelOption {
    id: string;
    name: string;
    typeId: string;
}

const DEVICE_MODELS: DeviceModelOption[] = [
    { id: 'model_meter_pro', name: '智能电表 Pro (v2)', typeId: 'energy_meter' },
    { id: 'model_meter_basic', name: '基础单相电表', typeId: 'energy_meter' },
    { id: 'model_water_iot', name: 'NB-IoT 远传水表', typeId: 'water_meter' },
    { id: 'model_valve_ctrl', name: '智能阀门控制器', typeId: 'water_meter' },
    { id: 'model_th_sensor', name: '温湿度传感器 X1', typeId: 'env_sensor' }
];

// --- Mock Hierarchy Data (Building -> Floor -> Room) ---

interface SpatialNode {
    id: string;
    name: string;
    type: 'building' | 'floor' | 'room';
    children?: SpatialNode[];
}

const MOCK_SPATIAL_HIERARCHY: SpatialNode[] = [
    {
        id: 'b_1',
        name: '1号宿舍楼',
        type: 'building',
        children: [
            {
                id: 'b_1_f_1', name: '1层 (大厅/宿管)', type: 'floor', children: [
                    { id: 'r_101', name: '101室', type: 'room' },
                    { id: 'r_102', name: '102室', type: 'room' },
                ]
            },
            {
                id: 'b_1_f_2', name: '2层 (男生宿舍)', type: 'floor', children: [
                    { id: 'r_201', name: '201室', type: 'room' },
                    { id: 'r_202', name: '202室', type: 'room' },
                    { id: 'r_203', name: '203室', type: 'room' },
                ]
            }
        ]
    },
    {
        id: 'b_2',
        name: '2号宿舍楼',
        type: 'building',
        children: [
            {
                id: 'b_2_f_1', name: '1层', type: 'floor', children: []
            }
        ]
    }
];

const MOCK_USER_TYPES = [
    { id: 'u_1', name: '本科生' },
    { id: 'u_2', name: '研究生' },
    { id: 'u_3', name: '教职工' },
    { id: 'u_4', name: '短期访客' }
];

// --- ALARM CONSTANTS ---
const ALARM_TYPES = [
    { id: 'security', label: '安防报警' },
    { id: 'environment', label: '环境报警' },
    { id: 'device', label: '设备故障' },
    { id: 'behavior', label: '行为监测' }
];

const ALARM_LEVELS = [
    { id: 'critical', label: '严重 (Critical)', color: 'red' },
    { id: 'warning', label: '警告 (Warning)', color: 'orange' },
    { id: 'info', label: '提示 (Info)', color: 'blue' }
];

// Helper to get flattened features
const ALL_FEATURES = DEVICE_TYPES.flatMap(type => 
    type.features.map(feat => ({
        ...feat,
        typeName: type.name,
        typeId: type.id,
        uniqueId: `${type.id}.${feat.identifier}` // Ensure uniqueness
    }))
);

// --- OPERATOR DEFINITIONS ---

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
];

const getOperators = (dataType?: string) => {
    if (!dataType) return OPS_NUMERIC_STRING;
    if (['integer', 'float', 'string'].includes(dataType)) return OPS_NUMERIC_STRING;
    if (['enum', 'boolean'].includes(dataType)) return OPS_ENUM_BOOL;
    if (['datetime'].includes(dataType)) return OPS_DATETIME;
    return OPS_NUMERIC_STRING;
};

interface RuleItem {
    id: string;
    selectedFeatureUniqueId: string; // Used for Legacy/Flat Logic (Deprecated)
    
    // New fields for Billing/Control/Alarm (Model based)
    selectedModelId?: string;
    selectedFeatureIdentifier?: string; 
    
    operator: string;
    threshold: string;
    rangeMin: string;
    rangeMax: string;
    // Reset cycle per rule
    resetType: 'never' | 'daily' | 'monthly';
    resetDay: number;
    resetTime: string;
    
    // Billing specific
    billingMode?: 'free' | 'paid'; // NEW: Mode of billing
    billingPrice?: string; // e.g. "1.5"
}

interface ActionItem {
    id: string;
    targetModelId: string;
    targetActionIdentifier: string;
    value: string;
}

// --- Initial Data ---

const INITIAL_BILLING_DATA: TemplateCardData[] = [
    {
        id: '1',
        title: '基础用水计费',
        description: '当累计用水量大于0时开始计费，适用于常规水表场景。',
        tags: ['水费', '基础计量', '付费策略'],
        status: 'published',
        icon: Droplets,
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-100',
        updatedAt: '2023-10-24',
        ruleSummary: '累计水量 > 0 m³ (单价: 5.0 元/m³)',
        usageCount: 12, // Used by 12 projects
        scopeBuildings: ['b_1'],
        scopeUserTypes: ['u_1', 'u_2'],
        _rules: [{
            id: 'r_bill_1',
            selectedFeatureUniqueId: '',
            selectedModelId: 'model_water_iot',
            selectedFeatureIdentifier: 'total_water',
            operator: '>',
            threshold: '0',
            rangeMin: '',
            rangeMax: '',
            resetType: 'monthly',
            resetDay: 1,
            resetTime: '00:00',
            billingMode: 'paid',
            billingPrice: '5.0'
        }]
    },
    {
        id: '2',
        title: '温控免单区间',
        description: '当室内温度在 18℃ - 26℃ 舒适区间时，给予免费额度（单价0元）。',
        tags: ['电费', '温控', '免费策略'],
        status: 'published',
        icon: Zap,
        iconColor: 'text-amber-600',
        iconBg: 'bg-amber-100',
        updatedAt: '2023-11-02',
        ruleSummary: '温度 Between 18 - 26 ℃ (免费)',
        usageCount: 0, // Not used
        scopeBuildings: ['b_1_f_2'],
        scopeUserTypes: ['u_3'],
        _rules: [{
            id: 'r_bill_2',
            selectedFeatureUniqueId: '',
            selectedModelId: 'model_th_sensor',
            selectedFeatureIdentifier: 'temperature',
            operator: 'BETWEEN', 
            threshold: '',
            rangeMin: '18',
            rangeMax: '26',
            resetType: 'never',
            resetDay: 1,
            resetTime: '00:00',
            billingMode: 'free',
            billingPrice: '0' 
        }]
    }
];

const INITIAL_CONTROL_DATA: TemplateCardData[] = [
    {
        id: 'c1',
        title: '恶性负载断电保护',
        description: '当检测到纯阻性大功率负载（如热得快）接入时，立即跳闸并锁定。',
        tags: ['安全保护', '自动跳闸'],
        status: 'published',
        icon: Shield,
        iconColor: 'text-red-600',
        iconBg: 'bg-red-100',
        updatedAt: '2023-09-15',
        ruleSummary: 'IF 有功功率 > 3000 W THEN 通断控制 = 跳闸',
        usageCount: 5,
        scopeBuildings: ['b_1_f_2'],
        scopeUserTypes: ['u_1'],
        _rules: [{
            id: 'r_mock_1',
            selectedFeatureUniqueId: '',
            selectedModelId: 'model_meter_pro',
            selectedFeatureIdentifier: 'active_power',
            operator: '>',
            threshold: '3000',
            rangeMin: '',
            rangeMax: '',
            resetType: 'never',
            resetDay: 1,
            resetTime: '00:00'
        }],
        _actions: [{
            id: 'a_mock_1',
            targetModelId: 'model_meter_pro',
            targetActionIdentifier: 'power_switch',
            value: '0' // Assuming 0 is False/Off
        }]
    }
];

const INITIAL_ALARM_DATA: TemplateCardData[] = [
    {
        id: 'a1',
        title: '高温预警策略',
        description: '监测室内温度，当温度超过安全阈值（50℃）时触发严重级别报警。',
        tags: ['环境报警', '严重'],
        status: 'published',
        icon: AlertTriangle,
        iconColor: 'text-purple-600',
        iconBg: 'bg-purple-100',
        updatedAt: '2023-08-20',
        usageCount: 8,
        ruleSummary: '室内温度 > 50 ℃',
        scopeBuildings: ['b_1_f_1'],
        scopeUserTypes: ['u_3'],
        alarmType: 'environment',
        alarmLevel: 'critical',
        _rules: [{
            id: 'r_alarm_1',
            selectedFeatureUniqueId: '',
            selectedModelId: 'model_th_sensor',
            selectedFeatureIdentifier: 'temperature',
            operator: '>',
            threshold: '50',
            rangeMin: '',
            rangeMax: '',
            resetType: 'never',
            resetDay: 1,
            resetTime: '00:00'
        }]
    }
];

// --- Recursive Tree Component ---
interface SpatialNodeItemProps {
    node: SpatialNode;
    selectedIds: string[];
    onToggle: (id: string) => void;
    level?: number;
}

const SpatialNodeItem: React.FC<SpatialNodeItemProps> = ({ node, selectedIds, onToggle, level = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedIds.includes(node.id);

    // Icon logic
    const Icon = node.type === 'building' ? Building2 : (node.type === 'floor' ? Layers : DoorOpen);
    const indent = level * 16; // 16px per level

    return (
        <div className="select-none">
            <div 
                className={`flex items-center gap-2 py-1.5 px-2 rounded hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}
                style={{ paddingLeft: `${indent + 8}px` }}
            >
                {/* Expander */}
                <button 
                    onClick={() => setIsExpanded(!isExpanded)} 
                    className={`p-0.5 rounded text-slate-400 hover:bg-slate-200 ${hasChildren ? 'visible' : 'invisible'}`}
                >
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                {/* Checkbox */}
                <input 
                    type="checkbox" 
                    checked={isSelected}
                    onChange={() => onToggle(node.id)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />

                {/* Label */}
                <div 
                    className="flex items-center gap-2 cursor-pointer flex-1"
                    onClick={() => hasChildren ? setIsExpanded(!isExpanded) : onToggle(node.id)}
                >
                    <Icon size={14} className={isSelected ? 'text-blue-600' : 'text-slate-500'} />
                    <span className={`text-sm ${isSelected ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>
                        {node.name}
                    </span>
                    {node.type === 'room' && (
                         <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                             Room
                         </span>
                    )}
                </div>
            </div>

            {/* Children Recursive */}
            {hasChildren && isExpanded && (
                <div>
                    {node.children!.map(child => (
                        <SpatialNodeItem 
                            key={child.id} 
                            node={child} 
                            selectedIds={selectedIds} 
                            onToggle={onToggle}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export const PolicyTemplateView: React.FC<PolicyTemplateViewProps> = ({ subType }) => {
    
    // Global State for Templates
    const [templateState, setTemplateState] = useState<{
        'billing-template': TemplateCardData[],
        'control-template': TemplateCardData[],
        'alarm-template': TemplateCardData[]
    }>({
        'billing-template': INITIAL_BILLING_DATA,
        'control-template': INITIAL_CONTROL_DATA,
        'alarm-template': INITIAL_ALARM_DATA
    });

    // Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
    const [editingUsageCount, setEditingUsageCount] = useState<number>(0);
    
    // Create Form State
    const [createForm, setCreateForm] = useState({
        title: '',
        description: '',
        scopeBuildings: [] as string[],
        scopeUserTypes: [] as string[],
        rules: [] as RuleItem[],
        actions: [] as ActionItem[],
        alarmType: '',
        alarmLevel: ''
    });

    // --- Configuration based on subType ---
    
    let headerTitle = "";
    let headerDesc = "";
    const currentData = templateState[subType] || [];

    switch(subType) {
        case 'billing-template':
            headerTitle = "计费策略模板";
            headerDesc = "通过定义点位属性的监测规则，构建标准化的费用计算模型。";
            break;
        case 'control-template':
            headerTitle = "智能控制模板";
            headerDesc = "封装复杂的硬件控制逻辑（ECA引擎），赋能项目快速落地节能与安全策略。";
            break;
        case 'alarm-template':
            headerTitle = "报警策略模板";
            headerDesc = "统一定义全平台的安防预警标准与响应流程，确保风险事件闭环处理。";
            break;
    }

    // --- Actions ---

    const openModal = (template?: TemplateCardData) => {
        if (template) {
            // Edit Mode
            setEditingTemplateId(template.id);
            setEditingUsageCount(template.usageCount);
            
            setCreateForm({
                title: template.title,
                description: template.description,
                scopeBuildings: template.scopeBuildings || [],
                scopeUserTypes: template.scopeUserTypes || [],
                rules: template._rules || [{
                    id: Date.now().toString(),
                    selectedFeatureUniqueId: '',
                    selectedModelId: '',
                    selectedFeatureIdentifier: '',
                    operator: '>',
                    threshold: '',
                    rangeMin: '',
                    rangeMax: '',
                    resetType: 'never',
                    resetDay: 1,
                    resetTime: '00:00',
                    billingMode: 'paid', // Default
                    billingPrice: '0.00'
                }],
                actions: template._actions || [{
                    id: `act_${Date.now()}`,
                    targetModelId: '',
                    targetActionIdentifier: '',
                    value: ''
                }],
                alarmType: template.alarmType || '',
                alarmLevel: template.alarmLevel || ''
            });
        } else {
            // Create Mode
            setEditingTemplateId(null);
            setEditingUsageCount(0);
            setCreateForm({
                title: '',
                description: '',
                scopeBuildings: [],
                scopeUserTypes: [],
                rules: [{
                    id: Date.now().toString(),
                    selectedFeatureUniqueId: '',
                    selectedModelId: '',
                    selectedFeatureIdentifier: '',
                    operator: '>',
                    threshold: '',
                    rangeMin: '',
                    rangeMax: '',
                    resetType: 'never',
                    resetDay: 1,
                    resetTime: '00:00',
                    billingMode: 'paid', // Default
                    billingPrice: '0.00'
                }],
                actions: [{
                    id: `act_${Date.now()}`,
                    targetModelId: '',
                    targetActionIdentifier: '',
                    value: ''
                }],
                alarmType: '',
                alarmLevel: ''
            });
        }
        setIsCreateModalOpen(true);
    };

    const handleCreateClick = () => {
        openModal();
    };

    const handleDeleteClick = (template: TemplateCardData) => {
        // Snapshot behavior: Deleting a template does not affect running projects.
        if (!window.confirm("确定要删除此模板吗？删除后不会影响已应用该模板的项目。")) {
            return;
        }
        
        setTemplateState(prev => ({
            ...prev,
            [subType]: prev[subType].filter(t => t.id !== template.id)
        }));
    };

    const addRule = () => {
        setCreateForm(prev => ({
            ...prev,
            rules: [...prev.rules, {
                id: Date.now().toString(),
                selectedFeatureUniqueId: '',
                selectedModelId: '',
                selectedFeatureIdentifier: '',
                operator: '>',
                threshold: '',
                rangeMin: '',
                rangeMax: '',
                resetType: 'never',
                resetDay: 1,
                resetTime: '00:00',
                billingMode: 'paid', // Default
                billingPrice: '0.00'
            }]
        }));
    };

    const removeRule = (ruleId: string) => {
        if (createForm.rules.length <= 1) return;
        setCreateForm(prev => ({
            ...prev,
            rules: prev.rules.filter(r => r.id !== ruleId)
        }));
    };

    const updateRule = (ruleId: string, field: keyof RuleItem, value: any) => {
        setCreateForm(prev => ({
            ...prev,
            rules: prev.rules.map(r => {
                if (r.id === ruleId) {
                    const newRule = { ...r, [field]: value };
                    
                    if (field === 'selectedFeatureUniqueId') {
                        // Reset operator to first available for new type
                        const feature = ALL_FEATURES.find(f => f.uniqueId === value);
                        const ops = getOperators(feature?.dataType);
                        newRule.operator = ops[0].value;
                        newRule.threshold = '';
                        newRule.rangeMin = '';
                        newRule.rangeMax = '';
                    }

                    if (field === 'selectedModelId') {
                         newRule.selectedFeatureIdentifier = '';
                         newRule.threshold = '';
                    }

                    return newRule;
                }
                return r;
            })
        }));
    };

    // Action Handlers
    const addAction = () => {
        setCreateForm(prev => ({
            ...prev,
            actions: [...prev.actions, {
                id: `act_${Date.now()}`,
                targetModelId: '',
                targetActionIdentifier: '',
                value: ''
            }]
        }));
    };

    const removeAction = (actionId: string) => {
         if (createForm.actions.length <= 1) return;
        setCreateForm(prev => ({
            ...prev,
            actions: prev.actions.filter(a => a.id !== actionId)
        }));
    };

    const updateAction = (actionId: string, field: keyof ActionItem, value: any) => {
        setCreateForm(prev => ({
            ...prev,
            actions: prev.actions.map(a => {
                if (a.id === actionId) {
                    const newAction = { ...a, [field]: value };
                    // Reset subordinate fields if model changes
                    if (field === 'targetModelId') {
                        newAction.targetActionIdentifier = '';
                        newAction.value = '';
                    }
                    if (field === 'targetActionIdentifier') {
                        newAction.value = '';
                    }
                    return newAction;
                }
                return a;
            })
        }));
    }

    const toggleScope = (field: 'scopeBuildings' | 'scopeUserTypes', id: string) => {
        setCreateForm(prev => {
            const current = prev[field];
            const exists = current.includes(id);
            return {
                ...prev,
                [field]: exists ? current.filter(x => x !== id) : [...current, id]
            };
        });
    }

    const handleSaveTemplate = () => {
        if (!createForm.title) return;

        // Validation based on new requirement: All types use Model/Indicator hierarchy
        if (createForm.rules.some(r => !r.selectedModelId || !r.selectedFeatureIdentifier)) {
            alert("请完整填写规则中的设备模型与点位指标");
            return;
        }
        
        // Validate Actions for Control
        if (subType === 'control-template') {
            if(createForm.actions.some(a => !a.targetModelId || !a.targetActionIdentifier || !a.value)) {
                alert("请完整填写触发动作信息");
                return;
            }
        }
        
        // Validate Alarm
        if (subType === 'alarm-template') {
            if (!createForm.alarmType || !createForm.alarmLevel) {
                alert("请选择报警类型和报警等级");
                return;
            }
        }

        // Determine Icon/Tags based on logic aggregation
        let tags: Set<string> = new Set();
        let icon = FileText;
        let iconColor = 'text-slate-600';
        let iconBg = 'bg-slate-100';

        let ruleSummaries: string[] = [];

        // 1. Summarize Conditions
        createForm.rules.forEach(rule => {
            let featureName = '';
            let unit = '';
            let dataType = 'string';
            
            // All templates now use the Model -> Feature path
            const model = DEVICE_MODELS.find(m => m.id === rule.selectedModelId);
            const type = DEVICE_TYPES.find(t => t.id === model?.typeId);
            const feat = type?.features.find(f => f.identifier === rule.selectedFeatureIdentifier);
            featureName = feat?.name || '';
            unit = feat?.unit || '';
            dataType = feat?.dataType || 'string';

            const isRange = rule.operator === 'BETWEEN' || rule.operator === 'NOT_BETWEEN';

            // Tagging
            if (unit === 'm³' || unit === 'L' || featureName.includes('水')) {
                tags.add('水费');
            } else if (unit === 'kWh' || unit === 'kW' || featureName.includes('电') || featureName.includes('功率')) {
                tags.add('电费');
            }

            // Summary Text
            let valDisplay = rule.threshold;
            if (isRange) {
                valDisplay = `${rule.rangeMin} ~ ${rule.rangeMax}`;
            } else {
                // Not perfectly resolving boolean labels here for complexity, keeping simple
                if (dataType === 'boolean') {
                    valDisplay = rule.threshold === '1' ? 'True' : 'False';
                }
            }
            
            const allOps = [...OPS_NUMERIC_STRING, ...OPS_ENUM_BOOL, ...OPS_DATETIME];
            const opObj = allOps.find(op => op.value === rule.operator);
            const opLabel = opObj ? opObj.label.split('(')[0].trim() : rule.operator;
            
            let summary = `${featureName} ${opLabel} ${valDisplay} ${unit}`;
            if (subType === 'billing-template') {
                if (rule.billingMode === 'free') {
                    summary += ` (免费)`;
                    tags.add('免费策略');
                } else {
                    summary += ` (单价: ${rule.billingPrice || '0'} 元/${unit || '次'})`;
                    tags.add('付费策略');
                }
            }
            ruleSummaries.push(summary);
        });

        // 2. Summarize Actions (If Control)
        let actionSummaries: string[] = [];
        if (subType === 'control-template') {
            createForm.actions.forEach(act => {
                const targetModel = DEVICE_MODELS.find(m => m.id === act.targetModelId);
                const targetType = DEVICE_TYPES.find(t => t.id === targetModel?.typeId);
                const feature = targetType?.features.find(f => f.identifier === act.targetActionIdentifier);
                let valDisplay = act.value;
                if (feature?.dataType === 'boolean' && feature.specs) {
                    const specs = feature.specs as any;
                    valDisplay = act.value === '1' ? (specs.trueLabel || 'True') : (specs.falseLabel || 'False');
                }
                actionSummaries.push(`${feature?.name} = ${valDisplay}`);
            });
            tags.add('智能控制');
        } else if (subType === 'alarm-template') {
            const typeLabel = ALARM_TYPES.find(t => t.id === createForm.alarmType)?.label || '报警';
            const levelLabel = ALARM_LEVELS.find(l => l.id === createForm.alarmLevel)?.label.split('(')[0].trim() || '';
            tags.add(typeLabel);
            tags.add(levelLabel);
        } else {
            tags.add('通用计费');
        }

        // Construct Final Summary
        let finalSummary = "";
        if (subType === 'control-template') {
            finalSummary = `IF ${ruleSummaries.join(' && ')} THEN ${actionSummaries.join(' & ')}`;
        } else {
            finalSummary = ruleSummaries.join(' && ');
        }

        // Set Main Icon based on tags
        if (subType === 'control-template') {
            icon = Shield;
            iconColor = 'text-red-600';
            iconBg = 'bg-red-100';
        } else if (subType === 'alarm-template') {
            icon = AlertTriangle;
            iconColor = 'text-purple-600';
            iconBg = 'bg-purple-100';
        } else if (tags.has('水费') && !tags.has('电费')) {
            icon = Droplets;
            iconColor = 'text-blue-600';
            iconBg = 'bg-blue-100';
        } else if (tags.has('电费')) {
            icon = Zap;
            iconColor = 'text-amber-600';
            iconBg = 'bg-amber-100';
        } else {
            icon = CreditCard;
            iconColor = 'text-indigo-600';
            iconBg = 'bg-indigo-100';
        }

        const isPublishedByDefault = subType === 'billing-template' || subType === 'control-template' || subType === 'alarm-template';

        if (editingTemplateId) {
             // Update Existing
             setTemplateState(prev => ({
                ...prev,
                [subType]: prev[subType].map(t => t.id === editingTemplateId ? {
                    ...t,
                    title: createForm.title,
                    description: createForm.description,
                    tags: Array.from(tags),
                    icon, iconColor, iconBg,
                    updatedAt: new Date().toLocaleDateString(),
                    ruleSummary: finalSummary,
                    _rules: createForm.rules,
                    _actions: createForm.actions,
                    scopeBuildings: createForm.scopeBuildings,
                    scopeUserTypes: createForm.scopeUserTypes,
                    alarmType: createForm.alarmType,
                    alarmLevel: createForm.alarmLevel
                } : t)
            }));
        } else {
            // Create New
            const newTemplate: TemplateCardData = {
                id: `new_${Date.now()}`,
                title: createForm.title,
                description: createForm.description || '暂无描述',
                tags: Array.from(tags),
                status: isPublishedByDefault ? 'published' : 'draft',
                icon: icon,
                iconColor: iconColor,
                iconBg: iconBg,
                updatedAt: new Date().toLocaleDateString(),
                ruleSummary: finalSummary,
                usageCount: 0,
                _rules: createForm.rules,
                _actions: createForm.actions,
                scopeBuildings: createForm.scopeBuildings,
                scopeUserTypes: createForm.scopeUserTypes,
                alarmType: createForm.alarmType,
                alarmLevel: createForm.alarmLevel
            };
            setTemplateState(prev => ({
                ...prev,
                [subType]: [newTemplate, ...prev[subType]]
            }));
        }

        setIsCreateModalOpen(false);
    };

    // --- Render Helpers ---

    const renderRuleRow = (rule: RuleItem, index: number) => {
        let feature: Partial<DeviceFeature> | undefined;
        let availableOps: {value: string, label: string}[] = [];
        
        // Unified Logic: All templates use Model -> Feature hierarchy
        let modelFeatures: Partial<DeviceFeature>[] = [];

        const model = DEVICE_MODELS.find(m => m.id === rule.selectedModelId);
        const type = DEVICE_TYPES.find(t => t.id === model?.typeId);
        modelFeatures = type?.features || [];
        feature = modelFeatures.find(f => f.identifier === rule.selectedFeatureIdentifier);
        availableOps = getOperators(feature?.dataType);

        const isRange = rule.operator === 'BETWEEN';
        
        const commonInputClasses = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm";
        const unitLabel = <span className="absolute right-3 top-2 text-xs text-slate-400 pointer-events-none">{feature?.unit || ''}</span>;

        return (
            <div key={rule.id} className="relative">
                {/* AND Connector */}
                {index > 0 && (
                     <div className="flex items-center justify-center py-2 relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-slate-200 border-dashed"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-slate-50 px-2 text-xs font-bold text-slate-400 border border-slate-200 rounded-full">AND</span>
                        </div>
                    </div>
                )}
                
                {/* Rule Card */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 group relative hover:border-blue-200 transition-colors">
                    {/* Delete Button (Only if > 1 rule) */}
                    {createForm.rules.length > 1 && (
                        <button 
                            onClick={() => removeRule(rule.id)}
                            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="删除此规则"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                    
                    {/* BILLING MODE SWITCHER (New) */}
                    {subType === 'billing-template' && (
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
                        
                        {/* 1. Feature / Model Select */}
                        <div className="col-span-3">
                            <label className="block text-xs font-medium text-slate-500 mb-1">
                                触发源 (设备模型)
                            </label>
                            <select 
                                className={commonInputClasses}
                                value={rule.selectedModelId}
                                onChange={(e) => updateRule(rule.id, 'selectedModelId', e.target.value)}
                            >
                                <option value="">-- 选择模型 --</option>
                                {DEVICE_MODELS.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-3">
                            <label className="block text-xs font-medium text-slate-500 mb-1">
                                {subType === 'billing-template' ? '监测属性' : '触发指标'}
                            </label>
                            <select 
                                className={commonInputClasses}
                                value={rule.selectedFeatureIdentifier}
                                onChange={(e) => updateRule(rule.id, 'selectedFeatureIdentifier', e.target.value)}
                                disabled={!rule.selectedModelId}
                            >
                                <option value="">-- 选择指标 --</option>
                                {modelFeatures.map(feat => (
                                    <option key={feat.identifier} value={feat.identifier}>
                                        {feat.name} ({feat.identifier})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 2. Operator */}
                        <div className={subType === 'billing-template' || subType === 'control-template' ? "col-span-2" : "col-span-3"}>
                            <label className="block text-xs font-medium text-slate-500 mb-1">逻辑运算符</label>
                            <select 
                                className={commonInputClasses}
                                value={rule.operator}
                                onChange={(e) => updateRule(rule.id, 'operator', e.target.value)}
                            >
                                {availableOps.map(op => (
                                    <option key={op.value} value={op.value}>{op.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* 3. Threshold */}
                        <div className={subType === 'billing-template' || subType === 'control-template' ? "col-span-2" : "col-span-3"}>
                            <label className="block text-xs font-medium text-slate-500 mb-1">
                                触发阈值
                            </label>
                            
                            {isRange ? (
                                <div className="flex items-center gap-1">
                                    <input 
                                        type="number" 
                                        className={commonInputClasses + " px-1 text-center"}
                                        value={rule.rangeMin}
                                        onChange={(e) => updateRule(rule.id, 'rangeMin', e.target.value)}
                                        placeholder="Min"
                                    />
                                    <span className="text-slate-400 text-xs">~</span>
                                    <input 
                                        type="number" 
                                        className={commonInputClasses + " px-1 text-center"}
                                        value={rule.rangeMax}
                                        onChange={(e) => updateRule(rule.id, 'rangeMax', e.target.value)}
                                        placeholder="Max"
                                    />
                                </div>
                            ) : (
                                <div className="relative">
                                     {feature?.dataType === 'boolean' ? (
                                        <select
                                            className={commonInputClasses}
                                            value={rule.threshold}
                                            onChange={(e) => updateRule(rule.id, 'threshold', e.target.value)}
                                        >
                                            <option value="">请选择</option>
                                            <option value="1">True / 开启</option>
                                            <option value="0">False / 关闭</option>
                                        </select>
                                     ) : (
                                         <div className="relative">
                                            <input 
                                                type="text" 
                                                className={commonInputClasses + " pr-6"}
                                                value={rule.threshold}
                                                onChange={(e) => updateRule(rule.id, 'threshold', e.target.value)}
                                                placeholder="阈值"
                                                disabled={!feature}
                                            />
                                        </div>
                                     )}
                                </div>
                            )}
                        </div>

                        {/* 4. Billing Price (Only for Paid Billing) */}
                        {subType === 'billing-template' && (
                             <div className="col-span-2">
                                <label className="block text-xs font-medium text-slate-500 mb-1">计费单价</label>
                                {rule.billingMode === 'free' ? (
                                    <div className="w-full px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg text-sm text-emerald-700 font-medium flex items-center justify-center">
                                        免费 / 0元
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            className={commonInputClasses + " pr-16 font-bold text-orange-600"}
                                            value={rule.billingPrice}
                                            onChange={(e) => updateRule(rule.id, 'billingPrice', e.target.value)}
                                            placeholder="0.00"
                                        />
                                        <span className="absolute right-3 top-2 text-xs text-slate-400 pointer-events-none bg-white pl-1">
                                            元 / {feature?.unit || '次'}
                                        </span>
                                    </div>
                                )}
                             </div>
                        )}
                    </div>
                    
                    {/* Reset Cycle Configuration (Only for Billing AND Free Mode) */}
                    {subType === 'billing-template' && rule.billingMode === 'free' && (
                        <div className="mt-3 pt-3 border-t border-slate-200 border-dashed animate-in slide-in-from-top-2 fade-in">
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                    <Clock size={12} />
                                    数据重置周期 (免费额度):
                                </span>
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name={`resetType-${rule.id}`}
                                            value="never" 
                                            checked={rule.resetType === 'never'} 
                                            onChange={() => updateRule(rule.id, 'resetType', 'never')}
                                            className="text-emerald-600 focus:ring-emerald-500 w-3 h-3" 
                                        />
                                        <span className="text-xs text-slate-600">不重置</span>
                                    </label>

                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name={`resetType-${rule.id}`} 
                                            value="daily" 
                                            checked={rule.resetType === 'daily'}
                                            onChange={() => updateRule(rule.id, 'resetType', 'daily')}
                                            className="text-emerald-600 focus:ring-emerald-500 w-3 h-3" 
                                        />
                                        <span className="text-xs text-slate-600">每日</span>
                                    </label>

                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name={`resetType-${rule.id}`} 
                                            value="monthly" 
                                            checked={rule.resetType === 'monthly'}
                                            onChange={() => updateRule(rule.id, 'resetType', 'monthly')}
                                            className="text-emerald-600 focus:ring-emerald-500 w-3 h-3" 
                                        />
                                        <span className="text-xs text-slate-600">每月</span>
                                    </label>
                                </div>

                                {/* Dynamic Inputs based on Reset Type */}
                                {rule.resetType !== 'never' && (
                                    <div className="flex items-center gap-3 ml-2 animate-in fade-in slide-in-from-left-2">
                                        {rule.resetType === 'monthly' && (
                                            <select 
                                                className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-emerald-500"
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
                                            className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-emerald-500"
                                            value={rule.resetTime}
                                            onChange={(e) => updateRule(rule.id, 'resetTime', e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Info text for Paid mode to explain why reset is hidden */}
                    {subType === 'billing-template' && (rule.billingMode === 'paid' || !rule.billingMode) && (
                         <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1 pl-1">
                             <Info size={10} /> 付费模式下数据将根据系统账期统一计算，无需单独配置重置周期。
                         </div>
                    )}

                </div>
            </div>
        );
    };

    const renderActionRow = (action: ActionItem, index: number) => {
        const commonInputClasses = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm";
        const selectedModel = DEVICE_MODELS.find(m => m.id === action.targetModelId);
        const selectedType = DEVICE_TYPES.find(t => t.id === selectedModel?.typeId);
        
        // Filter controllable features (using new accessMode logic)
        const controllableFeatures = selectedType?.features.filter(f => f.accessMode === 'rw' || f.accessMode === 'w') || [];
        const selectedFeature = controllableFeatures.find(f => f.identifier === action.targetActionIdentifier);

        return (
             <div key={action.id} className="relative">
                 {/* Connector */}
                {index > 0 && (
                     <div className="flex items-center justify-center py-2 relative">
                         <span className="bg-slate-50 px-2 text-xs font-bold text-slate-400">&</span>
                    </div>
                )}
                 <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 group relative hover:border-blue-200 transition-colors">
                     {createForm.actions.length > 1 && (
                        <button 
                            onClick={() => removeAction(action.id)}
                            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                    
                    <div className="grid grid-cols-3 gap-3">
                        {/* 1. Target Model */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">执行对象 (设备模型)</label>
                            <select 
                                className={commonInputClasses}
                                value={action.targetModelId}
                                onChange={(e) => updateAction(action.id, 'targetModelId', e.target.value)}
                            >
                                <option value="">-- 选择设备模型 --</option>
                                {DEVICE_MODELS.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                        {/* 2. Action Feature */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">指定动作 (点位)</label>
                            <select 
                                className={commonInputClasses}
                                value={action.targetActionIdentifier}
                                onChange={(e) => updateAction(action.id, 'targetActionIdentifier', e.target.value)}
                                disabled={!action.targetModelId}
                            >
                                <option value="">-- 选择动作 --</option>
                                {controllableFeatures.map(f => (
                                    <option key={f.identifier} value={f.identifier}>{f.name}</option>
                                ))}
                                {controllableFeatures.length === 0 && action.targetModelId && <option disabled>该设备无可用控制点位</option>}
                            </select>
                        </div>
                        {/* 3. Value */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">设定状态</label>
                             {selectedFeature?.dataType === 'boolean' ? (
                                <select
                                    className={commonInputClasses}
                                    value={action.value}
                                    onChange={(e) => updateAction(action.id, 'value', e.target.value)}
                                >
                                    <option value="">请选择</option>
                                    <option value="1">{(selectedFeature.specs as any).trueLabel || 'True'}</option>
                                    <option value="0">{(selectedFeature.specs as any).falseLabel || 'False'}</option>
                                </select>
                             ) : (
                                 <input 
                                    type="text" 
                                    className={commonInputClasses}
                                    value={action.value}
                                    onChange={(e) => updateAction(action.id, 'value', e.target.value)}
                                    placeholder="输入设定值"
                                    disabled={!selectedFeature}
                                />
                             )}
                        </div>
                    </div>
                 </div>
             </div>
        );
    }

    const renderCreateModal = () => {
        if (!isCreateModalOpen) return null;
        
        const isEditMode = !!editingTemplateId;
        const showScope = true; // Enabled for all types: Billing, Control, Alarm

        return (
            <div className="fixed inset-0 bg-slate-900/50 flex justify-end z-50 backdrop-blur-sm">
                <div className="bg-white w-[800px] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">
                                {isEditMode ? `编辑${subType === 'control-template' ? '控制' : (subType === 'alarm-template' ? '报警' : '计费')}策略模板` : `新建${subType === 'control-template' ? '控制' : (subType === 'alarm-template' ? '报警' : '计费')}策略模板`}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                {subType === 'alarm-template' ? '定义异常触发条件与报警逻辑' : '配置设备点位属性的监测规则'}{subType === 'control-template' && '与自动执行动作'}
                            </p>
                        </div>
                        <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">

                        {/* 1. Basic Info */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                <h4 className="font-bold text-slate-700">基础信息</h4>
                            </div>
                            <div className="grid grid-cols-1 gap-4 pl-8">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">模板名称</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="例如：标准商业用电计费"
                                        value={createForm.title}
                                        onChange={(e) => setCreateForm({...createForm, title: e.target.value})}
                                    />
                                </div>
                                
                                {/* Alarm Type & Level Selectors */}
                                {subType === 'alarm-template' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">报警类型</label>
                                            <select 
                                                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={createForm.alarmType}
                                                onChange={(e) => setCreateForm({...createForm, alarmType: e.target.value})}
                                            >
                                                <option value="">-- 请选择 --</option>
                                                {ALARM_TYPES.map(t => (
                                                    <option key={t.id} value={t.id}>{t.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">报警等级</label>
                                            <select 
                                                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={createForm.alarmLevel}
                                                onChange={(e) => setCreateForm({...createForm, alarmLevel: e.target.value})}
                                            >
                                                <option value="">-- 请选择 --</option>
                                                {ALARM_LEVELS.map(l => (
                                                    <option key={l.id} value={l.id}>{l.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">策略描述</label>
                                    <textarea 
                                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                                        placeholder="描述该策略的适用场景和规则逻辑..."
                                        value={createForm.description}
                                        onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                         {/* 1.5 Scope Definition (All Types) */}
                         {showScope && (
                             <>
                                <div className="border-t border-slate-100 my-2"></div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                        <h4 className="font-bold text-slate-700">适用范围 (Scope)</h4>
                                    </div>
                                    <div className="pl-8 grid grid-cols-2 gap-6">
                                        {/* Spatial Scope (Tree) */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                                                <Building2 size={16} /> 空间范围 (楼栋/层/室)
                                            </label>
                                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 h-48 overflow-y-auto">
                                                {MOCK_SPATIAL_HIERARCHY.map(node => (
                                                    <SpatialNodeItem 
                                                        key={node.id} 
                                                        node={node}
                                                        selectedIds={createForm.scopeBuildings}
                                                        onToggle={(id) => toggleScope('scopeBuildings', id)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                         {/* User Type Scope */}
                                         <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                                                <UserCircle size={16} /> 人员类型
                                            </label>
                                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 h-48 overflow-y-auto space-y-2">
                                                {MOCK_USER_TYPES.map(u => (
                                                    <label key={u.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={createForm.scopeUserTypes.includes(u.id)}
                                                            onChange={() => toggleScope('scopeUserTypes', u.id)}
                                                            className="rounded text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm text-slate-700">{u.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             </>
                         )}

                        <div className="border-t border-slate-100 my-2"></div>

                        {/* 2. Rule Definition (Trigger Source) */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                                    <h4 className="font-bold text-slate-700">
                                        {subType === 'billing-template' ? '规则与计费' : (subType === 'control-template' || subType === 'alarm-template' ? '触发源定义 (IF)' : '规则定义')}
                                    </h4>
                                </div>
                                <button 
                                    onClick={addRule}
                                    className="flex items-center gap-1 text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                >
                                    <Plus size={14} /> 添加条件
                                </button>
                            </div>
                            
                            <div className="pl-8 space-y-4">
                                {createForm.rules.map((rule, index) => renderRuleRow(rule, index))}
                            </div>
                        </div>

                        {/* 3. Result Definition (Only for Alarm) */}
                        {subType === 'alarm-template' && (
                            <>
                                <div className="border-t border-slate-100 my-2"></div>
                                <div className="space-y-4">
                                    {/* Header */}
                                    <div className="flex items-center gap-2 mb-2">
                                         <span className="bg-rose-100 text-rose-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                                         <h4 className="font-bold text-slate-700">触发结果 (THEN)</h4>
                                    </div>

                                    {/* Content Card */}
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
                            </>
                        )}

                        {/* 4. Action Definition (Only for Control) */}
                        {subType === 'control-template' && (
                            <>
                                <div className="border-t border-slate-100 my-2"></div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-rose-100 text-rose-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                                            <h4 className="font-bold text-slate-700">触发动作 (THEN)</h4>
                                        </div>
                                        <button 
                                            onClick={addAction}
                                            className="flex items-center gap-1 text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                        >
                                            <Plus size={14} /> 添加动作
                                        </button>
                                    </div>
                                    
                                    <div className="pl-8 space-y-4">
                                        {createForm.actions.map((action, index) => renderActionRow(action, index))}
                                    </div>
                                </div>
                            </>
                        )}

                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 mt-auto">
                        <button 
                            onClick={() => setIsCreateModalOpen(false)}
                            className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            取消
                        </button>
                        <button 
                            onClick={handleSaveTemplate}
                            className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-200 transition-colors flex items-center gap-2"
                        >
                            <Save size={16} />
                            {isEditMode ? '更新模板' : (subType === 'billing-template' || subType === 'control-template' || subType === 'alarm-template' ? '发布模板' : '保存模板')}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col">
            {renderCreateModal()}
            
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{headerTitle}</h2>
                    <p className="text-slate-500 mt-1">{headerDesc}</p>
                </div>
                <button 
                    onClick={handleCreateClick}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl transition-all"
                >
                    <Plus size={18} />
                    <span>新建模板</span>
                </button>
            </div>

            {/* Grid Content */}
            {currentData.length === 0 ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <div className="bg-slate-100 p-4 rounded-full mb-3">
                        <FileText size={32} className="text-slate-300" />
                    </div>
                    <p className="font-medium">暂无模板数据</p>
                    <p className="text-sm mt-1">点击右上角新建</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pb-4">
                    {currentData.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col relative">
                            <div className="flex justify-between items-start mb-3">
                                <div className={`p-3 rounded-lg ${item.iconBg}`}>
                                    <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                                </div>
                                
                                <div className="flex gap-1">
                                     <button 
                                        onClick={() => openModal(item)}
                                        className="text-slate-400 hover:text-blue-600 p-1.5 rounded hover:bg-blue-50 transition-colors"
                                        title="编辑"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClick(item)}
                                        className="text-slate-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors"
                                        title="删除"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            
                            <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2 h-10">
                                {item.description}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {item.tags.map((tag, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Rule Summary Logic Display */}
                            {item.ruleSummary && (
                                <div className="mb-4 bg-slate-50 rounded-lg p-3 border border-slate-100">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <Hash size={12} className="text-slate-400" />
                                        <span className="text-xs font-bold text-slate-500 uppercase">生效规则</span>
                                    </div>
                                    <p className="text-xs text-slate-700 font-mono leading-relaxed break-all">
                                        {item.ruleSummary}
                                    </p>
                                </div>
                            )}

                             {/* Usage Status Display */}
                             <div className="mb-4 flex items-center gap-2 text-xs">
                                {item.usageCount > 0 ? (
                                    <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                        <Activity size={12} />
                                        {item.usageCount} 个项目使用中
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                        <Activity size={12} />
                                        未使用
                                    </span>
                                )}
                            </div>

                            <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                                <span className={`flex items-center gap-1.5 text-xs font-medium ${
                                    item.status === 'published' ? 'text-emerald-600' : 'text-amber-600'
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                        item.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'
                                    }`} />
                                    {item.status === 'published' ? '已发布' : '草稿'}
                                </span>
                                <span className="text-xs text-slate-400">
                                    更新于 {item.updatedAt}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
