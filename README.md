# LINAK CTRL

An app which allows you to automate your IKEA LINAK height adjustable desk.

It's possible to create schedules so that the desk switches to any position at specific times, or that it simply automatically toggles between seated and standing positions.

I've created this because I wanted to force myself to actually use the standing position, because I usually forget that I have this ability while working on something for many hours, and also I don't think it's great to use it all day long in a single position, either standing or sitting.

![](https://i.imgur.com/JteX1FU.png)

Explaining the elements of the interface:

- 110 is the current height of the desk in centimeters. You can pick between centimeters, inches and millimeters as your unit of choice.
- The robot icon controls the automation. When it's purple, it's activated, and it means that it will act out the schedules (from preferences page).
- X means stop. Just in case you want to stop it from raising/lowering at a certain point.
- The down icon is an alias for the standing position. When you press it, it will go to that position. You can customise that value from the preferences page.
- The up icon is similar to down, but it goes to the standing position.
- The last icon opens the preferences page. The options are pretty self-explanatory.

I wanted the controller interface to be as minimalistic as possible, so I've removed everything I could, including the app close/maximize/minimize buttons.

To close it on any OS, you can right-click on the app in the task bar and choose "Close". Alternately, you can press CMD + Q on macOS, ALT + F4 on Windows. CTRL + Q or ALT + F4 on most Linux distros.

![](https://i.imgur.com/gUgmSII.png)

## How to use

First step will be to download this repository locally and cd into it:

```
git clone git@github.com:degecko/linak-ctrl.git

cd linak-ctrl
```

If you don't have git installed, you can always [download the project as a zip file](https://github.com/degecko/linak-ctrl/archive/refs/heads/main.zip).

Please note that I'm still working on figuring out how to properly build this project across multiple operating systems. This section will be updated as I figure out the details.

## Build it yourself using `electron-builder`

You will have to have [Node.js](https://nodejs.org/en/) installed on your system and run the following commands:

```
npm install

npx electron-builder
```

You will find the binary application in the `dist/` directory. Simply open it like any other app.

## Or, open it through Node.js

An alternative without building it into an executable app is to run it using Node.js.

Assuming you have Node installed, run the following command:

```
node run start
```

Note: You might need to put the desk in discovery mode the first time you connect to it through the app. You can do that by pressing the bluetooth button on the controller for 2-3 seconds, until a blue LED comes on. It quickly turns off, but nevertheless, it'll in discovery mode.

## Author

- [Cosmin Gheorghita](https://gecko.dev)

<a href="https://www.buymeacoffee.com/degecko" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/arial-yellow.png" alt="Buy Me A Coffee" style="height: 40px !important;" target="_blank"></a>

