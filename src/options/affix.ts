import { DixtPluginAffixOptions } from "dixt-plugin-affix";
import ROLES from "../constants/roles";

const dixtPluginAffixOptions: DixtPluginAffixOptions = {
  prefix: {
    [ROLES.DIRECTEUR]: "DIR",
    [ROLES.CO_DIRECTEUR]: "Co-DIR",
    [ROLES.CADRE_SANTE]: "Cadre-Santé",
    [ROLES.CHEF_DE_SERVICE]: "Chef-Service",
    [ROLES.MEDECIN_CHEF]: "Med-Chef",
    [ROLES.MEDECIN]: "Med",
    [ROLES.ASSITANT_MEDECIN]: "Assist-Med",
    [ROLES.INTERNE]: "Int",
    [ROLES.INFIRMIER]: "Inf",
    [ROLES.PRATICIEN]: "Prat",
    [ROLES.AMBULANCIER]: "Amb",
    [ROLES.STAGIAIRE]: "STG",
    [ROLES.INTERIMAIRE]: "Inter",
    [ROLES.AMIS_DIRECTION]: "Amis",
    [ROLES.AMIS]: "Amis",
    [ROLES.EMS_PH]: "EMS-PILLBOX",
    [ROLES.EMS_OCEAN]: "EMS-OCEAN",
    [ROLES.LICENCIE]: "Licencié",
    [ROLES.DEMISSION]: "Dem",
    [ROLES.BAR_MORTORCYCLES]: "Bar",
    [ROLES.CUSTOM_MOTORCYCLES]: "Custom",
    [ROLES.HYDROCARBURE]: "Hydrocarbure",
  },
};

export default dixtPluginAffixOptions;
