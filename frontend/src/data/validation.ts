export interface FunctionFormFields {
  name: string;
  marker: string;
  centralization: string;
  competenceCenter: string;
  strategyProjects: string[];
  curatorCA: string;
  nuZnu: string;
  managerMiudol: string;
  niZni: string;
}

export const EMPTY_FUNCTION_FORM: FunctionFormFields = {
  name: "",
  marker: "",
  centralization: "",
  competenceCenter: "",
  strategyProjects: [],
  curatorCA: "",
  nuZnu: "",
  managerMiudol: "",
  niZni: "",
};

export function isFunctionFormValid(form: FunctionFormFields): boolean {
  return Object.entries(form).every(([key, value]) => {
    if (key === "strategyProjects") return true;

    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && String(value).trim().length > 0;
  });
}
