import { XMLParser } from 'fast-xml-parser';
import { Client } from 'pg';

try {
    process.loadEnvFile(`.env`);
} catch {
    console.log("Please configure .env file");
    process.exit();
}



const options = {
    ignoreAttributes: false
}
const parser = new XMLParser(options);

function generateGoogleMapsLink(lat, long) {
    let base_url = "https://www.google.com/maps/search/?api=1&query=";
    let search_link = `${base_url}${lat},${long}`;
    return search_link;
}

async function getData() {
    let req = await fetch(process.env.RSS_URL);
    let data = await req.text();
    let xml = parser.parse(data);

    return xml.rss.channel.item;
}

async function sendAlert(mapLink, message) {
    await fetch(`https://ntfy.sh/${process.env.NTFY_TOPIC}`, {
        method: "POST",
        body: message,
        headers: {
            'Title': '911 Alert Nearby',
            'Click': mapLink
        }
    });
}

function milesToDegrees(miles, userLat) {
    const milesPerDegreeLat = 69;
    const milesPerDegreeLong = 69 * Math.cos(userLat * Math.PI / 180);

    return {
        lat: miles / milesPerDegreeLat,
        long: miles / milesPerDegreeLong
    };
}

async function insertData(table, data = {}) {
    let client;
    try {
        client = new Client({
            host: `localhost`,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: 5432,
        });

        await client.connect();
    } catch {
        console.log("error connecting to db");
    }
    const columns = Object.keys(data);
    const values = Object.values(data);

    let colText = "(";
    let valueText = "(";
    for (let i = 0; i < columns.length; i++) {
        colText += columns[i];
        valueText += `$${i + 1}`;
        if (i + 1 < columns.length) {
            colText += ", ";
            valueText += ", ";
        }
    }
    colText += ")";
    valueText += ")";

    const text = `INSERT INTO ${table} ${colText} VALUES ${valueText};`;

    try {
        const result = await client.query(text, values);
        return result.rowCount;
    } catch (err) {
        console.error("insertData error:", err);
        return null;
    }
}

async function insertIncident(incident) {
    let query = await insertData(`alerts`, {
        id: incident.id,
        title: incident.title,
        date: new Date(incident.pubDate),
        status: incident.description.match(/Status: ([^,]+)/)?.[1],
        lat: incident['geo:lat'],
        long: incident['geo:long'],
        link: incident.link
    });
    return query;
}

async function ticker() {
    let events = await getData();
    let eventsInRange = [];
    events.forEach(incident => {
        let incidentLat = incident['geo:lat'];
        let incidentLong = incident['geo:long'];
        let userLat = process.env.LAT;
        let userLong = process.env.LONG;

        let userRadiusDegrees = milesToDegrees(process.env.RADIUS_MILES, userLat);

        let latDistance = Math.abs(userLat - incidentLat);
        let longDistance = Math.abs(userLong - incidentLong);

        let mapsLink = generateGoogleMapsLink(incident['geo:lat'], incident['geo:long']);
        let id = incident.guid.split(`?`)[1];

        let newIncidentObj = {
            id: id,
            ...incident,
            link: mapsLink
        }

        console.log(newIncidentObj);

        try {
            insertIncident(newIncidentObj);
        } catch {
            console.log("insert failed");
        }

        if (latDistance < userRadiusDegrees.lat && longDistance < userRadiusDegrees.long) {
            // incident is in radius
            eventsInRange.push(newIncidentObj);
        }
    });
}

async function start() {
    setInterval(ticker, 60000)
}

start();