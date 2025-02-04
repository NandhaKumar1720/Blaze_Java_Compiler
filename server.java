import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.codec.http.*;
import io.netty.util.CharsetUtil;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class Server {
    private static final int PORT = 3000;

    public static void main(String[] args) {
        EventLoopGroup bossGroup = new NioEventLoopGroup(1);
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        
        try {
            ServerBootstrap bootstrap = new ServerBootstrap();
            bootstrap.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) {
                            ChannelPipeline pipeline = ch.pipeline();
                            pipeline.addLast(new HttpServerCodec());
                            pipeline.addLast(new HttpObjectAggregator(65536));
                            pipeline.addLast(new RequestHandler());
                        }
                    });

            ChannelFuture future = bootstrap.bind(PORT).sync();
            System.out.println("Server is running on http://localhost:" + PORT);
            future.channel().closeFuture().sync();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }
}

class RequestHandler extends SimpleChannelInboundHandler<FullHttpRequest> {
    @Override
    protected void channelRead0(ChannelHandlerContext ctx, FullHttpRequest request) {
        if (request.method() != HttpMethod.POST) {
            sendResponse(ctx, "Only POST requests are allowed", HttpResponseStatus.BAD_REQUEST);
            return;
        }

        String requestBody = request.content().toString(CharsetUtil.UTF_8);
        JSONObject json = new JSONObject(requestBody);
        String code = json.optString("code", "");
        String input = json.optString("input", "");

        if (code.isEmpty()) {
            sendResponse(ctx, "Error: No code provided!", HttpResponseStatus.BAD_REQUEST);
            return;
        }

        // Execute Python Code
        String output = executePython(code, input);

        // Respond with the output
        JSONObject responseJson = new JSONObject();
        responseJson.put("output", output.isEmpty() ? "No output received!" : output);
        sendResponse(ctx, responseJson.toString(), HttpResponseStatus.OK);
    }

    private void sendResponse(ChannelHandlerContext ctx, String message, HttpResponseStatus status) {
        FullHttpResponse response = new DefaultFullHttpResponse(HttpVersion.HTTP_1_1, status);
        response.content().writeBytes(message.getBytes(StandardCharsets.UTF_8));
        response.headers().set(HttpHeaderNames.CONTENT_TYPE, "application/json");
        ctx.writeAndFlush(response).addListener(ChannelFutureListener.CLOSE);
    }

    private String executePython(String code, String input) {
        try {
            ProcessBuilder processBuilder = new ProcessBuilder("python3", "-c", code);
            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();

            if (!input.isEmpty()) {
                try (OutputStream os = process.getOutputStream()) {
                    os.write(input.getBytes(StandardCharsets.UTF_8));
                    os.flush();
                }
            }

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                StringBuilder output = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
                return output.toString();
            }
        } catch (Exception e) {
            return "Runtime Error: " + e.getMessage();
        }
    }
}
