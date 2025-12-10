


import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { DeviceModelView } from './views/DeviceModelView';
import { PolicyTemplateView } from './views/PolicyTemplateView';
import { ProjectPolicyView } from './views/ProjectPolicyView';
import { ProjectDeviceView } from './views/ProjectDeviceView';
import { ProjectEmployeeView } from './views/ProjectEmployeeView';
import { MenuId, SubMenuId, UserRole, ProjectMenuId, ProjectSubMenuId } from './types';
import { Settings, Bell, LayoutGrid, Building2, ArrowRight, Shield, CheckCircle2 } from 'lucide-react';

// --- Role Selection Screen Component ---
interface RoleSelectionScreenProps {
  onSelect: (role: UserRole) => void;
}

const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">EcoDorm 物联网 SaaS 平台</h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          标准化的宿舍管理底座。请选择您的登录视角以进入相应的管理控制台。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Super Admin Card */}
        <div 
          onClick={() => onSelect('super_admin')}
          className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl border border-slate-200 p-8 cursor-pointer transition-all hover:-translate-y-1 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          <div className="flex items-start justify-between mb-6">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Shield size={32} />
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600">
              <ArrowRight size={24} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">超级管理员</h2>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-6">SaaS 运营端</p>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-3 text-slate-600">
              <CheckCircle2 size={18} className="text-blue-500" /> 租户与组织管理
            </li>
            <li className="flex items-center gap-3 text-slate-600">
              <CheckCircle2 size={18} className="text-blue-500" /> 设备标准库 (物模型)
            </li>
            <li className="flex items-center gap-3 text-slate-600">
              <CheckCircle2 size={18} className="text-blue-500" /> 策略模板中心 (计费/控制/报警)
            </li>
          </ul>
          <span className="inline-block w-full text-center py-3 rounded-lg border border-slate-200 text-slate-600 font-medium group-hover:border-blue-600 group-hover:text-blue-600 transition-colors">
            进入控制台
          </span>
        </div>

        {/* Project Admin Card */}
        <div 
          onClick={() => onSelect('project_admin')}
          className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl border border-slate-200 p-8 cursor-pointer transition-all hover:-translate-y-1 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-600"></div>
          <div className="flex items-start justify-between mb-6">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Building2 size={32} />
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600">
              <ArrowRight size={24} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">项目管理员</h2>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-6">昆山仁宝宿舍项目</p>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-3 text-slate-600">
              <CheckCircle2 size={18} className="text-emerald-500" /> 项目概览与监控
            </li>
            <li className="flex items-center gap-3 text-slate-600">
              <CheckCircle2 size={18} className="text-emerald-500" /> 设备与空间资产
            </li>
            <li className="flex items-center gap-3 text-slate-600">
              <CheckCircle2 size={18} className="text-emerald-500" /> 项目策略配置 (支持模板导入)
            </li>
          </ul>
          <span className="inline-block w-full text-center py-3 rounded-lg border border-slate-200 text-slate-600 font-medium group-hover:border-emerald-600 group-hover:text-emerald-600 transition-colors">
            进入项目
          </span>
        </div>
      </div>
      
      <div className="mt-12 text-slate-400 text-sm">
        © 2023 EcoDorm Technology. All rights reserved.
      </div>
    </div>
  );
};


const App: React.FC = () => {
  // Role State - Initialize as null to show selection screen
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);

  // Navigation State
  const [activeMenu, setActiveMenu] = useState<string>('');
  const [activeSubMenu, setActiveSubMenu] = useState<string>('');

  const handleRoleChange = (newRole: UserRole) => {
      setCurrentRole(newRole);
      // Reset navigation based on new role defaults
      if (newRole === 'super_admin') {
          setActiveMenu('device-std');
          setActiveSubMenu('device-model');
      } else {
          setActiveMenu('project-employee'); // Default to Employee List for demo purposes if desired, or keep as device
          setActiveSubMenu('employee-list'); 
      }
  };

  const handleNavigate = (menu: string, subMenu?: string) => {
    setActiveMenu(menu);
    if (subMenu) {
      setActiveSubMenu(subMenu);
    }
  };

  const renderContent = () => {
    // --- Super Admin Routes ---
    if (currentRole === 'super_admin') {
        if (activeMenu === 'device-std') {
            if (activeSubMenu === 'device-model') {
                return <DeviceModelView />;
            }
            if (activeSubMenu === 'vendor-config' || activeSubMenu === 'field-mapping') {
                 return <PlaceholderView title="厂商配置管理模块" />;
            }
        }

        if (activeMenu === 'policy-center') {
            return <PolicyTemplateView subType={activeSubMenu as SubMenuId} />;
        }
    }

    // --- Project Admin Routes ---
    if (currentRole === 'project_admin') {
        if (activeMenu === 'project-policy') {
            return <ProjectPolicyView subType={activeSubMenu as ProjectSubMenuId} />;
        }
        if (activeMenu === 'project-device') {
            return <ProjectDeviceView subType={activeSubMenu as ProjectSubMenuId} />;
        }
        if (activeMenu === 'project-employee') {
            return <ProjectEmployeeView subType={activeSubMenu as ProjectSubMenuId} />;
        }
        
        // Project Placeholders
        const projectTitles: Record<string, string> = {
            'project-dashboard': '项目概览 Dashboard',
            'space-asset': '空间资产管理',
            'project-event': '项目事件中心',
            'project-settings': '项目参数设置'
        };
        return <PlaceholderView title={projectTitles[activeMenu] || 'Project Module'} />;
    }
    
    // Default Fallbacks
    const titles: Record<string, string> = {
        'tenant': '租户管理',
        'org': '组织管理',
        'security': '安全中心',
        'asset': '资产与使用统计',
        'system': '系统管理',
    };
    return <PlaceholderView title={titles[activeMenu] || 'Dashboard'} />;
  };

  // 1. Show Role Selection Screen if no role selected
  if (!currentRole) {
      return <RoleSelectionScreen onSelect={handleRoleChange} />;
  }

  // 2. Show Main App Layout
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar 
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        activeMenu={activeMenu} 
        activeSubMenu={activeSubMenu} 
        onNavigate={handleNavigate} 
      />
      
      {/* Main Content Wrapper */}
      <main className="ml-64 flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header (Global) */}
        <header className="h-16 bg-white border-b border-slate-200 flex justify-end items-center px-8 gap-4 shadow-sm z-10">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 pr-2 pl-1 py-1 rounded-lg">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${currentRole === 'super_admin' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                    {currentRole === 'super_admin' ? 'SA' : 'PA'}
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-sm font-medium text-slate-700">Admin</span>
                    <span className="text-[10px] text-slate-400 uppercase">{currentRole === 'super_admin' ? 'Super Admin' : 'Project Admin'}</span>
                </div>
            </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-auto p-6 relative">
             {renderContent()}
        </div>
      </main>
    </div>
  );
};

// Simple Placeholder for non-implemented routes
const PlaceholderView: React.FC<{title: string}> = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
        <div className="p-4 bg-slate-100 rounded-full mb-4">
            <Settings size={32} className="text-slate-300" />
        </div>
        <h2 className="text-xl font-semibold text-slate-500">{title}</h2>
        <p className="text-sm mt-2 text-slate-400">该模块正在建设中...</p>
    </div>
);

export default App;
