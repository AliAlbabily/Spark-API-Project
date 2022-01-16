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

    // https://sparkjava.com/tutorials/cors
    // https://stackoverflow.com/questions/45295530/spark-cors-access-control-allow-origin-error
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

        // FIXME :
        enableCORS("*", "GET", "");

        // req (request) : data som skickas från webbläsaren/klientenD
        // res (response) : data som skickas tillbaka till webbläsaren/klientenD
        get("/hello", (req, res) -> "Hello World");

        // TODO : bara ett test
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
                    .uri(URI.create("https://api.resrobot.se/v2/location.name?input="+req.params(":stopname")+"&format=json&key=a3117048-d82b-4122-9c2f-36cfaabbb450"))
                    .build();
            final HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            return response.body();
        });

        get("/originid/*/destid/*",(req, res) -> {

            System.out.println(req.splat()[0]);
            System.out.println(req.splat()[1]);

            final HttpRequest request = HttpRequest.newBuilder()
                    .GET()
                    .uri(URI.create("https://api.resrobot.se/v2/trip?format=json&originId="+req.splat()[0]+"&destId="+req.splat()[1]+"&passlist=true&showPassingPoints=true&key=a3117048-d82b-4122-9c2f-36cfaabbb450"))
                    .build();
            final HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            return response.body();
        });

        
         //gettopTracks från lastFM   
        get("/gettracks",(req, res) -> {
        
            final HttpRequest request = HttpRequest.newBuilder()
                    .GET()
                    .uri(URI.create("https://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key=92a40e6574aee18bb56d0090efbd0539&format=json&limit=300"))
                    .build();
            final HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            return response.body();
            });

            //genre från lastFM
        get("/gettracks/:genre",(req, res) -> {
            final HttpRequest request = HttpRequest.newBuilder()
            .GET()
            .uri(URI.create("https://ws.audioscrobbler.com/2.0/?method=album.search&album="+req.params(":genre")+"&api_key=92a40e6574aee18bb56d0090efbd0539&format=json"))
            .build();
            final HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            return response.body();
        });    
    }

   
  
}
