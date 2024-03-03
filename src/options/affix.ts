import { DixtPluginAffixOptions } from "dixt-plugin-affix";

import ROLES from "../constants/roles";

const dixtPluginAffixOptions: DixtPluginAffixOptions = {
  prefix: {
    [ROLES.DIRECTEUR]: "DIR",
    [ROLES.CO_DIRECTEUR]: "Co-DIR",
    [ROLES.CADRE_SANTE]: "Cadre-Santé",
    [ROLES.CHEF_DE_SERVICE]: "Chef-Service",
    [ROLES.MEDECIN_CHEF]: "Med-Chef",
    [ROLES.RESIDENT]: "Résident",
    [ROLES.MEDECIN]: "Médecin",
    [ROLES.ASSITANT_MEDECIN]: "Assistant-Médecin",
    [ROLES.CLINICIEN]: "Clinicien",
    [ROLES.INTERNE]: "Interne",
    [ROLES.EXTERNE]: "Externe",
    [ROLES.INFIRMIER]: "Infirmier",
    [ROLES.PRATICIEN]: "Praticien",
    [ROLES.AMBULANCIER]: "Ambulancier",
    [ROLES.SECOURISTE]: "Secouriste",
    [ROLES.STAGIAIRE]: "Stagiaire",
    [ROLES.INTERIMAIRE]: "Intérimaire",
    [ROLES.AMIS_DIRECTION]: "Amis",
    [ROLES.AMIS]: "Amis",
    [ROLES.EMS_PH]: "EMS-PILLBOX",
    [ROLES.EMS_OCEAN]: "EMS-OCEAN",
    [ROLES.LICENCIE]: "Licencié",
    [ROLES.DEMISSION]: "Dem",
    [ROLES.HYDROCARBURE]: "Hydrocarbure",
  },
};

export default dixtPluginAffixOptions;
