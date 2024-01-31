import feedparser

xml_url = 'https://www.monroecounty.gov/incidents911.rss'

feed = feedparser.parse(xml_url)


def parse():
    for entry in feed['entries']:
        print(entry)


# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    parse()

# See PyCharm help at https://www.jetbrains.com/help/pycharm/
