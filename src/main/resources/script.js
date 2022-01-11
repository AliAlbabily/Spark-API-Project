
async function searchStop(stopName) {
    const result = await $.ajax({
        method: "GET",
        url: "http://localhost:5000/listofstops/"+stopName,
        headers: {"Accept": "application/json"}
    })

    return result;
}

async function searchTrips(stopName1, stopName2) {
    const result = await $.ajax({
        method: "GET",
        url: "http://localhost:5000/originid/"+stopName1+"/destid/"+stopName2,
        headers: {"Accept": "application/json"}
    });

    return result;
}

// sök resor
document.getElementById('searchTrips').addEventListener('click', async function(event) {
    event.preventDefault();

    var text1 = document.getElementById("hållplats1").value;
    var text2 = document.getElementById("hållplats2").value;
    let stopName1 = text1.replace(/ /g, ""); // remove spaces
    let stopName2 = text2.replace(/ /g, ""); // remove spaces

    const response1 = await searchStop(stopName1);
    const response2 = await searchStop(stopName2);

    const trips = await searchTrips(response1.StopLocation[0].id, response2.StopLocation[0].id);
    displayTrips(trips);
});

// visa resorna på sidan
function displayTrips(data) {
    let tripsContainer = document.getElementById("tripsDataContainer");
    $(tripsContainer).html(""); // radera gammal data på sidan

    for (let i = 0; i < data.Trip.length; i++) {
        let arrivalTime = data.Trip[i].LegList.Leg[0].Destination.time;
        let departureTime = data.Trip[i].LegList.Leg[0].Origin.time;
        let wayToTravel = data.Trip[i].LegList.Leg[0].name
        let estimatedTripTime = calculateTripTime(arrivalTime, departureTime); // i sekunder

        let trip = document.createElement('div');
        trip.innerHTML = `
            <p>
                <b>Avgångstid:</b> ${departureTime} |
                <b>Ankomsttid:</b> ${arrivalTime} |
                <b>Restid:</b> ${estimatedTripTime/60} min |
                <b>Sätt att resa:</b> ${wayToTravel}
            </p>
        `;
        tripsContainer.appendChild(trip);
    }
}

function calculateTripTime(arrivalTimeStr, departureTimeStr) {
    let arrivalTime = hmsToSecondsOnly(arrivalTimeStr);
    let departureTime = hmsToSecondsOnly(departureTimeStr);
    let travelTimeInSeconds = arrivalTime - departureTime;

    return travelTimeInSeconds;
}

function hmsToSecondsOnly(str) {
    var p = str.split(':'),
        s = 0, m = 1;

    while (p.length > 0) {
        s += m * parseInt(p.pop(), 10);
        m *= 60;
    }

    return s;
}