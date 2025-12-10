
import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Database, 
  Settings, 
  Users, 
  Shield, 
  BarChart3, 
  Layers,
  ChevronDown,
  ChevronRight,
  Server,
  FileText,
  Home,
  Box,
  Cpu,
  Bell,
  Workflow,
  Repeat,
  UserSquare2
} from 'lucide-react';
import { MenuId, SubMenuId, UserRole, ProjectMenuId, ProjectSubMenuId } from '../types';

interface SidebarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeMenu: string;
  activeSubMenu: string;
  onNavigate: (menu: string, subMenu?: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentRole,
  onRoleChange,
  activeMenu, 
  activeSubMenu, 
  onNavigate 
}) => {
  
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    'device-std': true,
    'policy-center': true,
    'project-policy': true,
    'project-device': true,
    'project-employee': true
  });

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => ({...prev, [menuId]: !prev[menuId]}));
  };

  // Super Admin Menu Structure
  const superAdminMenu = [
    { 
      id: 'tenant' as MenuId, 
      label: '租户管理', 
      icon: Users,
      children: [] 
    },
    { 
      id: 'device-std' as MenuId, 
      label: '设备标准库', 
      icon: Database,
      children: [
        { id: 'device-model' as SubMenuId, label: '设备模型管理' },
        { id: 'vendor-config' as SubMenuId, label: '厂商配置管理' },
        { id: 'field-mapping' as SubMenuId, label: '厂商字段配置' }
      ]
    },
    {
      id: 'policy-center' as MenuId,
      label: '策略模板中心',
      icon: FileText,
      children: [
        { id: 'billing-template' as SubMenuId, label: '计费策略模板' },
        { id: 'control-template' as SubMenuId, label: '智能控制模板' },
        { id: 'alarm-template' as SubMenuId, label: '报警策略模板' }
      ]
    },
    { 
      id: 'org' as MenuId, 
      label: '组织管理', 
      icon: Layers,
      children: [] 
    },
    { 
      id: 'org-settings' as MenuId, 
      label: '组织设置', 
      icon: Settings,
      children: [] 
    },
    { 
      id: 'security' as MenuId, 
      label: '安全', 
      icon: Shield,
      children: [] 
    },
    { 
      id: 'asset' as MenuId, 
      label: '资产与使用统计', 
      icon: BarChart3,
      children: [] 
    },
    { 
      id: 'system' as MenuId, 
      label: '系统管理', 
      icon: Server,
      children: [] 
    }
  ];

  // Project Admin Menu Structure
  const projectAdminMenu = [
    {
        id: 'project-dashboard' as ProjectMenuId,
        label: '项目概览',
        icon: Home,
        children: []
    },
    {
        id: 'space-asset' as ProjectMenuId,
        label: '空间资产',
        icon: Box,
        children: []
    },
    {
        id: 'project-employee' as ProjectMenuId,
        label: '员工管理',
        icon: UserSquare2,
        children: [
            { id: 'employee-list' as ProjectSubMenuId, label: '员工列表' }
        ]
    },
    {
        id: 'project-device' as ProjectMenuId,
        label: '设备管理',
        icon: Cpu,
        children: [
            { id: 'device-list' as ProjectSubMenuId, label: '设备列表' },
            { id: 'water-recharge' as ProjectSubMenuId, label: '水量充值记录' },
            { id: 'water-usage' as ProjectSubMenuId, label: '水量使用记录' }
        ]
    },
    {
        id: 'project-policy' as ProjectMenuId,
        label: '策略中心',
        icon: Workflow,
        children: [
            { id: 'policy-billing' as ProjectSubMenuId, label: '计费策略' },
            { id: 'policy-control' as ProjectSubMenuId, label: '智能控制策略' },
            { id: 'policy-alarm' as ProjectSubMenuId, label: '报警策略' }
        ]
    },
    {
        id: 'project-event' as ProjectMenuId,
        label: '事件中心',
        icon: Bell,
        children: []
    },
    {
        id: 'project-settings' as ProjectMenuId,
        label: '项目设置',
        icon: Settings,
        children: []
    }
  ];

  const currentMenuStructure = currentRole === 'super_admin' ? superAdminMenu : projectAdminMenu;
  const appTitle = currentRole === 'super_admin' ? 'Super Admin' : 'Project Admin';
  const appSubtitle = currentRole === 'super_admin' ? 'SaaS 运营端' : '昆山仁宝宿舍项目';
  const roleLabel = currentRole === 'super_admin' ? '超级管理员' : '项目管理员';

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex flex-col z-20">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentRole === 'super_admin' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
          <LayoutGrid className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-slate-800 tracking-tight text-sm">{appTitle}</h1>
          <h1 className="text-xs text-slate-500 font-medium truncate w-32">{appSubtitle}</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {currentMenuStructure.map((menu) => {
          const hasChildren = menu.children.length > 0;
          const isExpanded = expandedMenus[menu.id];
          const isActiveMain = activeMenu === menu.id;

          return (
            <div key={menu.id}>
              <button
                onClick={() => {
                  if (hasChildren) {
                    toggleMenu(menu.id);
                  } else {
                    onNavigate(menu.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActiveMain && !hasChildren
                    ? (currentRole === 'super_admin' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600')
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <menu.icon size={18} strokeWidth={1.5} />
                  <span>{menu.label}</span>
                </div>
                {hasChildren && (
                  isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                )}
              </button>

              {/* Submenu */}
              {hasChildren && isExpanded && (
                <div className="mt-1 space-y-0.5 relative">
                  {/* Indentation Line */}
                  <div className="absolute left-7 top-0 bottom-0 w-px bg-slate-100" />
                  
                  {menu.children.map(sub => {
                    const isSubActive = activeSubMenu === sub.id && isActiveMain;
                    const activeClass = currentRole === 'super_admin' 
                        ? 'text-blue-600 bg-blue-50 font-medium' 
                        : 'text-emerald-600 bg-emerald-50 font-medium';
                    const activeDotClass = currentRole === 'super_admin' ? 'bg-blue-600' : 'bg-emerald-600';

                    return (
                      <button
                        key={sub.id}
                        onClick={() => onNavigate(menu.id, sub.id)}
                        className={`w-full flex items-center gap-2 pl-12 pr-3 py-2 rounded-lg text-sm transition-colors relative ${
                          isSubActive 
                            ? activeClass
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                         {/* Active Indicator Dot */}
                        {isSubActive && (
                            <div className={`absolute left-7 w-1.5 h-1.5 rounded-full -ml-[3px] ${activeDotClass}`} />
                        )}
                        {sub.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

       {/* Footer / User Profile / Role Switcher */}
       <div className="p-4 border-t border-slate-100">
         <div className="flex items-center gap-3 w-full p-2 rounded-lg bg-slate-50 border border-slate-200 mb-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${currentRole === 'super_admin' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
              {currentRole === 'super_admin' ? 'SA' : 'PA'}
            </div>
            <div className="text-left flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">Admin User</p>
                <p className="text-xs text-slate-500 truncate">{roleLabel}</p>
            </div>
         </div>
         
         <button 
            onClick={() => onRoleChange(currentRole === 'super_admin' ? 'project_admin' : 'super_admin')}
            className="w-full flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-slate-800 py-2 border-t border-slate-200 hover:bg-slate-50 transition-colors"
         >
             <Repeat size={12} />
             切换演示视角
         </button>
       </div>
    </div>
  );
};
