


// User Roles for the Demo
export type UserRole = 'super_admin' | 'project_admin';

// Super Admin Navigation Types
export type MenuId = 'tenant' | 'device-std' | 'policy-center' | 'org' | 'settings' | 'security' | 'asset' | 'system';
export type SubMenuId = 'device-model' | 'vendor-config' | 'field-mapping' | 'billing-template' | 'control-template' | 'alarm-template';

// Project Admin Navigation Types
export type ProjectMenuId = 'project-dashboard' | 'space-asset' | 'project-device' | 'project-policy' | 'project-event' | 'project-settings' | 'project-employee';
export type ProjectSubMenuId = 'policy-billing' | 'policy-control' | 'policy-alarm' | 'device-list' | 'water-recharge' | 'water-usage' | 'employee-list';

// Device Standard Library Types

// Level 1: Device Type (Category) - e.g., "Sensing", "Metering"
export interface DeviceType {
  id: string;
  name: string;
  code: string;
}

// Level 2: Device Model (Product) - e.g., "Smart Water Meter", "Face Access"
export interface DeviceModel {
  id: string;
  typeId: string; // Link to DeviceType
  name: string;
  code: string;
  description?: string;
  icon?: string;
}

// Level 3: The specific feature/property of a device model (The "Thing Model" row)
export interface DeviceFeature {
  id: string;
  name: string; // e.g., "开门状态"
  identifier: string; // e.g., "open_status"
  dataType: 'enum' | 'datetime' | 'boolean' | 'string' | 'integer' | 'float'; // Removed 'range'
  dataTypeLabel: string; // e.g., "enum (枚举)"
  accessMode: 'r' | 'rw' | 'w'; // Replaced isControllable boolean with specific modes
  unit: string;
  description?: string;
  specs?: any; // Dynamic specifications based on dataType (e.g., min/max, enum values)
}

// Filter State for the search bar
export interface DeviceModelFilter {
  functionName: string;
  identifier: string;
}

// Simulation State for the IoT Emulator
export interface SimulationState {
  roomOccupancy: number;
  roomTemperature: number;
  powerState: boolean;
  acState: boolean;
  accumulatedWater: number;
}

// Billing Account Information
export interface BillingAccount {
  role: string;
  balance: number;
  dailyWaterUsage: number;
}

// Alarm/Alert Definition
export interface Alarm {
  id: string;
  severity: string;
  title: string;
  description: string;
  target: string;
  timestamp: Date;
}