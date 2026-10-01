import type { HrAccessRepository } from "@/src/application/hr/ports/hr-access.repository";
import type { HrFeature } from "@/src/domain/hr/hr-feature.entity";

const features: HrFeature[] = [
  { id: "authorized-access", label: "Acceso solo para personal autorizado" },
  { id: "employee-files", label: "Expedientes de colaboradores" },
  { id: "skills-matrix", label: "Matriz de aptitudes y capacidades" },
  { id: "internal-documents", label: "Historial y documentos internos" }
];

export const staticHrAccessRepository: HrAccessRepository = {
  async listFeatures() {
    return features;
  }
};
