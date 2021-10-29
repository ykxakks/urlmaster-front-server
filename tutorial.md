# How to build my own Slack app?

0. This tutorial is for setting up this application in a unix-like OS. I am not sure how to do something(e.g. run a npm server) on Windows...

1. Access the [slack API page](https://api.slack.com/). Find "Your apps" on the top-right, and click it.

2. Click "create new app", then click "From an app manifest".

3. Select a work space for your app to be installed. We recommend to select one personal space(e.g. test group) for the development and test. Click "Next".

4. In the "Enter app manifest below" page, copy the contents of manifest.yml file in this repository to the yaml editor. Edit the part of "name" and "display-name" to whatever you like. Click "Next". Then in the next page click "Create" to create a new app.

(Note: here we requested a lot of bot scopes: some of them are not needed for current app, but we just add them for test. We also added a command "/echo" to show the ability of bot to read a command, but for now nothing is done for the command.)

5. Now you are at the page of your app. You can enter this page again by enter [slack API page](https://api.slack.com/), and then put mouse on "Your apps" on the top-right to see the apps you have already created. 

The app page has two designs, and we choose to use the old design. If on your left panel, only "Basic Information" and "Collaborators" are under the "General" part, scroll down and find a link "Revert to the old design", and click it to return to the old design.

6. Install your application to workspace: click "OAuth & Permissions" in the left panel. Under "OAuth Tokens for Your Workspace", click "Install to Workspace", and in the page generated, choose a channel to add your bot(e.g. "url-master" channel in your test group, if you don't have one, you can create it in your slack work group first), and click "Allow" to finish installation. 

Now you should see a message in the channel where you added the bot like: "added an integration to this channel: test-bot". And under the "Apps" panel in your slack you should find an app with the name which you just set.

7. Collect the following information:

7.1 Your signing secret: click "Basic Information" in the left panel, scroll down, find "Signing secret", click show and copy it. We will denote it as \<signing-secret\>.

7.2 Your app token: also in the page of "Basic Information", scroll down and find "App-Level Tokens", click "Generate Token and Scopes", enter a token name(e.g. "apptoken"). Then click "Add Scope" and add scope "connections:write". Click "Generate", and copy the token generated(started with "xapp-"). We will denote it as \<app-token\>.

7.3 Your bot token: click "OAuth & Permissions" in the left panel, under "OAuth Tokens for Your Workspace", copy the "Bot User OAuth Token". We will denote it as \<bot-token\>.

8. Set your environment variables: find your .bashrc or .zshrc(depending on your shell version) file under root directory, then add the following lines at the end:

```shell
export SLACK_SIGNING_SECRET=<signing-secret>
export SLACK_BOT_TOKEN=<bot-token>
export SLACK_APP_TOKEN=<app-token>
```

Replace \<signing-secret\>, \<app-token\> and \<bot-token\> with the tokens you copied from your app home page. Then run 
```shell
source ~/.zshrc
```
in terminal(shell) to add these variables, or start a new terminal and they will be automatically added. The file name(.zshrc) is depending on your shell version. For bash it should be ".bashrc".

9. To use the email services in url-master, you need a mail account. Here we assume you are using a gmail account, then reopen your .zshrc file, and add the following lines at the end:
```shell
export URLMASTER_MAIL_USERNAME=<gmail-address>
export URLMASTER_MAIL_PASSWORD=<gmail-password>
```
and run 
```shell
source ~/.zshrc
```
to load these environment variables.

10. For the last step, click "App Home" in the left panel of your app home page, and scroll down to find "Messages Tab" under "Show Tabs". Check "Allow users to send Slash commands and messages from the messages tab". Now when you click your app under "Apps" in slack, you can send direct messages to it. If you still cannot send direct messages, reopen your slack.

11. Now do as the README.md said to install and run your slack bot server. Finally send direct message "list" to your bot, and if it responds with an empty lecture list, congratulations! You have finished deploying a slack bot!



