import feedparser
import requests

rss_url = 'https://www.monroecounty.gov/incidents911.rss'

webhook_url = 'https://discordapp.com/api/webhooks/1202388231430357032/88n4s0oek0rf1XrCLu9BJn7lnGJfNdospM7Gm_mubuUdf7kRI4GjS5gdg2dzkdF3QjMd'

feed = feedparser.parse(rss_url)


def refresh():
    # feed = feedparser.parse(rss_url)

    print(feed.entries[0].title)


def generate_google_maps_link(address):
    base_url = "https://maps.google.com/?q="
    formatted_address = "+".join(address.split())
    search_link = base_url + formatted_address
    return search_link


def sending_data_test():
    message = feed.entries[0]['title']
    address = message.split("at")
    final_address = address[1][:-3]
    google_map_link = generate_google_maps_link(final_address)

    print("sending alert for " + message + " | GMaps: " + google_map_link)

    requests.post("https://ntfy.sh/911Alerts",
                  data=message.encode(encoding='utf-8'),
                  headers={"Click": f"{google_map_link}"})


if __name__ == '__main__':
    sending_data_test()
