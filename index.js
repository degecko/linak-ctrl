const { app, BrowserWindow } = require('electron')

const createWindow = () => {
    const win = new BrowserWindow({
        width: 320,
        minWidth: 320,
        height: 44,
        minHeight: 44,
        maxHeight: 44,
        frame: false,
    })

    win.webContents.on('select-bluetooth-device', (e, devices, cb) => {
        e.preventDefault()

        devices?.length && cb(devices[0].deviceId)
    })

    win.loadFile('src/index.html')

    // win.webContents.openDevTools()
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => (process.platform === 'darwin') && app.quit())
