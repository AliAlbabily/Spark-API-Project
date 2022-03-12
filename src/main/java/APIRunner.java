import com.google.gson.Gson;

import org.eclipse.jetty.client.api.Response;

import spark.Request;
import spark.Route;

import java.net.CookieManager;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static spark.Spark.port;
import static spark.Spark.*;

public class APIRunner {

    private static final String lastfmApiKey = System.getenv("LASTFM_API_KEY");
    private static final String trafiklabApiKey = System.getenv("TRAFIKLAB_API_KEY");

    // Enables CORS on requests. This method is an initialization method and should be called once.
    private static void enableCORS(final String origin, final String methods, final String headers) {

        options("/*", (request, response) -> {

            String accessControlRequestHeaders = request.headers("Access-Control-Request-Headers");
            if (accessControlRequestHeaders != null) {
                response.header("Access-Control-Allow-Headers", accessControlRequestHeaders);
            }

            String accessControlRequestMethod = request.headers("Access-Control-Request-Method");
            if (accessControlRequestMethod != null) {
                response.header("Access-Control-Allow-Methods", accessControlRequestMethod);
            }

            return "OK";
        });

        before((request, response) -> {
            response.header("Access-Control-Allow-Origin", origin);
            response.header("Access-Control-Request-Method", methods);
            response.header("Access-Control-Allow-Headers", headers);
            // Note: this may or may not be necessary in your particular application
            response.type("application/json");
        });
    }

    public static void main(String[] args) {
        port(5000);

        Gson gson = new Gson();
        final HttpClient client = HttpClient.newBuilder().cookieHandler(new CookieManager()).build();

        enableCORS("*", "GET", "");

        // a testing method
        get("/song", (req, res) -> {
            Song song = new Song();
            song.name = "Eye of the tiger";
            song.length = 10;

            return song;
        }, gson::toJson);

        get("/listofstops/:stopname",(req, res) -> {

            // https://github.com/mthmulders/spark-flash/blob/master/src/test/java/spark/flash/FlashIT.java
            final HttpRequest request = HttpRequest.newBuilder()
                .GET()
                .uri(URI.create("https://api.resrobot.se/v2/location.name?input="+req.params(":stopname")+"&format=json&key="+trafiklabApiKey))
                .build();
            final HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            return response.body();
        });

        get("/originid/*/destid/*",(req, res) -> {

            System.out.println(req.splat()[0]);
            System.out.println(req.splat()[1]);

            final HttpRequest request = HttpRequest.newBuilder()
                .GET()
                .uri(URI.create("https://api.resrobot.se/v2/trip?format=json&originId="+req.splat()[0]+"&destId="+req.splat()[1]+"&passlist=true&showPassingPoints=true&key="+trafiklabApiKey))
                .build();
            final HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            return response.body();
        });

        //gettopTracks från lastFM
        get("/gettracks",(req, res) -> {

            final HttpRequest request = HttpRequest.newBuilder()
                .GET()
                .uri(URI.create("https://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key="+lastfmApiKey+"&format=json&limit=200"))
                .build();
            final HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            return response.body();
        });

        //genre från lastFM
        get("/gettracks/:genre",(req, res) -> {
            final HttpRequest request = HttpRequest.newBuilder()
                .GET()
                .uri(URI.create("https://ws.audioscrobbler.com/2.0/?method=album.search&album="+req.params(":genre")+"&api_key="+lastfmApiKey+"&format=json"))
                .build();
            final HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            return response.body();
        });
    }
}
