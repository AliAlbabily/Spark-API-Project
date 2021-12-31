
// test request
$(document).ready(function () {
  $.ajax({
        method: "GET",
        url: 'http://localhost:5000/song',
        headers: {"Accept": "application/json"}
      })
      .done(function (data) {
        console.log(data);
      });

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
});
