
$(document).ready(function () {

    // test request (ta inte bort !!)
    $.ajax({
        method: "GET",
        url: 'http://localhost:5000/song',
        headers: {"Accept": "application/json"}
    })
        .done(function (data) {
        console.log(data);
    });

    // hämta data om hållplatser (Stops) från API:et vid knapp tryckning
    document.getElementById('searchStopsBtn').addEventListener('click', function(event) {
          event.preventDefault();
          let stopName = document.getElementById("myText").value;
          console.log(stopName);

        $.ajax({
          method: "GET",
          url: "http://localhost:5000/listofstops/"+stopName,
          headers: {"Accept": "application/json"}
        })
        .done(function (data) {
            console.log(data);
        });
    })

    // hämta data om resor från API:et vid knapp tryckning
    document.getElementById('sendStopsIdBtn').addEventListener('click', function(event) {
        event.preventDefault();

        const stopName1 = "740000002"; // ex. Göteborg Centralstation
        const stopName2 = "740000003"; // ex. Malmö Centralstation

        $.ajax({
            method: "GET",
            url: "http://localhost:5000/originid/"+stopName1+"/destid/"+stopName2,
            headers: {"Accept": "application/json"}
        })
        .done(function (data) {
            console.log(data);
        });
    })
});
