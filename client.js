function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect(); // abs. size of element
    scaleX = canvas.width / rect.width;    // relationship bitmap vs. element for x
    scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y

    return {
        x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
        y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
    }
}

let myApp = Vue.createApp({
    data() {
        return {
            latitude: null,
            longitude: null,
            clickX: null,
            clickY: null,
            results: "",
            forecasts: null //an array of forcast elements.
        };
    },
    methods: {
        getWeather(event) {
            let position = getMousePos(event.srcElement, event);
            //Convert position to latitude and longitude
            let percentX = position.x / event.srcElement.width;
            let percentY = position.y / event.srcElement.height;

            //-135 is the leftmost longitude of the image
            //60 is the topmost latitude of the image
            //Total longitude of the image is: 75 degrees
            //Total latitude of the image is: 45 degrees
            this.longitude = percentX * 75 - 135;
            this.latitude = -percentY * 45 + 60;

            //Get the forecast for this location, and display it.

            fetch(`https://api.weather.gov/points/${this.latitude},${this.longitude}`)
                .then(response => response.json())
                .then(json => {
                    if (json.properties && json.properties.forecast) {
                        this.results = json.properties.forecast;
                        return json.properties.forecast;
                    }
                    else {
                        throw new Error("No forecast here.");
                    }
                })
                .then(apiURL => fetch(apiURL))
                .then(response => response.json())
                .then(data => {
                    if (!data.properties || !data.properties.periods) throw new Error("No data for some reason.");
                    this.forecasts = data.properties.periods;
                    console.log(this.forecasts);
                    this.results = "Success";
                })
                .catch(err => {
                    this.results = err + "";
                }
                );
            this.results = "Loading...";
            this.forecasts = null;
        },
        positionCursor(event) {
            //Put a marker where they clicked.
            let position = getMousePos(event.srcElement, event);
            this.clickX = position.x;
            this.clickY = position.y;
        }
    },
    computed: {
        message() {
            if (this.latitude && this.longitude) return "You have selected " + this.latitude.toFixed(2) + ", " + this.longitude.toFixed(2);
            else return "Select a location";
        },
        pointerCoordinates() {
            return {
                top: this.clickY + "px",
                left: this.clickX + "px"
            };
        }
    }
}).mount("#app");

