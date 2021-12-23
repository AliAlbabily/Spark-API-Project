import com.google.gson.Gson;
import spark.Filter;

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

    }
}
