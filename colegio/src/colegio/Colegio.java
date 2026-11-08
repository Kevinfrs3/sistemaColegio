/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Main.java to edit this template
 */
package colegio;

import java.awt.Desktop;
import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.CodeSource;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author LENOVO
 */
public class Colegio {

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) throws IOException, URISyntaxException {
        Path webPage = findWebPage();
        if (!Desktop.isDesktopSupported()) {
            throw new IllegalStateException("No se encontró un navegador compatible para abrir la aplicación web.");
        }
        Desktop.getDesktop().browse(webPage.toUri());
    }

    private static Path findWebPage() throws URISyntaxException {
        List<Path> starts = new ArrayList<>();
        starts.add(Path.of("").toAbsolutePath());

        CodeSource source = Colegio.class.getProtectionDomain().getCodeSource();
        if (source != null && source.getLocation() != null) {
            Path location = Path.of(source.getLocation().toURI());
            starts.add(Files.isDirectory(location) ? location : location.getParent());
        }

        for (Path start : starts) {
            for (Path directory = start; directory != null; directory = directory.getParent()) {
                Path candidate = directory.resolve("web").resolve("index.html");
                if (Files.isRegularFile(candidate)) {
                    return candidate;
                }
            }
        }
        throw new IllegalStateException("No se encontró web/index.html. Abre colegio/web/index.html en el navegador.");
    }

}
