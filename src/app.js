const { createApp } = Vue

window.app = createApp({
    
    data () {
        return {
            name: 'Desk',
            charId: '99fa0002-338a-1024-8a49-009c0215f78a',
            serviceId: '99fa0001-338a-1024-8a49-009c0215f78a',
            positionCharId: '99fa0021-338a-1024-8a49-009c0215f78a',
            positionServiceId: '99fa0020-338a-1024-8a49-009c0215f78a',

            automated: null,
            automationInterval: null,
            connected: false,
            device: null,
            handledSchedules: {},
            loading: false,
            movingTo: null,
            pos: Infinity,
            schedules: {},
            server: null,
            service: null,
            settings: null,

            commands: {
                UP: '4700',
                DOWN: '4600',
                STOP: 'FF00',
            },
        }
    },

    methods: {
        automate () {
            this.automated = ! this.automated
        },

        showOptions () {
            window.open('options.html', '_blank', 'width=600px,height=600px')
        },

        async connect () {
            this.loading = true
            this.connected = false

            await this.requestBluetoothAccess()
            await this.connectToDevice()

            this.onPositionChange(pos => this.pos = pos)
        },

        up () {
            this.send(this.commands.UP)
        },

        down () {
            this.send(this.commands.DOWN)
        },

        stop () {
            this.movingTo = null

            this.send(this.commands.STOP)
        },

        moveTo (pos) {
            this.movingTo = +pos

            pos > this.movingTo ? this.down() : this.up()
        },

        togglePosition () {
            if (this.isPos(this.settings.positions[0])) {
                this.moveTo(this.settings.positions[1])
            } else {
                this.moveTo(this.settings.positions[0])
            }
        },

        async send (command) {
            try {
                const char = await this.service.getCharacteristic(this.charId)
                
                await char.writeValue(this.hexStrToArray(command))
            } catch (e) {
                if (command === 'FF00') {
                    // console.log('Retrying STOP')
                    this.send(command)
                }
            }
        },

        async requestBluetoothAccess () {
            this.device = await navigator.bluetooth.requestDevice({
                filters: [
                    { services: [this.serviceId, this.positionServiceId] },
                    { namePrefix: this.name },
                ],
                // acceptAllDevices: true,
            })

            this.device.addEventListener('gattserverdisconnected', () => this.connect())
        },

        async connectToDevice () {
            this.server = await this.device.gatt.connect()
            this.connected = true
            this.service = await this.server.getPrimaryService(this.serviceId)
            this.pos = await this.getCurrentPosition()
        },

        async getCurrentPosition () {
            const service = await this.server.getPrimaryService(this.positionServiceId)
            const char = await service.getCharacteristic(this.positionCharId)
            const value = await char.readValue()

            return this.toCm(value.buffer)
        },

        async onPositionChange (cb) {
            const service = await this.server.getPrimaryService(this.positionServiceId)
            const char = await service.getCharacteristic(this.positionCharId)

            await char.startNotifications()

            char.addEventListener('characteristicvaluechanged', e => {
                cb(this.toCm(e.target.value.buffer), e.timeStamp)
            })
        },

        b2n (buffer) {
            return new Uint16Array(buffer)[0]
        },

        toCm (buffer) {
            return 381 / 3815 * this.b2n(buffer) + 625
        },

        isPos (pos) {
            return this.pos >= pos - 5 && this.pos <= pos + 5
        },

        hexStrToArray(hexString) {
            let decimals = []

            for (let i = 0; i < hexString.length; i += 2) {
                decimals.push(parseInt(hexString.substr(i, 2), 16))
            }

            return new Uint8Array(decimals)
        },

        clearAutomationInterval () {
            clearInterval(this.automationInterval)
        },

        resetAutomationInterval () {
            this.clearAutomationInterval()

            this.automationInterval = setInterval(() => {
                if (! this.connected || ! Object.keys(this.schedules).length) {
                    return
                }

                const date = new Date()
                const minOfDay = date.getHours() * 60 + date.getMinutes()

                if (this.handledSchedules[minOfDay]) {
                    return
                }

                if (this.schedules.hasOwnProperty(minOfDay)) {
                    const schedule = this.schedules[minOfDay]

                    if (schedule === 'toggle') {
                        this.togglePosition()
                    } else {
                        const pos = +this.settings.positions[+schedule]

                        if (pos >= 630 && pos <= 1270) {
                            this.moveTo(pos)
                        }
                    }
                }

                this.handledSchedules[minOfDay] = true
            }, 15e3)
        },

        translateSchedules () {
            this.schedules = {}

            if (! this.settings.schedules.length) {
                return
            }

            this.settings.schedules.map(schedule => {
                schedule.days.filter(d => d).map(dow => {
                    schedule.intervals.map(interval => {
                        const begin = interval.begin_hour * 60 + interval.begin_minute
                        const end = interval.end_hour * 60 + interval.end_minute
                        const period = interval.unit === 'minute' ? interval.period : interval.period * 60
                        
                        for (let minOfDay = begin; minOfDay <= end; minOfDay += period) {
                            this.schedules[minOfDay] = 'toggle';
                        }
                    })

                    schedule.specific.map(spec => {
                        const minOfDay = spec.hour * 60 + spec.minute
                        
                        this.schedules[minOfDay] = spec.action
                    })
                })
            })
        },

        watchSettings () {
            let previousSettings = null

            setInterval(() => {

                if (previousSettings !== localStorage.settings) {
                    previousSettings = localStorage.settings

                    try {
                        this.settings = JSON.parse(localStorage.settings)
                    } catch (e) {
                        this.settings = this.copy(window.defaultSettings)
                    }
                }

            }, 1e3)
        },

        copy (object) {
            return JSON.parse(JSON.stringify(object))
        },

        // From milimeters to preferred units.
        convert (mm) {
            switch (this.settings.units) {
                case 'mm': return Math.round(mm)
                case 'cm': return Math.round(mm / 10)
                case 'inch': return (mm / 25.4).toFixed(1)
            }
        },
    },

    watch: {
        automated () {
            localStorage.setItem('automated', this.automated)

            if (this.automated) {
                this.resetAutomationInterval()
            } else {
                this.clearAutomationInterval()
            }
        },

        pos () {
            localStorage.setItem('previousPos', this.pos)

            if (this.movingTo === null) {
                return
            }

            const pos = Math.round(this.pos)

            if (this.pos === this.movingTo) {
                return this.stop()
            }

            if (this.pos > this.movingTo) {
                if (this.pos <= this.movingTo + 10) return this.stop()
            } else {
                if (this.pos >= this.movingTo - 10) return this.stop()
            }
        
            this.pos > this.movingTo ? this.down() : this.up()
        },

        settings: {
            deep: true,
            handler () {
                this.translateSchedules()

                this.resetAutomationInterval()
            },
        },
    },

    created () {
        this.settings = this.copy(window.defaultSettings)

        this.watchSettings()

        this.pos = +localStorage.getItem('previousPos') || Infinity
        this.automated = localStorage.getItem('automated') !== 'false'
    },

}).mount('#app')
