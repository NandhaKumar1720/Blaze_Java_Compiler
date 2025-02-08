import java.io.*;
import java.net.*;

public class JavaServer {
    public static void main(String[] args) {
        try (ServerSocket serverSocket = new ServerSocket(5555)) {
            System.out.println("🔥 Java Execution Server Running...");

            while (true) {
                Socket socket = serverSocket.accept();
                BufferedReader input = new BufferedReader(new InputStreamReader(socket.getInputStream()));
                PrintWriter output = new PrintWriter(socket.getOutputStream(), true);

                StringBuilder code = new StringBuilder();
                String line;
                while ((line = input.readLine()) != null) {
                    if (line.equals("__EOF__")) break;
                    code.append(line).append("\n");
                }

                // Write code to file
                FileWriter writer = new FileWriter("Main.java");
                writer.write(code.toString());
                writer.close();

                // Compile
                Process compile = Runtime.getRuntime().exec("javac Main.java");
                compile.waitFor();

                if (compile.exitValue() != 0) {
                    output.println("Compilation Error");
                    continue;
                }

                // Execute
                Process exec = Runtime.getRuntime().exec("java Main");
                BufferedReader execOutput = new BufferedReader(new InputStreamReader(exec.getInputStream()));

                String execLine;
                while ((execLine = execOutput.readLine()) != null) {
                    output.println(execLine);
                }

                output.println("__END__");
                socket.close();
            }
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
