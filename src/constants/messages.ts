const MESSAGES = {
  ERROR: {
    // eslint-disable-next-line quotes
    DM_BLOCKED: `Il semblerait que vos messages privés soient désactivés. Veuillez les activer pour pouvoir utiliser cette fonctionnalité. Pour résoudre ce problème, rendez-vous dans **Paramètres > Confidentialité & sécurité**, puis cochez la case "Autoriser les messages privés venant des membres du serveur".\n\n Si le problème persiste, veuillez contacter un administrateur.`,
    COMMAND_NO_PERMISSION:
      "❌ - Vous n'avez pas la permission d'exécuter cette commande.",
    COMMAND_NOT_AVAILABLE_IN_DM:
      "❌ - Cette commande n'est pas disponible en message privé.",
    COMMAND_NO_TARGET: "❌ - Vous devez spécifier un utilisateur cible.",
    COMMAND_NOT_AVAILABLE_IN_CHANNEL:
      "❌ - Cette commande n'est pas disponible dans ce salon.",
  },
};

export default MESSAGES;
