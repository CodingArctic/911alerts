import feedparser
from discord_webhook import DiscordWebhook

xml_url = 'https://www.monroecounty.gov/incidents911.rss'

webhook_url = 'https://discordapp.com/api/webhooks/1202388231430357032/88n4s0oek0rf1XrCLu9BJn7lnGJfNdospM7Gm_mubuUdf7kRI4GjS5gdg2dzkdF3QjMd'

feed = feedparser.parse(xml_url)


def parse():
    for entry in feed['entries']:
        print(entry)


def test_webhook():
    message = 'testing webhook!'
    webhook = DiscordWebhook(url=webhook_url, content=message)
    response = webhook.execute()


if __name__ == '__main__':
    test_webhook()

