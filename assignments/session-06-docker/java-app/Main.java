// Simple Java web server (built-in HttpServer) that shows Hello World
import com.sun.net.httpserver.HttpServer;
import java.io.OutputStream;
import java.net.InetSocketAddress;

public class Main {
    public static void main(String[] args) throws Exception {
        int port = 8080;
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/", (exchange) -> {
            String html = "<html><head><title>Java App</title></head>"
                + "<body style='font-family:sans-serif;text-align:center;padding-top:80px;background:#f6f8fa;'>"
                + "<h1 style='color:#e76f00;'>Hello World from Java &#9749;</h1>"
                + "<p>Running inside a Docker container on port " + port + "</p>"
                + "</body></html>";
            byte[] bytes = html.getBytes();
            exchange.getResponseHeaders().set("Content-Type", "text/html");
            exchange.sendResponseHeaders(200, bytes.length);
            OutputStream os = exchange.getResponseBody();
            os.write(bytes);
            os.close();
        });
        server.start();
        System.out.println("Java app running on port " + port);
    }
}
