import {
  ButtonStyle,
  Channel,
  ChannelType,
  Colors,
  Guild,
  TextChannel,
  User,
} from "discord.js";
import APP from "../constants/app";
import CHANNELS from "../constants/channels";
import { TicketType } from "../types/ticket";
import Log from "../utils/log";

class TicketController {
  private static baseEmbed = {
    title: "Ticket",
    color: Colors.White,
    footer: {
      text: APP.NAME,
      icon_url: APP.LOGO,
    },
  };

  public static async initialize(
    channel: Channel,
    type: "support" | "meeting"
  ): Promise<void> {
    if (channel?.type !== ChannelType.GuildText) return;

    const supportEmbed = {
      ...this.baseEmbed,
      title: "Support",
      description:
        "Entrez en contact avec notre équipe en cliquant sur le bouton qui correspond à votre demande.\n\n" +
        Object.values(TicketType)
          .filter((type) => type.startsWith("support_"))
          .map((type) => {
            return `**${TicketTypeData[type].name}**\n${TicketTypeData[type].description}`;
          })
          .join("\n\n"),
    };

    const meetingEmbed = {
      ...this.baseEmbed,
      title: "Rendez-vous",
      description:
        "Prenez rendez-vous avec notre équipe en cliquant sur le bouton qui correspond à votre demande.\n\n" +
        Object.values(TicketType)
          .filter((type) => type.startsWith("meeting_"))
          .map((type) => {
            return `**${TicketTypeData[type].name}**\n${TicketTypeData[type].description}`;
          })
          .join("\n\n"),
    };

    const messages = await channel.messages.fetch({ limit: 1 });

    const messagesWithSameContent = messages.filter(
      (message) =>
        message.embeds[0]?.description ===
          (type === "support"
            ? supportEmbed.description
            : meetingEmbed.description) &&
        message.embeds[0]?.title ===
          (type === "support" ? supportEmbed.title : meetingEmbed.title)
    );
    if (messagesWithSameContent.size === 0) {
      // add buttons to the embed message
      await Promise.all(
        messages.map(async (message) => await message.delete())
      );

      const ticketValues = Object.values(TicketType).filter((t) =>
        t.startsWith(type === "support" ? "support_" : "meeting_")
      );

      // components can contain up to 5 action rows and 5 buttons per row, so we need to split the buttons into multiple rows, depending on TicketValues
      const rows = Math.ceil(ticketValues.length / 5);

      channel.send({
        embeds: [type === "support" ? supportEmbed : meetingEmbed],
        // components can contain up to 5 action rows and 5 buttons per row, so we need to split the buttons into multiple rows, depending on TicketValues
        components: Array.from({ length: rows }, (_, i) => {
          return {
            type: 1,
            components: ticketValues.slice(i * 5, i * 5 + 5).map((t) => ({
              type: 2,
              style: ButtonStyle.Primary,
              label: TicketTypeData[t].name,
              emoji: {
                name: TicketTypeData[t].emoji,
              },
              custom_id: `ticket_${t}`,
            })),
          };
        }),
      });

      Log.info(`**${channel.guild.name}**`, `salon de ${type} mis à jour`);
    }
  }

  public static async createTicket(guild: Guild, user: User, type: TicketType) {
    await guild.channels.fetch();

    const tickets = guild.channels.cache.filter(
      (channel) =>
        channel.type === ChannelType.GuildText &&
        channel.name.startsWith(`${TicketTypeData[type].emoji}┊`) &&
        channel.topic?.includes(user.id)
    );

    if (tickets.size > 0) {
      // send a private message to the user
      const channel = tickets.first() as TextChannel;
      await user.send({
        embeds: [
          {
            ...this.baseEmbed,
            description: `Vous avez déjà un ticket ${TicketTypeData[
              type
            ].name.toLowerCase()} ouvert dans le salon ${channel}.`,
          },
        ],
      });
      return;
    }

    const channel = await guild.channels.create({
      name: `${TicketTypeData[type].emoji}┊${user.username}`,
      topic: `Ticket ${TicketTypeData[type].name.toLowerCase()} de ${user}`,
      parent: TicketTypeData[type].parent || CHANNELS.TICKETS_AUTRES._ID,
      type: ChannelType.GuildText,
    });

    // add the user to the channel
    await channel.permissionOverwrites.create(user, {
      ViewChannel: true,
      SendMessages: true,
    });

    const instructionEmbed = {
      ...this.baseEmbed,
      description: `Bonjour ${user} !\n\n` + TicketTypeData[type].instructions,
    };

    await channel.send({
      embeds: [instructionEmbed],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: ButtonStyle.Danger,
              label: "❌ Fermer le ticket",
              custom_id: "ticket_close",
            },
          ],
        },
      ],
    });

    await user.send({
      embeds: [
        {
          ...this.baseEmbed,
          description: `Votre ticket ${TicketTypeData[
            type
          ].name.toLowerCase()} a été créé dans le salon ${channel}.`,
        },
      ],
    });

    Log.info(
      `**${guild.name}**`,
      `ticket ${TicketTypeData[type].name.toLowerCase()} créé pour ${user}`
    );
  }

  public static async closeTicket(user: User, channel: TextChannel) {
    Log.info(
      `**${channel.guild.name}**`,
      `ticket ${channel.name} fermé par **${user.username}#${user.discriminator}**`
    );
    await channel.delete();
  }
}

export const TicketTypeData: Record<
  TicketType,
  {
    emoji: string;
    name: string;
    description: string;
    instructions: string;
    parent?: string;
  }
> = {
  [TicketType.Complaint]: {
    emoji: "📢",
    name: "Plainte",
    description: "Plainte envers un de nos personnels soignant.",
    instructions: "",
  },
  [TicketType.Partnership]: {
    emoji: "🤝",
    name: "Partenariat",
    description: "Demande de partenariat avec notre hôpital.",
    instructions: "",
  },
  [TicketType.Support]: {
    emoji: "📞",
    name: "Support",
    description: "Questions simples ou besoin d'aide.",
    instructions: "",
  },
  [TicketType.Recruitment]: {
    emoji: "📥",
    name: "Recrutement",
    description:
      "Une fois votre candidature acceptée, vous pourrez créer un ticket de recrutement si celui-ci n'est pas déjà ouvert.",
    instructions: "",
    parent: CHANNELS.TICKETS_RECRUTEMENTS._ID,
  },
  [TicketType.PPA]: {
    emoji: "🔫",
    name: "PPA",
    description: `Examen psychologique réservé aux forces de l'ordre afin de pouvoir porter une arme. Assurez d'avoir fait votre demande de rôle dans le salon <#${CHANNELS.INFORMATIONS.DEMANDES_ROLES}>.`,
    instructions: `》Si vous avez décidé de prendre rendez-vous avec un de nos spécialiste pour le test de psychologie c’est que vous êtes membre de la __**BCSO**__, ce test nous servira à voir si vous êtes apte ou non à disposer d’un port d'arme. 

*__》Afin de créer votre dossier, merci de suivre les étapes suivantes: __*

**__Dans un premier temps:__** 

- Veuillez vous renommer [Matricule] Nom Prénom 
- Veuillez faire une demande de rôle dans le channel correspondant: <#${CHANNELS.INFORMATIONS.DEMANDES_ROLES}>

*__Ensuite, nous renseigner: __*

- Votre brigade 
- Votre matricule
- Votre nom et prénom

》Et enfin, veuillez indiquer vos disponibilités afin que nous puissions convenir d’un rendez-vous ? 

_Exemple: 

Lundi: ?h - ?h 
Mardi: ?h - ?h 
Mercredi: ?h - ?h
Jeudi: ?h - ?h 
Vendredi: ?h - ?h 
Samedi: ?h - ?h 
Dimanche: ?h - ?h_`,
    parent: CHANNELS.TICKETS_PPA._ID,
  },
  [TicketType.Psychology]: {
    emoji: "🧠",
    name: "Psychologie",
    description:
      "Examen psychologique pour les personnes principalement en détresse ou en souffrance psychologique.",
    instructions: "",
    parent: CHANNELS.TICKETS_PSYCOLOGIE._ID,
  },
  [TicketType.Toxicology]: {
    emoji: "💉",
    name: "Toxicologie",
    description:
      "Examen toxicologique pour les personnes qui rencontrent des problèmes de toxicomanie.",
    instructions: "",
    parent: CHANNELS.TICKETS_TOXICOLOGIE._ID,
  },
  [TicketType.Surgery]: {
    emoji: "🦾",
    name: "Chirurgie",
    description:
      "Examen chirurgical pour les personnes qui rencontrent des problèmes de santé ou souhaitent subir une modification corporelle.",
    instructions: "",
    parent: CHANNELS.TICKETS_CHIRURGIE._ID,
  },
  [TicketType.Gynecology]: {
    emoji: "🧠",
    name: "Gynécologie",
    description:
      "Examen gynécologique principalement pour les femmes enceintes et les dépistages de MST.",
    instructions: "",
    parent: CHANNELS.TICKETS_GYNECOLOGIE._ID,
  },
  [TicketType.Radiography]: {
    emoji: "🧠",
    name: "Radiographie",
    description:
      "Examen radiologique principalement pour les personnes sentant des douleurs internes.",
    instructions: "",
    parent: CHANNELS.TICKETS_RADIOGRAPHIE._ID,
  },
};

export default TicketController;
