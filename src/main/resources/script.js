var tripDuration;


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

async function getTracks(){
    const playlist = await $.ajax({
        method : "GET",
        url: "http://localhost:5000/gettracks",
        headers: {"Accept" : "application/json"}
    });

    return playlist;
}

async function getTracksByGenre(genre){
    const genrePlaylist = await $.ajax({
        method: "GET",
        url: "http://localhost:5000/gettracks/"+genre,
        headers: {"Accept": "application/json"}
    });

    return genrePlaylist;
}

// sök resor
document.getElementById('searchTrips').addEventListener('click', async function(event) {
    event.preventDefault();

    $("#tripsDataContainer").html(""); // radera gammal data på sidan
    displayLoadingIcon("#tripsLoadingContainer");
    smoothScrollToElement("#tripsDataHeader");

    var text1 = document.getElementById("hållplats1").value;
    var text2 = document.getElementById("hållplats2").value;
    let stopName1 = text1.replace(/ /g, ""); // remove spaces
    let stopName2 = text2.replace(/ /g, ""); // remove spaces

    const response1 = await searchStop(stopName1);
    const response2 = await searchStop(stopName2);

    const trips = await searchTrips(response1.StopLocation[0].id, response2.StopLocation[0].id);
    displayTrips(trips);

    hideLoadingIcon("#tripsLoadingContainer");
});

// visa resorna på sidan
function displayTrips(data) {
    let tripsContainer = document.getElementById("tripsDataContainer");

    for (let i = 0; i < data.Trip.length; i++) {
        let arrivalTime = data.Trip[i].LegList.Leg[0].Destination.time;
        let departureTime = data.Trip[i].LegList.Leg[0].Origin.time;
        let wayToTravel = data.Trip[i].LegList.Leg[0].name
        let estimatedTripTime = calculateTripTime(arrivalTime, departureTime); // i sekunder

        let trip = document.createElement('div');
        trip.innerHTML = `
            <p class="tripItem" data-id=${estimatedTripTime}>
                <b>Avgångstid:</b> ${departureTime} |
                <b>Ankomsttid:</b> ${arrivalTime} |
                <b>Restid:</b> ${estimatedTripTime/60} min |
                <b>Sätt att resa:</b> ${wayToTravel}
            </p>
        `;
        tripsContainer.appendChild(trip);
    }
}

//visa låtar och minut på sidan
function displayTracks(data){
    var  totalSongDuration = 0;

    let tracksContainer = document.getElementById("tracksDataContainer");
    $(tracksContainer).html( ""); // radera gammal data på sidan

    for(let i = 0;  i < 25; i++){
        let songName = data.tracks.track[i].name;
        let artist = data.tracks.track[i].artist.name; 
        
        if(data.tracks.track[i].duration != 0){
             var songDurationString = data.tracks.track[i].duration; // i sekunder
             var songDuration = parseInt(songDurationString);
             var songDurationInMinutes = songDuration/60;

             var songUrl = data.tracks.track[i].url;
             totalSongDuration += songDuration;

             if(totalSongDuration < tripDuration){ // jämför i sekunder
                let playlist = document.createElement('div');
                playlist.innerHTML = `
                    <p>
                        <b>Längd:</b> ${songDurationInMinutes.toFixed(2)} min | // visa längden i minuter
                        <b>Artist:</b> ${artist} |
                        <b>Låt:</b> ${songName} |
                        <b>Url:</b> <a href=${songUrl} target="_blank">${songUrl.substring(0, 40)}...</a>
                    </p>
                `;
                tracksContainer.appendChild(playlist);
             }
             }
    }
}


function displaySecondTracks(data){
    var  totalSongDuration = 0;

    let tracksContainer = document.getElementById("tracksDataContainer");

    for(let i = 25;  i < data.tracks.track.length; i++){
        let songName = data.tracks.track[i].name;
        let artist = data.tracks.track[i].artist.name; 
        
        if(data.tracks.track[i].duration != 0){
             var songDurationString = data.tracks.track[i].duration; // i sekunder
             var songDuration = parseInt(songDurationString);
             var songDurationInMinutes = songDuration/60;

             var songUrl = data.tracks.track[i].url;
             totalSongDuration += songDuration;

             if(totalSongDuration < tripDuration){ // jämför i sekunder
                let playlist = document.createElement('div');
                playlist.innerHTML = `
                    <p>
                        <b>Andra spellistan:</b> |
                        <b>Längd:</b> ${songDurationInMinutes.toFixed(2)} min | // visa längden i minuter
                        <b>Artist:</b> ${artist} |
                        <b>Låt:</b> ${songName} |
                        <b>Url:</b> <a href=${songUrl} target="_blank">${songUrl.substring(0, 40)}...</a>
                    </p>
                `;
                tracksContainer.appendChild(playlist);
             }
             }
    }
}

function displayTracksByGenre(data){
    let tracksContainer = document.getElementById("tracksDataContainer");

    for(let i = 0; i<data.results.albummatches.album.length; i++){
        let albumName = data.results.albummatches.album[i].name;
        let artist = data.results.albummatches.album[i].artist;
        let playlistURL = data.results.albummatches.album[i].url;

        let genrePlaylist = document.createElement('div');

        genrePlaylist.innerHTML = `
        <p>
            <b>Album:</b> ${albumName} |
            <b>Artist:</b> ${artist} |
            <b>Url:</b> <a href=${playlistURL} target="_blank">${playlistURL.substring(0, 40)}...</a>
        </p>
    `;
    tracksContainer.appendChild(genrePlaylist);
    }


}




function calculateTripTime(arrivalTimeStr, departureTimeStr) {
    let arrivalTime = hmsToSecondsOnly(arrivalTimeStr);
    let departureTime = hmsToSecondsOnly(departureTimeStr);

    var travelTimeInSeconds = arrivalTime - departureTime;

//Om resan sträcker sig över klockslaget 00
    if(travelTimeInSeconds < 0){
      travelTimeInSeconds = 86400 + travelTimeInSeconds;
    };
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

$(document).on("click",".tripItem", async function () {
    tripDuration = parseInt($(this).attr("data-id"));
    alert("The trip was selected. A playlist will show up in a few seconds.");

    smoothScrollToElement("#tracksDataHeader");

    const playlist = await getTracks();
    displayTracks(playlist);
    displaySecondTracks(playlist);
});



document.getElementById("getPlaylist").addEventListener('click',async function(event){
    event.preventDefault();

    $("#tracksDataContainer").html(""); // radera gammal data på sidan
    displayLoadingIcon("#tracksLoadingContainer");
    smoothScrollToElement("#tracksDataHeader");

    if(document.getElementById("musicgenre").value){
        let text1 = document.getElementById("musicgenre").value;
        let musikgenre = text1.replace(/ /g, "")
        const playlist = await getTracksByGenre(musikgenre);
        displayTracksByGenre(playlist);

        hideLoadingIcon("#tracksLoadingContainer");
    }
});

function smoothScrollToElement(element) {
    $('html,body').animate({scrollTop: $(element).offset().top}, 'slow');
}

function displayLoadingIcon(element) {
    $(element).removeClass("hidden");
}

function hideLoadingIcon(element) {
    $(element).addClass("hidden");
}