import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container">
                <table class="list" v-if="list">
                    <tr v-for="([level, err], i) in list">
                        <td class="rank">
                            <p v-if="i + 1 <= 100" class="type-label-lg">#{{ i + 1 }}</p>
                            <p v-else class="type-label-lg">Legacy</p>
                        </td>
                        <td class="level" :class="{ 'active': selected == i, 'error': !level }">
                            <button @click="selected = i">
                                <span class="type-label-lg">{{ level?.name || \`Error (\${err}.json)\` }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="level-container">
                <div class="level" v-if="level">
                    <h1>{{ level.name }}</h1>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier" :category="level.category"></LevelAuthors>
                    <iframe class="video" id="videoframe" :src="video" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points when completed</div>
                            <p>{{ score(selected + 1, 100, level.percentToQualify) }}</p>
                        </li>
                       <li> 
                       <div class="type-title-sm">ID</div> 
                       <a class="type-label-lg" :href="'https://beatsaver.com/maps/' + level.id" target="_blank"> 
                       {{ level.id }} 
                        </a> 
                    </li>
                    </ul>
                    <h2>Records</h2>
                    <p v-if="selected + 1 <= 75"><strong>{{ level.percentToQualify }}%</strong> or better to qualify</p>
                    <p v-else-if="selected + 1 <= 150"><strong>100%</strong> or better to qualify</p>
                    <p v-else>This level does not accept new records.</p>
                    <table class="records">
                        <thead>
                            <tr>
                                <th class="type-label-lg">Date</th>
                                <th class="type-label-lg">Player</th>
                                <th class="type-label-lg">Headset</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="record in level.records" :key="record.user" class="record">
                                <td class="date">
                                    <p class="type-label-lg">{{ record.date }}</p>
                                </td>
                                <td class="user">
                                    <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                                </td>
                                <td class="headset">
                                    <p class="type-label-lg">{{ record.headset }}</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <h2>Changelog</h2>
                    <table class="changelog" v-if="level.changelog && level.changelog.length">
                        <tr v-for="entry in level.changelog">
                            <td class="date">
                                <p>{{ entry.date }}</p>
                            </td>
                            <td class="change">
                                <p>{{ entry.change }}</p>
                            </td>
                        </tr>
                    </table>
                    <p v-else>No changelog entries available for this level.</p>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <div class="og">
                        <p class="type-label-md">Website layout made by <a href="https://tsl.pages.dev/" target="_blank">TheShittyList</a></p>
                    </div>
                    <template v-if="editors">

                        <h3>List Editors</h3>
                        <ol class="editors">
                            <li v-for="editor in editors">
                                <img :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>
                    <h3>Submission Requirements</h3>
                    <p>
                        1. The score must be set legitimately. No use of Speed Hacks, Cheat Engine, Swing Modification, or Hitbox Modification.
                    </p>
                    <p>
                        2. The submitted score must be submitted to the correct leaderboard. Please click on the ID of the map to ensure that you are playing the right version. This also means that the score should be set on the correct difficulty of the map if there are multiple.
                    </p>
                    <p>
                        3. You must have a replay file for your score to be considered legitimate. Failure to provide a file if asked will result in the denial of your score.
                    </p>
                    <p>
                        4. Verifications must be uploaded to YouTube. Submitted recordings must show the entire replay / map.
                    </p>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        editors: [],
        loading: true,
        selected: 0,
        errors: [],
        roleIconMap,
        store
    }),
    computed: {
        level() {
            return this.list[this.selected][0];
        },
        video() {
            if (!this.level.showcase) {
                return embed(this.level.verification);
            }

            return embed(
                this.toggledShowcase
                    ? this.level.showcase
                    : this.level.verification
            );
        },
    },
    async mounted() {
        // Hide loading spinner
        this.list = await fetchList();
        this.editors = await fetchEditors();

        // Error handling
        if (!this.list) {
            this.errors = [
                "Failed to load list. Retry in a few minutes or notify list staff.",
            ];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => {
                        return `Failed to load level. (${err}.json)`;
                    })
            );
            if (!this.editors) {
                this.errors.push("Failed to load list editors.");
            }
        }

        this.loading = false;
    },
    methods: {
        embed,
        score,
    },
};
