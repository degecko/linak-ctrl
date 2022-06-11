const { createApp } = Vue

window.options = createApp({
    
    data () {
        return {
            days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            settings: null,
            defaultSettings,
        }
    },

    methods: {
        getSettings () {
            try {
                this.settings = JSON.parse(localStorage.settings)
            } catch (e) {
                this.settings = this.copy(this.defaultSettings)
            }
        },

        copy (object) {
            return JSON.parse(JSON.stringify(object))
        },

        // From preferred units to milimeteres.
        backwardsConvert (value) {
            switch (this.settings.units) {
                case 'mm': return value
                case 'cm': return value * 10
                case 'inch': return Math.round(value * 25.4)
            }
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
        settings: {
            deep: true,
            handler (settings) {
                localStorage.settings = JSON.stringify(settings)
            },
        },
    },

    created () {
        this.getSettings()
    },

}).mount('#options')
