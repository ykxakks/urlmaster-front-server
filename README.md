# urlmaster
send urls for lectures

# Usage

## Installation

```console
git clone https://github.com/ykxakks/urlmaster
cd urlmaster
npm install 
```

## Use

1. Create an app in slack API and installed for your group.

2. Set environment variables such as SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET, SLACK_APP_TOKEN.

3. Create a folder for level database:
```console
mkdir leveldb
```

4. Run the following command to start your bot in the directory of urlmaster:
```console
npm start
```

5. Send messages to your bot according to the usage.txt file.

e.g. send "list" to the bot, and the bot will return the list of current lectures.
