import { APIEmbed, SlashCommandBuilder } from "discord.js";
import APP from "../constants/app";
import { Player } from "../types/server";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fetch = require("node-fetch");

const search = (list: Player[], query: string) => {
  const results = list.filter((result) =>
    result.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .includes(
        query
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
      )
  );
  results.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  });

  return results;
};

const ServerCommand = {
  data: new SlashCommandBuilder()
    .setName("server")
    .setDescription("Get infos about the current server")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("La commande à exécuter")
        .setRequired(true)
        .addChoices(
          {
            value: "general",
            name: "Informations générales sur Unity",
          },
          {
            value: "find",
            name: "Chercher un joueur (en ligne)",
          }
        )
    )
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Phrase to search for")
        .setAutocomplete(true)
    ),
  async autocomplete(interaction) {
    // handle the autocompletion response (more on how to do that below)
    const focusedValue = interaction.options.getFocused();

    const data = await fetch(
      "https://servers-frontend.fivem.net/api/servers/single/q8538p",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36",
        },
      }
    ).then((res) => res.json());

    const players = data.Data.players as Player[];
    const filtered = search(players, focusedValue);
    await interaction.respond(
      filtered.slice(0, 25).map((choice) => {
        return { name: choice.name, value: choice.id.toString() };
      })
    );
  },
  async execute(interaction) {
    const command = interaction.options.getString("command");
    const query = interaction.options.getString("query");

    const data = await fetch(
      "https://servers-frontend.fivem.net/api/servers/single/q8538p",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36",
        },
      }
    ).then((res) => res.json());

    switch (command) {
      case "find": {
        const players = data.Data.players as Player[];
        const result = players.find((player) => player.id === parseInt(query));

        if (!result) {
          interaction.reply({
            embed: [
              {
                title: "Recherche de joueur",
                description: `Aucun joueur trouvé avec l'ID \`${query}\``,
                footer: {
                  text: APP.NAME,
                  icon_url: APP.LOGO,
                },
              },
            ],
            ephemeral: true,
          });

          return;
        }

        const embed: APIEmbed = {
          title: `Recherche du joueur \`${result.id}\``,
          description: `**Nom:** ${result.name}
**Id**: ${result.id}
**Ping:** ${result.ping}
**Identifiants:**
${result.identifiers
  .map((identifier) => {
    if (identifier.startsWith("steam:")) {
      return `- Steam: \`${identifier.replace("steam:", "")}\``;
    }
    if (identifier.startsWith("license:")) {
      return `- License: \`${identifier.replace("license:", "")}\``;
    }
    if (identifier.startsWith("license2:")) {
      return `- License 2: \`${identifier.replace("license2:", "")}\``;
    }
    if (identifier.startsWith("discord:")) {
      return `- Discord: <@${identifier.replace("discord:", "")}>`;
    }
    if (identifier.startsWith("xbl:")) {
      return `- Xbox Live: \`${identifier.replace("xbl:", "")}\``;
    }
    if (identifier.startsWith("live:")) {
      return `- Live: \`${identifier.replace("live:", "")}\``;
    }
    if (identifier.startsWith("fivem:")) {
      return `- FiveM: \`${identifier.replace("fivem:", "")}\``;
    }

    return `- \`${identifier}\``;
  })
  .join("\n")}
`,
          footer: {
            text: APP.NAME,
            icon_url: APP.LOGO,
          },
        };

        interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });

        break;
      }
      case "general": {
        const embed: APIEmbed = {
          title: "Informations générales sur Unity",
          description: `${data.Data.vars.sv_projectDesc}

**Joueurs en ligne:** ${data.Data.clients}/${data.Data.sv_maxclients}
**Version du serveur:** ${data.Data.server}
**Owner:** ${data.Data.ownerName} (${data.Data.ownerProfile})
**Map:** ${data.Data.mapname}
**Resources (${data.Data.resources.length}):** ${data.Data.resources
            .map((resource: string) => `\`${resource}\``)
            .join(", ")}

**Staff en ligne (${
            data.Data.players.filter((player: any) =>
              player.name.includes("[A]")
            ).length
          }):**\n ${
            data.Data.players.filter((player: any) =>
              player.name.includes("[A]")
            ).length > 0
              ? data.Data.players
                  .filter((player: any) => player.name.includes("[A]"))
                  .map(
                    (player: any) =>
                      `- ${player.name.replace("[A]", "").trim()}`
                  )
                  .join("\n")
              : "Aucun"
          }
          `,
          image: {
            url: data.Data.vars.banner_connecting,
          },
          footer: {
            text: APP.NAME,
            icon_url: APP.LOGO,
          },
        };
        interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });
        break;
      }
    }
  },
};

export default ServerCommand;
