import {
  APIEmbed,
  ButtonStyle,
  CategoryChannel,
  Channel,
  ChannelType,
  Colors,
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  PermissionFlagsBits,
  TextChannel,
  User,
} from "discord.js";

import APP from "../constants/app";
import CHANNELS from "../constants/channels";
import ROLES from "../constants/roles";
import { TicketTypeData } from "../constants/ticket";
import { TicketType } from "../types/ticket";
import Log from "../utils/log";

class TicketController {
  public static baseEmbed = {
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

    const messages = await channel.messages.fetch();

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

  public static async createTicket(
    guild: Guild,
    member: GuildMember,
    type: TicketType
  ): Promise<APIEmbed> {
    let embed: APIEmbed = {
      ...this.baseEmbed,
    };
    const { user } = member;
    await guild.channels.fetch();

    await member.fetch();
    // if (
    //   type === TicketType.Recruitment &&
    //   !member.roles.cache.has(ROLES.CANDIDATURE_ACCEPTEE)
    // ) {
    //   embed = {
    //     ...this.baseEmbed,
    //     color: Colors.Red,
    //     description:
    //       "Votre candidature n'est pas encore acceptée, vous ne pouvez pas créer de ticket de recrutement.",
    //   };

    //   user
    //     .send({
    //       embeds: [embed],
    //     })
    //     .catch((e) => Log.error(user, e));
    //   return embed;
    // }
    
    if (
      type === TicketType.HumanResources &&
      !member.roles.cache.has(ROLES.EMERGENCY)
    ) {
      embed = {
        ...this.baseEmbed,
        color: Colors.Red,
        description:
          "Vous ne faite pas partie du personnel soignant, vous ne pouvez pas créer de ticket RH.",
      };

      user
        .send({
          embeds: [embed],
        })
        .catch((e) => Log.error(user, e));
      return embed;
    }

    const tickets = guild.channels.cache.filter(
      (channel) =>
        channel.type === ChannelType.GuildText &&
        channel.name.startsWith(`${TicketTypeData[type].emoji}┊`) &&
        channel.topic?.includes(user.id)
    );

    if (tickets.size > 0) {
      // send a private message to the user
      const channel = tickets.first() as TextChannel;
      embed = {
        ...this.baseEmbed,
        color: Colors.Red,
        description: `Vous avez déjà un ticket ${TicketTypeData[
          type
        ].name.toLowerCase()} ouvert dans le salon ${channel}.`,
      };
      user
        .send({
          embeds: [embed],
        })
        .catch((e) => Log.error(user, e));
      return embed;
    }

    const parent = TicketTypeData[type].parent || CHANNELS.TICKETS_AUTRES._ID;
    const category = guild.channels.cache.get(parent) as CategoryChannel;

    // check if the category got 50 or over 50 channels

    if (category.children.cache.size >= 50) {
      embed = {
        ...this.baseEmbed,
        color: Colors.Red,
        description: `Il semblerait qu'il y'ai trop de tickets ouverts dans la catégorie ${TicketTypeData[
          type
        ].name.toLowerCase()}. Veuillez réessayer plus tard.`,
      };
      user
        .send({
          embeds: [embed],
        })
        .catch((e) => Log.error(user, e));
      return embed;
    }

    const channel = await guild.channels.create({
      name: `${TicketTypeData[type].emoji}┊${member.nickname || user.username}`,
      topic: `Ticket ${TicketTypeData[type].name.toLowerCase()} de ${user}`,
      parent,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
          ],
        },
        ...category.permissionOverwrites.cache.map((overwrite) => ({
          id: overwrite.id,
          allow: overwrite.allow.toArray(),
          deny: overwrite.deny.toArray(),
        })),
      ],
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
              label: "🔒 Fermer le ticket",
              custom_id: "ticket_close",
            },
          ],
        },
      ],
    });

    embed = {
      ...this.baseEmbed,
      description: `Votre ticket ${TicketTypeData[
        type
      ].name.toLowerCase()} a été créé dans le salon ${channel}.`,
    };

    user
      .send({
        embeds: [embed],
      })
      .catch((e) => Log.error(user, e));

    Log.info(
      `**${guild.name}**`,
      `ticket ${TicketTypeData[type].name.toLowerCase()} créé pour ${user}`
    );

    return embed;
  }

  public static async closeTicket(
    user: User,
    channel: TextChannel | GuildTextBasedChannel
  ) {
    Log.info(
      `**${channel.guild.name}**`,
      `ticket ${channel.name} fermé par **${user.username}#${user.discriminator}**`
    );
    await channel.delete();
  }

  public static async changePrefix(
    channel: GuildTextBasedChannel,
    prefix: string
  ): Promise<void> {
    const parts = channel.name.split("┊");
    if (parts.length >= 2) {
      const newName = `${parts[0]}┊${prefix} ${parts[1]}`;
      await channel.setName(newName);
    }
  }

  public static async getUserTicketsChannels(
    guild: Guild,
    user: User
  ): Promise<TextChannel[]> {
    await guild.channels.fetch();
    const tickets = guild.channels.cache.filter(
      (channel) =>
        channel.type === ChannelType.GuildText &&
        Object.values(TicketType).some((type) =>
          channel.name.startsWith(`${TicketTypeData[type].emoji}┊`)
        ) &&
        channel.topic?.includes(user.id)
    );

    return tickets.map((channel) => channel as TextChannel);
  }

  public static async isTicket(ticket: TextChannel): Promise<boolean> {
    return !!(
      ticket.type === ChannelType.GuildText &&
      Object.values(TicketType).some((type) =>
        ticket.name.startsWith(`${TicketTypeData[type].emoji}`)
      ) &&
      ticket.topic?.includes("Ticket")
    );
  }
}

export default TicketController;
