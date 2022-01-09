
async function searchStop(stopName) {
    const result = await $.ajax({
        method: "GET",
        url: "http://localhost:5000/listofstops/"+stopName,
        headers: {"Accept": "application/json"}
    })

    console.log(result);
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

    var tripsContainer = document.getElementById("exampleDataContainer");

    for (let i = 0; i < trips.Trip.length; i++) {
        let arrivalTime = trips.Trip[i].LegList.Leg[0].Destination.time;
        let departureTime = trips.Trip[i].LegList.Leg[0].Origin.time;
        let wayToTravel = trips.Trip[i].LegList.Leg[0].name

        var trip = document.createElement('div');
        trip.innerHTML = `
            <p>
                <b>Avgångstid:</b> ${departureTime} /
                <b>Ankomsttid:</b> ${arrivalTime} /
                <b>Sätt att resa:</b> ${wayToTravel}
            </p>
        `;
        tripsContainer.appendChild(trip);
    }
});