import CHANNELS from "./channels";
import ROLES from "./roles";
import { TicketType } from "../types/ticket";

export const TicketTypeData: Record<
  TicketType,
  {
    emoji: string;
    name: string;
    description: string;
    instructions: string;
    parent?: string;
    manager?: string;
  }
> = {
  [TicketType.Complaint]: {
    emoji: "📢",
    name: "Plainte",
    description: "Plainte envers un de nos personnels soignant.",
    instructions: `Merci de nous fournir les informations suivantes:
- Votre nom et prénom (IG)
- Nom ou prénom du personnel soignant concerné
- Nature de la plainte
- Éléments de preuve éventuels (screenshots, vidéos, etc.)
- Autres informations pertinentes

Nous nous engageons à enquêter sur votre plainte dans les plus brefs délais et à prendre les mesures appropriées si nécessaire.`,
  },
  [TicketType.Partnership]: {
    emoji: "🤝",
    name: "Partenariat",
    description: "Demande de partenariat avec notre hôpital.",
    instructions: `Merci de nous fournir les informations suivantes:
- Nom de votre entreprise/organisation
- Type de partenariat souhaité (événementiel, financier, etc.)
- Description du partenariat
- Autres informations pertinentes

Nous étudierons votre demande et reviendrons vers vous dans les plus brefs délais.`,
  },
  [TicketType.Support]: {
    emoji: "📞",
    name: "Support",
    description: "Questions simples ou besoin d'aide.",
    instructions:
      "Comment pouvons-nous vous aider ? N'hésitez pas à nous fournir toutes les informations nécessaires pour que nous puissions vous aider au mieux.",
  },
  [TicketType.PPA]: {
    emoji: "🔫",
    name: "PPA",
    description: `Examen psychologique réservé aux forces de l'ordre afin de pouvoir porter une arme. Assurez d'avoir fait votre demande de rôle dans le salon <#${CHANNELS.INFORMATIONS.DEMANDES_ROLES}>.`,
    instructions: `》Si vous avez décidé de prendre rendez-vous avec un de nos spécialistes pour le test de psychologie c’est que vous êtes membre des forces de l'ordre, ce test nous servira à voir si vous êtes apte ou non à disposer d’un port d'arme. 

*__》Afin de créer votre dossier, merci de suivre les étapes suivantes: __*

**__Dans un premier temps:__** 
- Veuillez vous renommer [Matricule] Nom Prénom 
- Veuillez faire une demande de rôle dans le salon correspondant:
<#${CHANNELS.INFORMATIONS.DEMANDES_ROLES}>

*__Ensuite, nous renseigner: __*
- Votre brigade 
- Votre matricule
- Votre nom et prénom
- Votre numéro de téléphone

》Et enfin, veuillez indiquer vos disponibilités afin que nous puissions convenir d’un rendez-vous ? 

_Exemple:
Lundi: ?h - ?h 
Mardi: ?h - ?h 
Mercredi: ?h - ?h
Jeudi: ?h - ?h 
Vendredi: ?h - ?h 
Samedi: ?h - ?h 
Dimanche: ?h - ?h_`,
    parent: CHANNELS.TICKETS_PSYCOLOGIE._ID,
    manager: ROLES.PSYCHOLOGUE,
  },
  [TicketType.Psychology]: {
    emoji: "🧠",
    name: "Psychologie",
    description:
      "Examen psychologique pour les personnes principalement en détresse ou en souffrance psychologique.",
    instructions: `》Nous avons bien pris note de votre demande de rendez-vous. Un médecin ne manquera pas de vous contacter dans les plus brefs délais.

*__En attendant merci de nous indiquer: __*
- Votre nom et prénom (IG)
- Objet du rendez-vous
- Vos disponibilités`,
    parent: CHANNELS.TICKETS_PSYCOLOGIE._ID,
    manager: ROLES.PSYCHOLOGUE,
  },
  [TicketType.Toxicology]: {
    emoji: "💉",
    name: "Toxicologie",
    description:
      "Examen toxicologique pour les personnes qui rencontrent des problèmes de toxicomanie.",
    instructions: `》Nous avons bien pris note de votre demande de rendez-vous. Un médecin ne manquera pas de vous contacter dans les plus brefs délais.

*__En attendant merci de nous indiquer: __*
- Votre nom et prénom (IG)
- Objet du rendez-vous
- Vos disponibilités`,
    parent: CHANNELS.TICKETS_TOXICOLOGIE._ID,
    manager: ROLES.TOXICOLOGUE,
  },
  [TicketType.Surgery]: {
    emoji: "🦾",
    name: "Chirurgie",
    description:
      "Examen chirurgical pour les personnes qui rencontrent des problèmes de santé ou souhaitent subir une modification corporelle.",
    instructions: `》Nous avons bien pris note de votre demande de rendez-vous.  Un médecin ne manquera pas de vous contacter dans les plus brefs délais.

*__En attendant merci de nous indiquer: __*
- Votre nom et prénom (IG)
- Objet du rendez-vous
- Vos disponibilités`,
    parent: CHANNELS.TICKETS_CHIRURGIE._ID,
    manager: ROLES.CHIRURGIEN,
  },
  [TicketType.Gynecology]: {
    emoji: "🔍",
    name: "Gynécologie",
    description:
      "Examen gynécologique principalement pour les femmes enceintes et les dépistages de MST.",
    instructions: `》Nous avons bien pris note de votre demande de rendez-vous.  Un médecin ne manquera pas de vous contacter dans les plus brefs délais.

*__En attendant merci de nous indiquer: __*
- Votre nom et prénom (IG)
- Objet du rendez-vous
- Vos disponibilités`,
    parent: CHANNELS.TICKETS_GYNECOLOGIE._ID,
    manager: ROLES.GYNECOLOGUE,
  },
  [TicketType.Radiology]: {
    emoji: "🩻",
    name: "Radiologie",
    description:
      "Examen radiologique principalement pour les personnes sentant des douleurs internes.",
    instructions: `》Nous avons bien pris note de votre demande de rendez-vous. Un médecin ne manquera pas de vous contacter dans les plus brefs délais.

*__En attendant merci de nous indiquer: __*
- Votre nom et prénom (IG)
- Objet du rendez-vous
- Vos disponibilités`,
    parent: CHANNELS.TICKETS_RADIOLOGIE._ID,
    manager: ROLES.RADIOLOGUE,
  },
  [TicketType.Medical]: {
    emoji: "🩺",
    name: "Visite médicale",
    description:
      "Examen médical pour les personnes qui rencontrent des problèmes de santé.",
    instructions: `》Nous avons bien pris note de votre demande de rendez-vous. Un médecin ne manquera pas de vous contacter dans les plus brefs délais.

*__En attendant merci de nous indiquer: __*
- Votre nom et prénom (IG)
- Objet du rendez-vous
- Vos disponibilités`,
    parent: CHANNELS.TICKETS_MEDECINE_GENERALISTE._ID,
    manager: ROLES.GENERALISTE,
  },
  [TicketType.Events]: {
    emoji: "🎉",
    name: "Evénements",
    description:
      "Organisation d'événements ou mobilisation de personnel soignant.",
    instructions: `》Nous avons bien pris note de votre demande de rendez-vous. Un membre de la direction ne manquera pas de vous contacter dans les plus brefs délais.

*__En attendant merci de nous indiquer: __*
- Objet de l'événement
- Vos disponibilités
- Une estimation du budget`,
    parent: CHANNELS.TICKETS_AUTRES._ID,
  },
  [TicketType.Suggestion]: {
    emoji: "💡",
    name: "Suggestion",
    description: "Vous souhaiteriez nous faire part d'une suggestion ?",
    instructions: `Comme son nom l'indique dans ce ticket vous pourrez nous faire part de vos idées/suggestions que nous pourrions possiblement mettre en place afin d'améliorer l'hôpital et son fonctionnement.
    N'hésitez pas, il n'y a pas de mauvaises idées, nous étudierons toutes les propositions.`,
  },
  [TicketType.Internship]: {
    emoji: "🚑",
    name: "Stage",
    description:
      "Rendez-vous pour effectuer un stage inter-hôpitaux, réservé aux personnels soignants des hopitaux Pillbox et Océan.",
    instructions: `》Si vous avez décidé de prendre rendez-vous avec nous c’est que vous êtes membre des personnels soignants de l’hôpital Pillbox ou Océan. Nous vous remercions de votre confiance et nous vous souhaitons la bienvenue parmi nous.

*__》Afin de réaliser votre stage, merci de suivre les étapes suivantes: __*

**__Dans un premier temps:__** 
- Veuillez vous renommer
- Veuillez faire une demande de rôle dans le salon correspondant:
<#${CHANNELS.INFORMATIONS.DEMANDES_ROLES}>

*__Ensuite, nous renseigner: __*
- Votre grade 
- Votre hopital d'appartenance
- Votre nom et prénom
- Votre numéro de téléphone

》Puis, veuillez indiquer vos disponibilités afin que nous puissions convenir d'un rendez-vous, veillez à prendre en compte que le stage sera d'une durée de 2h minimum.

_Exemple:
Lundi: ?h - ?h 
Mardi: ?h - ?h 
Mercredi: ?h - ?h
Jeudi: ?h - ?h 
Vendredi: ?h - ?h 
Samedi: ?h - ?h 
Dimanche: ?h - ?h_

Enfin, veuillez consulter le document suivant afin de prendre connaissance des règles et du déroulement à respecter durant votre stage:
https://docs.google.com/document/d/1_kDci6culEZ5_TLFqoFNlMY_sqSD_4Sxzjk4DtPXBrs/edit?usp=sharing`,
    parent: CHANNELS.TICKETS_AUTRES._ID,
  },
  [TicketType.HumanResources]: {
    emoji: "📝",
    name: "RH",
    description: "Réservé aux personnels soignants.",
    instructions:
      "Comment pouvons-nous vous aider ? N'hésitez pas à nous fournir toutes les informations nécessaires pour que nous puissions vous aider au mieux.",
    parent: CHANNELS.TICKETS_RESSOURCES_HUMAINES._ID,
  },
};
