const ROLES = {
  DIRECTEUR: "883356473952993341",
  CO_DIRECTEUR: "883356473923629104",
  DIRECTION: "883356473952993342",
  CADRE_SANTE: "883356473923629102",
  CHEF_DE_SERVICE: "897087195855339571",
  MEDECIN_CHEF: "883356473923629101",
  MEDECIN: "883356473923629100",
  INTERNE: "897085885563150336",
  INFIRMIER: "885902919323504750",
  AMBULANCIER: "898479598839406612",
  STAGIAIRE: "883356473923629099",
  EMERGENCY: "883356473902645295",
  CANDIDATURE_ACCEPTEE: "885267674437918770",
};

export const ROLES_PREFIX: { [key in keyof typeof ROLES]?: string } = {
  DIRECTEUR: "DIR",
  CO_DIRECTEUR: "Co-DIR",
  CADRE_SANTE: "Cadre-Santé",
  CHEF_DE_SERVICE: "Chef-Service",
  MEDECIN_CHEF: "Med-Chef",
  MEDECIN: "Med",
  INTERNE: "Int",
  INFIRMIER: "Inf",
  AMBULANCIER: "Amb",
  STAGIAIRE: "STG",
};

export default ROLES;
