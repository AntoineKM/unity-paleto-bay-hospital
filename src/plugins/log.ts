import { Events, TextChannel } from "discord.js";
import { DiscordPlugin } from "../types/plugin";
import Log from "../utils/log";

const LogPlugin: DiscordPlugin = (client) => {
  // handle when a guild member delete a message
  client.on(Events.MessageDelete, (message) => {
    if (message.author?.bot) return;
    Log.warn(
      `**${message.guild?.name}**`,
      `message de **${message.author?.username}#${message.author?.discriminator}** dans <#${message.channel.id}> supprimé:\n${message.cleanContent}`
    );
  });

  // handle when a guild member edit a message
  client.on(Events.MessageUpdate, (oldMessage, newMessage) => {
    if (oldMessage.author?.bot) return;

    if ((oldMessage.channel as TextChannel)?.name.startsWith("access")) return;
    Log.warn(
      `**${oldMessage.guild?.name}**`,
      `message édité par **${oldMessage.author?.username}#${oldMessage.author?.discriminator}** dans <#${oldMessage.channel.id}>:\n${oldMessage.cleanContent}\n⬇️\n${newMessage.cleanContent}`
    );
  });

  // handle when a guild member join the server
  client.on(Events.GuildMemberAdd, (member) => {
    Log.info(`**${member.guild.name}**`, `${member} a rejoint le serveur`);
  });

  // handle when a guild member leave the server
  client.on(Events.GuildMemberRemove, (member) => {
    Log.info(`**${member.guild.name}**`, `${member} a quitté le serveur`);
  });

  // handle when a member join a voice channel
  client.on(Events.VoiceStateUpdate, (oldState, newState) => {
    if (oldState.channelId === newState.channelId) return;
    if (oldState.channelId === null) {
      Log.info(
        `**${newState.guild.name}**`,
        `**${newState.member?.user.username}#${newState.member?.user.discriminator}** a rejoint le salon vocal <#${newState.channelId}>`
      );
    } else if (newState.channelId === null) {
      Log.info(
        `**${oldState.guild.name}**`,
        `**${oldState.member?.user.username}#${oldState.member?.user.discriminator}** a quitté le salon vocal <#${oldState.channelId}>`
      );
    } else {
      Log.info(
        `**${newState.guild.name}**`,
        `**${newState.member?.user.username}#${newState.member?.user.discriminator}** est passé du salon vocal <#${oldState.channelId}> au salon vocal <#${newState.channelId}>`
      );
    }
  });

  // handle when someone change the role of someone
  client.on(Events.GuildMemberUpdate, (oldMember, newMember) => {
    if (oldMember.roles.cache.size === newMember.roles.cache.size) return;
    if (oldMember.roles.cache.size > newMember.roles.cache.size) {
      const role = oldMember.roles.cache.find(
        (role) => !newMember.roles.cache.has(role.id)
      );
      Log.info(
        `**${newMember.guild.name}**`,
        `**${newMember.user.username}#${newMember.user.discriminator}** a perdu le rôle **${role?.name}**`
      );
    } else {
      const role = newMember.roles.cache.find(
        (role) => !oldMember.roles.cache.has(role.id)
      );
      Log.info(
        `**${newMember.guild.name}**`,
        `**${newMember.user.username}#${newMember.user.discriminator}** a gagné le rôle **${role?.name}**`
      );
    }
  });

  // handle when someone change the nickname of someone
  client.on(Events.GuildMemberUpdate, (oldMember, newMember) => {
    if (oldMember.nickname === newMember.nickname) return;
    Log.info(
      `**${newMember.guild.name}**`,
      `**${newMember.user.username}#${newMember.user.discriminator}** a changé son pseudo de **${oldMember.nickname}** à **${newMember.nickname}**`
    );
  });

  // handle when someone react to a message
  client.on(Events.MessageReactionAdd, (reaction, user) => {
    if (user.bot) return;
    Log.info(
      `**${reaction.message.guild?.name}**`,
      `**${user.username}#${user.discriminator}** a réagi à un message dans <#${reaction.message.channel.id}> avec ${reaction.emoji}`
    );
  });

  // handle when someone remove a reaction from a message
  client.on(Events.MessageReactionRemove, (reaction, user) => {
    if (user.bot) return;
    Log.info(
      `**${reaction.message.guild?.name}**`,
      `**${user.username}#${user.discriminator}** a retiré une réaction à un message dans <#${reaction.message.channel.id}> avec ${reaction.emoji}`
    );
  });

  // handle when someone use a slash command
  client.on(Events.InteractionCreate, (interaction) => {
    if (interaction.isCommand()) {
      Log.info(
        `**${interaction.guild?.name ?? "DM"}**`,
        `member **${interaction.user.username}#${interaction.user.discriminator}** excuted the command ` +
          "``" +
          `/${interaction.commandName} ${interaction.options.data
            .map((option) => option.name + ":" + option.value)
            .join(" ")}` +
          "``"
      );
    }
  });
};

export default LogPlugin;
