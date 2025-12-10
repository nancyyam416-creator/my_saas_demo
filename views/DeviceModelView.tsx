

import React, { useState } from 'react';
import { DeviceModel, DeviceFeature, DeviceModelFilter, DeviceType } from '../types';
import { Search, Plus, Settings, ChevronLeft, ChevronRight, ChevronDown, FolderPlus, Box, X, Save, Trash2, BookOpen, AlertCircle, Edit, MoreHorizontal } from 'lucide-react';

// --- Initial Mock Data ---

const INITIAL_TYPES: DeviceType[] = [
  { id: 'security', name: '安防设备', code: 'security' },
  { id: 'energy', name: '能源计量', code: 'energy' },
];

const INITIAL_MODELS: DeviceModel[] = [
  { id: 'door', typeId: 'security', name: '人脸门禁', code: 'access_control' },
  { id: 'camera', typeId: 'security', name: '监控摄像头', code: 'camera' },
  { id: 'wall', typeId: 'security', name: '围墙机', code: 'wall_unit' },
  { id: 'meter', typeId: 'energy', name: '智能电表', code: 'smart_meter' },
  { id: 'water_meter', typeId: 'energy', name: '智能水表', code: 'water_meter' },
];

const MOCK_FEATURES: DeviceFeature[] = [
  { id: '1', name: '开门状态', identifier: 'open_status', dataType: 'enum', dataTypeLabel: 'enum (枚举)', accessMode: 'rw', unit: '-', specs: { '0': '关闭', '1': '开启' } },
  { id: '2', name: '开门时间', identifier: 'open_time', dataType: 'datetime', dataTypeLabel: 'datetime (时间)', accessMode: 'r', unit: '-', specs: { format: 'YYYY-MM-DD HH:mm:ss' } },
  { id: '3', name: '呼叫状态', identifier: 'call_status', dataType: 'enum', dataTypeLabel: 'enum (枚举)', accessMode: 'r', unit: '-', specs: { '0': '空闲', '1': '呼叫中' } },
  { id: '4', name: '设备音量', identifier: 'volume', dataType: 'integer', dataTypeLabel: 'int (整数)', accessMode: 'rw', unit: '%', specs: { min: 0, max: 100, step: 1 } },
  { id: '5', name: '固件版本', identifier: 'firmware_ver', dataType: 'string', dataTypeLabel: 'string (字符串)', accessMode: 'r', unit: '-', specs: { maxLength: 50 } },
];

// --- Standard Templates Library ---

const STANDARD_TEMPLATES: Record<string, Partial<DeviceFeature>[]> = {
  '通用属性': [
    { name: '在线状态', identifier: 'online_status', dataType: 'boolean', unit: '-', accessMode: 'r', specs: { trueLabel: '在线', falseLabel: '离线' } },
    { name: '设备信号(RSSI)', identifier: 'rssi', dataType: 'integer', unit: 'dBm', accessMode: 'r', specs: { min: -120, max: 0, step: 1 } },
    { name: '电池电量', identifier: 'battery_level', dataType: 'integer', unit: '%', accessMode: 'r', specs: { min: 0, max: 100, step: 1 } },
    { name: '固件版本', identifier: 'firmware_version', dataType: 'string', unit: '-', accessMode: 'r', specs: { maxLength: 32 } },
  ],
  '电能计量': [
    { name: '累计电量', identifier: 'total_energy', dataType: 'float', unit: 'kWh', accessMode: 'r', specs: { min: 0, max: 999999, step: 0.01 } },
    { name: '电压', identifier: 'voltage', dataType: 'float', unit: 'V', accessMode: 'r', specs: { min: 0, max: 380, step: 0.1 } },
    { name: '电流', identifier: 'current', dataType: 'float', unit: 'A', accessMode: 'r', specs: { min: 0, max: 100, step: 0.01 } },
    { name: '有功功率', identifier: 'active_power', dataType: 'float', unit: 'W', accessMode: 'r', specs: { min: 0, max: 50000, step: 0.1 } },
    { name: '开关控制', identifier: 'power_switch', dataType: 'boolean', unit: '-', accessMode: 'rw', specs: { trueLabel: '合闸', falseLabel: '跳闸' } },
  ],
  '水务计量': [
     { name: '累计水量', identifier: 'total_water', dataType: 'float', unit: 'm³', accessMode: 'r', specs: { min: 0, max: 999999, step: 0.001 } },
     { name: '阀门控制', identifier: 'valve_control', dataType: 'enum', unit: '-', accessMode: 'rw', specs: { '0': '关阀', '1': '开阀', '2': '50%开度' } },
  ],
  '环境传感': [
    { name: '环境温度', identifier: 'temperature', dataType: 'float', unit: '℃', accessMode: 'r', specs: { min: -40, max: 80, step: 0.1 } },
    { name: '环境湿度', identifier: 'humidity', dataType: 'float', unit: '%', accessMode: 'r', specs: { min: 0, max: 100, step: 1 } },
  ],
  '配置参数': [
    { name: '报警阈值设定', identifier: 'alarm_threshold', dataType: 'integer', unit: '-', accessMode: 'rw', specs: { min: 0, max: 100, step: 1 } },
    { name: '上报周期', identifier: 'report_interval', dataType: 'integer', unit: '秒', accessMode: 'rw', specs: { min: 60, max: 86400, step: 60 } },
  ]
};

// Flatten templates for easier list rendering
const FLATTENED_TEMPLATES = Object.values(STANDARD_TEMPLATES).flat();

// --- Components ---

export const DeviceModelView: React.FC = () => {
  // Data State
  const [types, setTypes] = useState<DeviceType[]>(INITIAL_TYPES);
  const [models, setModels] = useState<DeviceModel[]>(INITIAL_MODELS);
  const [features, setFeatures] = useState<DeviceFeature[]>(MOCK_FEATURES);

  // UI State
  const [selectedModelId, setSelectedModelId] = useState<string>('door');
  const [filter, setFilter] = useState<DeviceModelFilter>({ functionName: '', identifier: '' });
  
  // Modal States
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);

  // Edit States
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);

  // Form States
  const [typeForm, setTypeForm] = useState({ name: '', code: '' });
  const [modelForm, setModelForm] = useState({ name: '', code: '', description: '', typeId: '' });
  
  const [featureForm, setFeatureForm] = useState<{
      name: string;
      identifier: string;
      dataType: DeviceFeature['dataType'];
      unit: string;
      accessMode: DeviceFeature['accessMode'];
      specs: any;
  }>({
      name: '',
      identifier: '',
      dataType: 'integer',
      unit: '',
      accessMode: 'r',
      specs: {}
  });

  // State to control Read-Only mode when a template is selected
  const [isReadOnly, setIsReadOnly] = useState(false);
  // Validation Error State
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Derived State
  const selectedModel = models.find(m => m.id === selectedModelId);

  // --- Handlers ---

  const handleFilterChange = (key: keyof DeviceModelFilter, value: string) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilter({ functionName: '', identifier: '' });
  };

  // --- Type Handlers ---

  const openTypeModal = (type?: DeviceType) => {
      if (type) {
          setEditingTypeId(type.id);
          setTypeForm({ name: type.name, code: type.code });
      } else {
          setEditingTypeId(null);
          setTypeForm({ name: '', code: '' });
      }
      setIsTypeModalOpen(true);
  };

  const handleDeleteType = (e: React.MouseEvent, type: DeviceType) => {
      e.stopPropagation();
      const isUsed = models.some(m => m.typeId === type.id);
      if (isUsed) {
          alert(`无法删除类型 "${type.name}"，因为当前有设备模型属于该类型。请先删除相关模型。`);
          return;
      }
      if (window.confirm(`确定要删除类型 "${type.name}" 吗？`)) {
          setTypes(prev => prev.filter(t => t.id !== type.id));
      }
  };

  const handleSaveType = () => {
      if (!typeForm.name) {
          alert("请填写完整信息");
          return;
      }
      if (editingTypeId) {
          setTypes(prev => prev.map(t => t.id === editingTypeId ? { ...t, name: typeForm.name } : t));
      } else {
          const newCode = `type_${Date.now()}`;
          setTypes(prev => [...prev, { id: newCode, name: typeForm.name, code: newCode }]);
      }
      setIsTypeModalOpen(false);
  };

  // --- Model Handlers ---

  const openModelModal = (model?: DeviceModel) => {
      if (model) {
          setEditingModelId(model.id);
          setModelForm({ name: model.name, code: model.code, description: model.description || '', typeId: model.typeId });
      } else {
          setEditingModelId(null);
          // Default to first type if creating
          setModelForm({ name: '', code: '', description: '', typeId: types[0]?.id || '' });
      }
      setIsModelModalOpen(true);
  };

  const handleDeleteModel = (e: React.MouseEvent, model: DeviceModel) => {
      e.stopPropagation();
      if (window.confirm(`确定要删除模型 "${model.name}" 吗？`)) {
          setModels(prev => prev.filter(m => m.id !== model.id));
          if (selectedModelId === model.id) {
              setSelectedModelId('');
          }
      }
  };

  const handleSaveModel = () => {
      if (!modelForm.name || !modelForm.typeId) {
          alert("请填写完整信息");
          return;
      }
      if (editingModelId) {
          setModels(prev => prev.map(m => m.id === editingModelId ? { ...m, ...modelForm } : m));
      } else {
          const newId = `model_${Date.now()}`;
          const newCode = `code_${Date.now()}`;
          setModels(prev => [...prev, { id: newId, ...modelForm, code: newCode }]);
          setSelectedModelId(newId);
      }
      setIsModelModalOpen(false);
  };

  // --- Feature Handlers ---

  const openFeatureModal = (feature?: DeviceFeature) => {
      if (feature) {
          setEditingFeatureId(feature.id);
          setFeatureForm({
              name: feature.name,
              identifier: feature.identifier,
              dataType: feature.dataType,
              unit: feature.unit,
              accessMode: feature.accessMode,
              specs: feature.specs || {}
          });
          setIsReadOnly(false); 
      } else {
          setEditingFeatureId(null);
          setFeatureForm({
              name: '',
              identifier: '',
              dataType: 'integer',
              unit: '',
              accessMode: 'r',
              specs: { min: 0, max: 100, step: 1 } // default specs
          });
          setIsReadOnly(false); // Reset to editable
      }
      setErrorMsg(null);
      setIsFeatureModalOpen(true);
  };

  const handleSaveFeature = () => {
      // Validation: Check for duplicates
      if (features.some(f => f.identifier === featureForm.identifier && f.id !== editingFeatureId)) {
          setErrorMsg(`标识符 "${featureForm.identifier}" 已存在，请使用唯一的标识符。`);
          return;
      }

      const map: Record<string, string> = {
          'integer': 'int (整数)', 'float': 'float (浮点)', 'enum': 'enum (枚举)', 
          'boolean': 'bool (布尔)', 'string': 'string (字符串)', 'datetime': 'datetime (时间)'
      };

      const newFeature: DeviceFeature = { 
          id: editingFeatureId || `feat_${Date.now()}`, 
          name: featureForm.name || '新功能点位', 
          identifier: featureForm.identifier || 'new_feat', 
          dataType: featureForm.dataType, 
          dataTypeLabel: map[featureForm.dataType] || featureForm.dataType, 
          accessMode: featureForm.accessMode, 
          unit: featureForm.unit, 
          specs: featureForm.specs
      };

      if (editingFeatureId) {
          setFeatures(prev => prev.map(f => f.id === editingFeatureId ? newFeature : f));
      } else {
          setFeatures([...features, newFeature]);
      }
      setIsFeatureModalOpen(false);
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setErrorMsg(null);
    
    if (!val) {
        // Reset to "Custom" mode
        setFeatureForm({
            name: '',
            identifier: '',
            dataType: 'integer',
            unit: '',
            accessMode: 'r',
            specs: { min: 0, max: 100, step: 1 }
        });
        setIsReadOnly(false);
        return;
    }

    // Find the template
    const template = FLATTENED_TEMPLATES.find(item => item.identifier === val);

    if (template) {
        setFeatureForm({
            ...featureForm,
            name: template.name || '',
            identifier: template.identifier || '',
            dataType: template.dataType || 'integer',
            unit: template.unit || '',
            accessMode: template.accessMode || 'r',
            specs: template.specs || {}
        });
        setIsReadOnly(true); // Lock the form
    }
  };

  // --- Render Modals ---

  const renderTypeModal = () => {
    if (!isTypeModalOpen) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/50 flex justify-end z-50 backdrop-blur-sm">
        <div className="bg-white w-96 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800">{editingTypeId ? '编辑设备模型类型' : '新增设备模型类型'}</h3>
            <button onClick={() => setIsTypeModalOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">类型名称</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                placeholder="如：环境传感设备" 
                value={typeForm.name}
                onChange={(e) => setTypeForm({...typeForm, name: e.target.value})}
              />
            </div>
            {/* Code Input Removed per requirement */}
          </div>
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 mt-auto">
            <button onClick={() => setIsTypeModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">取消</button>
            <button onClick={handleSaveType} className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm font-medium">
                {editingTypeId ? '保存修改' : '确认新增'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderModelModal = () => {
    if (!isModelModalOpen) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/50 flex justify-end z-50 backdrop-blur-sm">
        <div className="bg-white w-[480px] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800">{editingModelId ? '编辑设备模型' : '新增设备模型'}</h3>
            <button onClick={() => setIsModelModalOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">所属类型</label>
              <select 
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={modelForm.typeId}
                onChange={(e) => setModelForm({...modelForm, typeId: e.target.value})}
              >
                {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">模型名称</label>
                <input 
                    type="text" 
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                    placeholder="如：NB-IoT水表" 
                    value={modelForm.name}
                    onChange={(e) => setModelForm({...modelForm, name: e.target.value})}
                />
            </div>
            {/* Key/Code Input Removed per requirement */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
              <textarea 
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm h-20 resize-none" 
                placeholder="描述该设备模型的主要用途..." 
                value={modelForm.description}
                onChange={(e) => setModelForm({...modelForm, description: e.target.value})}
              />
            </div>
          </div>
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 mt-auto">
            <button onClick={() => setIsModelModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">取消</button>
            <button onClick={handleSaveModel} className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm font-medium">
                {editingModelId ? '保存修改' : '确认创建'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSpecsForm = () => {
    const disabledClass = isReadOnly ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "bg-white";

    switch(featureForm.dataType) {
        case 'integer':
        case 'float':
            return (
                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <input 
                            disabled={isReadOnly}
                            type="number" 
                            placeholder="最小值 (Min)" 
                            className={`w-full px-2 py-1 text-sm border border-slate-300 rounded ${disabledClass}`}
                            value={featureForm.specs.min || ''}
                            onChange={e => setFeatureForm({...featureForm, specs: {...featureForm.specs, min: e.target.value}})}
                        />
                    </div>
                    <div>
                        <input 
                            disabled={isReadOnly}
                            type="number" 
                            placeholder="最大值 (Max)" 
                            className={`w-full px-2 py-1 text-sm border border-slate-300 rounded ${disabledClass}`}
                            value={featureForm.specs.max || ''}
                            onChange={e => setFeatureForm({...featureForm, specs: {...featureForm.specs, max: e.target.value}})}
                        />
                    </div>
                    <div>
                        <input 
                            disabled={isReadOnly}
                            type="number" 
                            placeholder="步长 (Step)" 
                            className={`w-full px-2 py-1 text-sm border border-slate-300 rounded ${disabledClass}`}
                            value={featureForm.specs.step || ''}
                            onChange={e => setFeatureForm({...featureForm, specs: {...featureForm.specs, step: e.target.value}})}
                        />
                    </div>
                </div>
            );
        case 'enum':
            // Simple dynamic list for Enum
            return (
                <div className="space-y-2">
                    <div className="flex gap-2">
                         <input disabled={isReadOnly} id="enum-key" type="text" placeholder="值 (如: 0)" className={`flex-1 px-2 py-1 text-sm border border-slate-300 rounded ${disabledClass}`} />
                         <input disabled={isReadOnly} id="enum-label" type="text" placeholder="描述 (如: 开启)" className={`flex-1 px-2 py-1 text-sm border border-slate-300 rounded ${disabledClass}`} />
                         <button 
                             disabled={isReadOnly}
                             onClick={() => {
                                 const k = (document.getElementById('enum-key') as HTMLInputElement).value;
                                 const v = (document.getElementById('enum-label') as HTMLInputElement).value;
                                 if(k && v) {
                                     setFeatureForm({...featureForm, specs: {...featureForm.specs, [k]: v}});
                                     (document.getElementById('enum-key') as HTMLInputElement).value = '';
                                     (document.getElementById('enum-label') as HTMLInputElement).value = '';
                                 }
                             }}
                             className={`px-3 py-1 border border-slate-200 rounded text-xs ${isReadOnly ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-100 hover:bg-slate-200'}`}
                        >添加</button>
                    </div>
                    <div className="bg-white border border-slate-200 rounded max-h-24 overflow-y-auto p-2 space-y-1">
                        {Object.entries(featureForm.specs).map(([k, v]) => (
                            <div key={k} className="flex justify-between items-center text-xs bg-slate-50 px-2 py-1 rounded">
                                <span><span className="font-mono font-bold">{k}</span> : {String(v)}</span>
                                {!isReadOnly && (
                                    <button 
                                        onClick={() => {
                                            const newSpecs = {...featureForm.specs};
                                            delete newSpecs[k];
                                            setFeatureForm({...featureForm, specs: newSpecs});
                                        }}
                                        className="text-red-400 hover:text-red-600"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {Object.keys(featureForm.specs).length === 0 && <span className="text-slate-400 text-xs italic">暂无枚举项</span>}
                    </div>
                </div>
            );
        case 'boolean':
             return (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                         <label className="text-xs text-slate-500 mb-1 block">True (1) 对应文本</label>
                         <input 
                            disabled={isReadOnly}
                            type="text" 
                            className={`w-full px-2 py-1 text-sm border border-slate-300 rounded ${disabledClass}`}
                            placeholder="如：开启"
                            value={featureForm.specs.trueLabel || ''}
                            onChange={e => setFeatureForm({...featureForm, specs: {...featureForm.specs, trueLabel: e.target.value}})}
                        />
                    </div>
                    <div>
                         <label className="text-xs text-slate-500 mb-1 block">False (0) 对应文本</label>
                         <input 
                            disabled={isReadOnly}
                            type="text" 
                            className={`w-full px-2 py-1 text-sm border border-slate-300 rounded ${disabledClass}`}
                            placeholder="如：关闭"
                            value={featureForm.specs.falseLabel || ''}
                            onChange={e => setFeatureForm({...featureForm, specs: {...featureForm.specs, falseLabel: e.target.value}})}
                        />
                    </div>
                </div>
            );
        case 'string':
            return (
                <div>
                     <label className="text-xs text-slate-500 mb-1 block">最大长度</label>
                     <input 
                        disabled={isReadOnly}
                        type="number" 
                        className={`w-full px-2 py-1 text-sm border border-slate-300 rounded ${disabledClass}`}
                        placeholder="如：256"
                        value={featureForm.specs.maxLength || ''}
                        onChange={e => setFeatureForm({...featureForm, specs: {...featureForm.specs, maxLength: e.target.value}})}
                    />
                </div>
            );
        case 'datetime':
            return (
                 <div>
                     <label className="text-xs text-slate-500 mb-1 block">时间格式</label>
                     <select 
                        disabled={isReadOnly}
                        className={`w-full px-2 py-1 text-sm border border-slate-300 rounded ${disabledClass}`}
                        value={featureForm.specs.format || ''}
                        onChange={e => setFeatureForm({...featureForm, specs: {...featureForm.specs, format: e.target.value}})}
                    >
                         <option value="YYYY-MM-DD HH:mm:ss">YYYY-MM-DD HH:mm:ss (标准)</option>
                         <option value="X">Timestamp (毫秒时间戳)</option>
                         <option value="x">Timestamp (秒时间戳)</option>
                     </select>
                </div>
            );
        default:
            return null;
    }
  };

  const renderFeatureModal = () => {
    if (!isFeatureModalOpen) return null;
    
    // Helper to switch type label for display
    const getTypeLabel = (type: string) => {
        const map: Record<string, string> = {
            'integer': 'int (整数)', 'float': 'float (浮点)', 'enum': 'enum (枚举)', 
            'boolean': 'bool (布尔)', 'string': 'string (字符串)', 'datetime': 'datetime (时间)'
        };
        return map[type] || type;
    };

    const disabledClass = isReadOnly ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "bg-white";

    return (
      <div className="fixed inset-0 bg-slate-900/50 flex justify-end z-50 backdrop-blur-sm">
        <div className="bg-white w-[600px] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800">{editingFeatureId ? '编辑功能点位' : '新增功能点位'}</h3>
            <button onClick={() => setIsFeatureModalOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            
            {/* Template Selection Section */}
            {!editingFeatureId && (
                <>
                <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100 flex items-start gap-3">
                    <BookOpen className="text-indigo-500 mt-1 flex-shrink-0" size={18} />
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-indigo-900 mb-1">
                            引用标准点位模版
                        </label>
                        <p className="text-xs text-indigo-700/70 mb-2">
                            从标准库中选择通用点位，系统将自动填充定义信息且不可修改。
                        </p>
                        <div className="relative">
                            <select 
                                className="w-full pl-3 pr-8 py-2 text-sm border-indigo-200 rounded bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                                onChange={handleTemplateChange}
                                defaultValue=""
                            >
                                <option value="">-- 请选择标准点位 (可选) --</option>
                                {FLATTENED_TEMPLATES.map(item => (
                                    <option key={item.identifier} value={item.identifier}>
                                        {item.name} ({item.identifier})
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-3 text-indigo-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white px-3 text-xs text-slate-400 font-medium">或 自定义配置</span>
                    </div>
                </div>
                </>
            )}

             {/* Error Message */}
             {errorMsg && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={16} />
                    {errorMsg}
                </div>
            )}

            {/* Custom Form */}
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">功能名称</label>
                    <input 
                        disabled={isReadOnly}
                        type="text" 
                        className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm ${disabledClass}`}
                        placeholder="如：当前电压" 
                        value={featureForm.name}
                        onChange={e => setFeatureForm({...featureForm, name: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">标识符</label>
                    <input 
                        disabled={isReadOnly}
                        type="text" 
                        className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm ${disabledClass}`}
                        placeholder="如：voltage" 
                        value={featureForm.identifier}
                        onChange={e => setFeatureForm({...featureForm, identifier: e.target.value})}
                    />
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">数据类型</label>
                    <select 
                        disabled={isReadOnly}
                        className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm ${disabledClass}`}
                        value={featureForm.dataType}
                        onChange={e => {
                            const newType = e.target.value as DeviceFeature['dataType'];
                            // Reset specs based on type
                            let defaultSpecs = {};
                            if (['integer', 'float'].includes(newType)) defaultSpecs = { min: 0, max: 100, step: 1 };
                            if (newType === 'datetime') defaultSpecs = { format: 'YYYY-MM-DD HH:mm:ss' };
                            
                            setFeatureForm({...featureForm, dataType: newType, specs: defaultSpecs});
                        }}
                    >
                        <option value="integer">Integer (整数)</option>
                        <option value="float">Float (浮点数)</option>
                        <option value="enum">Enum (枚举)</option>
                        <option value="boolean">Boolean (布尔)</option>
                        <option value="string">String (字符串)</option>
                        <option value="datetime">Datetime (时间型)</option>
                        {/* Range removed per requirement */}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">单位</label>
                    <input 
                        disabled={isReadOnly}
                        type="text" 
                        className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm ${disabledClass}`} 
                        placeholder="如：V, A, ℃" 
                        value={featureForm.unit}
                        onChange={e => setFeatureForm({...featureForm, unit: e.target.value})}
                    />
                </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                 <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">读写模式 (Access Mode)</label>
                    <div className="flex items-center gap-2">
                        <select
                            disabled={isReadOnly}
                            className={`px-2 py-1 border border-slate-300 rounded text-sm focus:ring-blue-500 outline-none ${disabledClass}`}
                            value={featureForm.accessMode}
                            onChange={e => setFeatureForm({...featureForm, accessMode: e.target.value as any})}
                        >
                            <option value="r">只读 (Read-Only)</option>
                            <option value="rw">读写 (Read-Write)</option>
                            <option value="w">只写 (Write-Only)</option>
                        </select>
                    </div>
                 </div>
                 <div className="border-t border-slate-200 pt-3">
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">数据定义 (Specs)</label>
                     {renderSpecsForm()}
                 </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 mt-auto">
            <button onClick={() => setIsFeatureModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">取消</button>
            <button onClick={handleSaveFeature} className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm font-medium flex items-center gap-1">
                <Save size={14} /> {editingFeatureId ? '保存修改' : '保存点位'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full gap-6 relative">
      {renderTypeModal()}
      {renderModelModal()}
      {renderFeatureModal()}

      {/* Inner Sidebar: Device Model List */}
      <div className="w-64 flex-shrink-0 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col">
        <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm mb-3">设备模型列表</h3>
           <div className="relative">
             <input 
               type="text" 
               placeholder="搜索模型..." 
               className="w-full pl-8 pr-3 py-1.5 bg-white text-sm border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 placeholder-slate-400"
             />
             <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {types.map(type => (
            <div key={type.id}>
                {/* Type Header with Edit/Delete Actions */}
                <div className="px-2 mb-1 flex items-center justify-between group h-6">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{type.name}</span>
                     <div className="hidden group-hover:flex gap-1">
                        <button 
                            onClick={() => openTypeModal(type)}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded"
                            title="编辑类型"
                        >
                            <Edit size={12} />
                        </button>
                        <button 
                            onClick={(e) => handleDeleteType(e, type)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded"
                            title="删除类型"
                        >
                            <Trash2 size={12} />
                        </button>
                     </div>
                </div>
                <div className="space-y-0.5">
                    {models.filter(m => m.typeId === type.id).map(model => (
                         <button
                            key={model.id}
                            onClick={() => setSelectedModelId(model.id)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-between group ${
                                selectedModelId === model.id 
                                ? 'bg-blue-50 text-blue-600' 
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <span className="truncate flex-1">{model.name}</span>
                            
                            {/* Model Actions: Visible on Hover or Selected */}
                            <div className={`flex items-center gap-1 ${selectedModelId === model.id ? 'flex' : 'hidden group-hover:flex'}`}>
                                <div 
                                    onClick={(e) => { e.stopPropagation(); openModelModal(model); }}
                                    className={`p-1 rounded hover:bg-slate-200 ${selectedModelId === model.id ? 'text-blue-400 hover:text-blue-700' : 'text-slate-400 hover:text-blue-600'}`}
                                >
                                    <Edit size={12} />
                                </div>
                                <div 
                                    onClick={(e) => handleDeleteModel(e, model)}
                                    className={`p-1 rounded hover:bg-slate-200 ${selectedModelId === model.id ? 'text-blue-400 hover:text-red-600' : 'text-slate-400 hover:text-red-600'}`}
                                >
                                    <Trash2 size={12} />
                                </div>
                            </div>
                        </button>
                    ))}
                    {models.filter(m => m.typeId === type.id).length === 0 && (
                        <p className="text-xs text-slate-300 px-3 py-1 italic">暂无模型</p>
                    )}
                </div>
            </div>
          ))}
        </div>
        
        <div className="p-3 border-t border-slate-100 grid grid-cols-2 gap-2">
             <button 
                onClick={() => openTypeModal()}
                className="py-2 border border-slate-200 text-slate-600 rounded-md text-xs hover:bg-slate-50 hover:text-slate-800 transition-colors flex items-center justify-center gap-1"
                title="新增设备模型类型"
             >
                <FolderPlus size={14} /> 新增类型
             </button>
             <button 
                onClick={() => openModelModal()}
                className="py-2 bg-slate-800 text-white rounded-md text-xs hover:bg-slate-700 transition-colors flex items-center justify-center gap-1"
                title="新增设备模型"
             >
                <Box size={14} /> 新增模型
             </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Breadcrumb & Header */}
        <div className="mb-6">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <span>设备标准库</span>
                <span>/</span>
                <span className="text-slate-800 font-medium">设备模型管理</span>
            </div>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-800">{selectedModel?.name || '请选择模型'}</h2>
                    {selectedModel && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded border border-slate-200 font-mono">
                            {selectedModel.code}
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    <button className="p-2 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50" title="模型设置">
                        <Settings size={18} />
                    </button>
                </div>
            </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-4">
            <div className="flex flex-wrap items-end gap-4">
                <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                    <label className="text-xs font-medium text-slate-500">功能名称</label>
                    <input 
                        type="text" 
                        placeholder="请输入" 
                        value={filter.functionName}
                        onChange={(e) => handleFilterChange('functionName', e.target.value)}
                        className="w-full px-3 py-2 bg-white text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                    <label className="text-xs font-medium text-slate-500">标识符</label>
                    <input 
                        type="text" 
                        placeholder="请输入"
                        value={filter.identifier}
                        onChange={(e) => handleFilterChange('identifier', e.target.value)}
                        className="w-full px-3 py-2 bg-white text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <div className="flex gap-2 pb-0.5">
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
                        查询
                    </button>
                    <button 
                        onClick={handleReset}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors"
                    >
                        重置
                    </button>
                </div>
            </div>
        </div>

        {/* Table Container */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex-1 flex flex-col">
            
            {/* Table Toolbar */}
            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                <div className="text-sm text-slate-600">
                    <span className="font-medium text-slate-800">
                        {selectedModel?.name}
                    </span> 功能定义列表 (物模型)
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => openFeatureModal()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 shadow-sm"
                    >
                        <Plus size={14} /> 新增点位信息
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">功能名称</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">标识符</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">数据类型</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">读写模式</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">单位</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {features.map((feature) => (
                            <tr key={feature.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-slate-800 font-medium">{feature.name}</td>
                                <td className="px-6 py-4 text-sm text-slate-600 font-mono text-xs">{feature.identifier}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{feature.dataTypeLabel}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                        feature.accessMode === 'rw' 
                                        ? 'bg-purple-100 text-purple-700' 
                                        : (feature.accessMode === 'w' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600')
                                    }`}>
                                        {feature.accessMode === 'rw' ? '读写' : (feature.accessMode === 'w' ? '只写' : '只读')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">{feature.unit}</td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => openFeatureModal(feature)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3"
                                    >
                                        编辑
                                    </button>
                                    <button className="text-red-500 hover:text-red-700 text-sm font-medium">删除</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-4 bg-white rounded-b-lg">
                <span className="text-sm text-slate-500">共 {features.length} 条</span>
                <div className="flex items-center gap-1">
                    <button className="p-1 rounded border border-slate-200 text-slate-400 disabled:opacity-50" disabled>
                        <ChevronLeft size={16} />
                    </button>
                    <button className="px-3 py-1 rounded border border-blue-500 bg-blue-50 text-blue-600 text-sm font-medium">1</button>
                    <button className="p-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};