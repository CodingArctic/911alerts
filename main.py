import feedparser
import requests

rss_url = 'https://www.monroecounty.gov/incidents911.rss'

webhook_url = 'https://discordapp.com/api/webhooks/1202388231430357032/88n4s0oek0rf1XrCLu9BJn7lnGJfNdospM7Gm_mubuUdf7kRI4GjS5gdg2dzkdF3QjMd'

feed = feedparser.parse(rss_url)


def refresh():
    # feed = feedparser.parse(rss_url)

    print(feed.entries[0])


def generate_google_maps_link(lat, long):
    base_url = "https://www.google.com/maps/search/?api=1&query="
    search_link = base_url + lat + "," + long
    return search_link


def sending_data_test():
    message = feed.entries[0]['title']
    address = message.split("at")
    lat = feed.entries[0]['geo_lat']
    long = feed.entries[0]['geo_long']
    google_map_link = generate_google_maps_link(lat, long)

    print("sending -> " + google_map_link)

    requests.post("http://ntfy.sh/911Alerts",
                  data=message.encode(encoding='utf-8'),
                  headers={"Click": f"{google_map_link}"})


if __name__ == '__main__':
    sending_data_test()
