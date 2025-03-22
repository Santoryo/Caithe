import PocketBase from 'pocketbase';
import { json } from '@sveltejs/kit';
import { PUBLIC_POCKETBASE } from '$env/static/public';
import { PB_ADMIN_USERNAME, PB_ADMIN_PASSWORD } from '$env/static/private';

export async function GET({ setHeaders, params }) {
    try {
        const pb = new PocketBase(PUBLIC_POCKETBASE);
        const id = params.twitchId;

        await pb.admins.authWithPassword(PB_ADMIN_USERNAME, PB_ADMIN_PASSWORD);

        const data = await pb.collection("twitchGW2").getFirstListItem(`twitchId="${id}"`);

        if(!data) {
            return json(null);
        }

        // const isAtLeastFiveMinutesOld = Date.now() - new Date(data.updated).getTime() >= 300000;

        // if(!isAtLeastFiveMinutesOld)
        // {
        //     return json(data.character);
        // }

        console.log("Fetching new data for", data.twitchId);
        const gw2Data = await fetch(`https://api.guildwars2.com/v2/characters?ids=all&access_token=${data.apiKey}&v=2019-12-19T00:00:00.000Z`);

        setHeaders({
            'Cache-Control': 'public, max-age=300',
            'Content-Type': 'application/json',
        })

        if(gw2Data.ok) {
            console.log("Data fetched successfully for", data.twitchId);
            const characterData = (await gw2Data.json())[0];
            await pb.collection("twitchGW2").update(data.id, {character: characterData});
            return json(characterData);
        }

        // return json(data.character);
    }
    catch (error) {
        console.error(error);
        return json({});
    }
}