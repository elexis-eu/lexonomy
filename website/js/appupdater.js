class AppUpdaterClass {

    constructor(params){
        this.URL = params.url
        this.CHECK_INTERVAL = (params.interval || 24) * 60 * 60 * 1000
        this.onNewVersion = params.onNewVersion
        this._intervalHandle = null
        this.windowVersionKey = params.windowVersionKey || "version"
        if(window[this.windowVersionKey] != "@VERSION@"){
            this.startTimer()
        }
    }

    startTimer(){
        this._intervalHandle = setInterval(this.loadVersion.bind(this), this.CHECK_INTERVAL)
    }

    stopTimer(){
        clearInterval(this._intervalHandle)
        this._intervalHandle = null
    }

    loadVersion(){
        let random = (Math.random(1000000) + "").substr(2)
        $.ajax({
            url: `${this.URL}?${random}`
        })
                .done(this.onData.bind(this))
    }

    onData(actualVersion){
        if(typeof actualVersion != "string") {
            return
        }
        if((window[this.windowVersionKey] + "").trim() != actualVersion.trim()){
            this.stopTimer()
            if(typeof this.onNewVersion == "function"){
                this.onNewVersion()
            } else {
                this.showNotification()
            }
        }
    }

    showNotification(){
        $(`<div class="newVersionNotification"
                    style="position: fixed; top: 0; left: 0; right: 0; z-index: 99999; padding: 20px; text-align: center; background-color: #fff; box-shadow: 0 3px 3px 0 rgb(0 0 0 / 14%), 0 1px 7px 0 rgb(0 0 0 / 12%), 0 3px 1px -1px rgb(0 0 0 / 20%);">
            <div class="newVersionNotificationTitle" style="font-size: 1.8rem; margin-bottom: 1rem;">New version available!</div>
            <div class="newVersionNotificationDesc">Please, reload the page to use the latest version.
                <button id="reloadPageButton" class="newVersionNotificationButton btn" style="margin-left: 1.5rem">
                    reload
                </button>
            </div>
        </div>`).appendTo($("body"))

        $("body").css("margin-top", $(".newVersionNotification").outerHeight() + "px")
        $("#reloadPageButton").click( () => {
            window.location.reload()
        })
    }
}

window.AppUpdaterClass = AppUpdaterClass
