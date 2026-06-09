import React from 'react';
import { MODULE_NAMES, MODULE_ICONS, ModuleType } from '@/constants/modules';
import { cn } from '@/utils/helpers';
import { 
  Truck, 
  Car, 
  AlignCenter, 
  Database, 
  Rocket, 
  TestTube, 
  GraduationCap, 
  FileText, 
  CheckCircle,
  FolderOpen 
} from 'lucide-react';

interface ModuleNavigationProps {
  currentProject: {
    name: string;
    description: string;
  };
  activeModule: ModuleType;
  onModuleChange: (module: ModuleType) => void;
}

const modules: ModuleType[] = [
  'pre-departure',
  'vehicle-arrival',
  'deployment-alignment',
  'data-management',
  'deployment-management',
  'test-management',
  'training-management',
  'document-management',
  'project-closure',
];

const getIconComponent = (iconName: string) => {
  const icons: Record<string, React.FC<any>> = {
    Truck,
    Car,
    AlignCenter,
    Database,
    Rocket,
    TestTube,
    GraduationCap,
    FileText,
    CheckCircle,
  };
  return icons[iconName] || FolderOpen;
};

export const ModuleNavigation: React.FC<ModuleNavigationProps> = ({
  currentProject,
  activeModule,
  onModuleChange
}) => {
  return (
    <div className="w-64 bg-white border-r overflow-y-auto">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-gray-900">{currentProject.name}</h2>
        <p className="text-sm text-gray-600 mt-1">{currentProject.description}</p>
      </div>
      
      <div className="p-2">
        {modules.map((module) => {
          const IconComponent = getIconComponent(MODULE_ICONS[module]);
          return (
            <button
              key={module}
              onClick={() => onModuleChange(module)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-1',
                activeModule === module
                  ? 'bg-blue-50 text-blue-700'
                  : 'hover:bg-gray-100 text-gray-700'
              )}
            >
              <IconComponent size={18} />
              <span>{MODULE_NAMES[module]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
