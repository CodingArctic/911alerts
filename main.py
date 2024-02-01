import feedparser
import requests
from discord_webhook import DiscordWebhook

xml_url = 'https://www.monroecounty.gov/incidents911.rss'

webhook_url = 'https://discordapp.com/api/webhooks/1202388231430357032/88n4s0oek0rf1XrCLu9BJn7lnGJfNdospM7Gm_mubuUdf7kRI4GjS5gdg2dzkdF3QjMd'

feed = feedparser.parse(xml_url)


def parse():
    # for entry in feed['entries']:
    #     print(entry)

    print(feed.entries[0]['title'])


def test_webhook():
    message = 'testing webhook!'
    webhook = DiscordWebhook(url=webhook_url, content=message)
    webhook.execute()


def test_ntfy():
    requests.post("http://192.168.0.92/test", data="test message!".encode(encoding='utf-8'))


def sending_data_test():
    message = feed.entries[0]['title']
    requests.post("http://192.168.0.92/test", data=message.encode(encoding='utf-8'))


if __name__ == '__main__':
    sending_data_test()
