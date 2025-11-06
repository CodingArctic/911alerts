import { XMLParser } from 'fast-xml-parser';

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
    let req = await fetch('https://www.monroecounty.gov/incidents911.rss');
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

        if (latDistance < userRadiusDegrees.lat && longDistance < userRadiusDegrees.long) {
            // incident is in radius
            let mapsLink = generateGoogleMapsLink(incident['geo:lat'], incident['geo:long']);
            eventsInRange.push({
                ...incident,
                mapsLink: mapsLink
            });
        }
    });
    console.log(eventsInRange);
}

async function start() {
    process.loadEnvFile(`.env`);
    await ticker();
}

start();