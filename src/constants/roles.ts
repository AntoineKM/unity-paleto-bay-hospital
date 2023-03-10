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
  INTERIMAIRE: "1026803029111996477",
  AMIS_DIRECTION: "987503510545375252",
  AMIS: "907322426327707748",
  EMS_PH: "883356473713885206",
  EMS_OCEAN: "987475349455667210",
  EMERGENCY: "883356473902645295",
  CANDIDATURE_ACCEPTEE: "885267674437918770",
  LICENCIE: "893989009951428650",
  DEMISSION: "902791932433031168",
  BAR_MORTORCYCLES: "1051148606209536010",
  CUSTOM_MOTORCYCLES: "1068318648177016912",
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
  INTERIMAIRE: "Inter",
  AMIS_DIRECTION: "Amis",
  AMIS: "Amis",
  EMS_PH: "EMS-PILLBOX",
  EMS_OCEAN: "EMS-OCEAN",
  LICENCIE: "Licencié",
  DEMISSION: "Dem",
  BAR_MORTORCYCLES: "Bar",
  CUSTOM_MOTORCYCLES: "Custom",
};

export default ROLES;
