import React from 'react';
import { ModuleType, MODULE_NAMES } from '@/constants/modules';
import { PreDepartureModule } from '../pre-departure/PreDepartureModule';
import { VehicleArrivalModule } from '../vehicle-arrival/VehicleArrivalModule';
import { DeploymentAlignmentModule } from '../deployment-alignment/DeploymentAlignmentModule';
import { DataManagementModule } from '../data-management/DataManagementModule';
import { DeploymentManagementModule } from '../deployment-management/DeploymentManagementModule';
import { TestManagementModule } from '../test-management/TestManagementModule';
import { TrainingManagementModule } from '../training-management/TrainingManagementModule';
import { DocumentManagementModule } from '../document-management/DocumentManagementModule';
import { ProjectClosureModule } from '../project-closure/ProjectClosureModule';
import {
  AlignCenter,
  Database,
  Rocket,
  TestTube,
  GraduationCap,
  FileText,
  CheckCircle,
} from 'lucide-react';

interface ModuleContentProps {
  moduleType: ModuleType;
  projectId: string;
}

const DefaultModule: React.FC<{ title: string; icon: any }> = ({ title, icon: Icon }) => {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <Icon size={64} className="mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
        <p className="text-gray-500">该模块功能开发中...</p>
      </div>
    </div>
  );
};

export const ModuleContent: React.FC<ModuleContentProps> = ({ moduleType, projectId }) => {
  switch (moduleType) {
    case 'pre-departure':
      return <PreDepartureModule projectId={projectId} />;
    case 'vehicle-arrival':
      return <VehicleArrivalModule projectId={projectId} />;
    case 'deployment-alignment':
      return <DeploymentAlignmentModule projectId={projectId} />;
    case 'data-management':
      return <DataManagementModule projectId={projectId} />;
    case 'deployment-management':
      return <DeploymentManagementModule projectId={projectId} />;
    case 'test-management':
      return <TestManagementModule projectId={projectId} />;
    case 'training-management':
      return <TrainingManagementModule projectId={projectId} />;
    case 'document-management':
      return <DocumentManagementModule projectId={projectId} />;
    case 'project-closure':
      return <ProjectClosureModule projectId={projectId} />;
    default:
      return (
        <div className="p-6">
          <div className="bg-white rounded-lg p-12 text-center text-gray-500">
            <p>该模块正在开发中...</p>
          </div>
        </div>
      );
  }
};
