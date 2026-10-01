import type { JobOpeningRepository } from "@/src/application/jobs/ports/job-opening.repository";
import type { JobOpening } from "@/src/domain/jobs/job-opening.entity";

const openings: JobOpening[] = [
  {
    id: "web-intern",
    title: "Practicante de desarrollo web",
    area: "Software",
    status: "Convocatoria base",
    description: "Apoyo en interfaces, formularios, documentacion y mantenimiento de proyectos internos."
  },
  {
    id: "automation-support",
    title: "Apoyo en automatizacion",
    area: "Ingenieria",
    status: "Por definir",
    description: "Participacion en levantamiento de procesos, pruebas y documentacion tecnica."
  },
  {
    id: "graphic-designer",
    title: "Disenador grafico colaborador",
    area: "Marca",
    status: "Por definir",
    description: "Soporte visual para identidad, piezas digitales, iconografia y presentacion comercial."
  }
];

export const staticJobOpeningRepository: JobOpeningRepository = {
  async list() {
    return openings;
  }
};
