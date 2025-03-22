<script lang="ts">
    import { currentUser, pb } from "$lib/pocketbase";
	import { onMount } from "svelte";

    let keyVal = "";

    async function linkTwitch() {
        const authData = await pb
        .collection("twitchGW2")
        .authWithOAuth2({provider: "twitch"});

        console.log(authData);

        if(authData.meta)
        {
            const formData = new FormData();

            formData.append("twitchId", authData.meta.id);
            await pb.collection("twitchGW2").update(authData.record.id, formData);
        }

    }

    async function saveKey() {
        const formData = new FormData();
        formData.append("apiKey", keyVal);
        if(!$currentUser) return;
        await pb.collection("twitchGW2").update($currentUser.id, formData);
    }

    onMount(() => {
        if(!$currentUser) return;
        pb.collection("twitchGW2").getOne($currentUser.id).then((data) => {
            keyVal = data.apiKey;
        });
    });

</script>


<div class="flex flex-col gap-2 w-[500px]">
    {#if $currentUser}
        <div>Welcome, {$currentUser.username}</div>
        <input type="text" placeholder="Enter your Guild Wars 2 API Key" bind:value={keyVal} class="border-black border-2" />
        <button on:click={saveKey}>Save key</button>
    {:else}
        <button on:click={linkTwitch}>Link with Twitch</button>
    {/if}

</div>