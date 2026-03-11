package com.example.backend.controllers;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * FileController
 *
 * Responsabilidad dentro del sistema:
 * Esta clase se encarga de gestionar el acceso y la descarga de archivos
 * almacenados en el servidor, específicamente aquellos guardados en la
 * carpeta "uploads" del backend.
 *
 * Relación con otros componentes:
 * Este controlador es utilizado por el Angular para consultar
 * o descargar archivos que han sido previamente cargados al sistema,
 * como comprobantes de pago o documentos (PDF, PNG, JPG Y JPEG) asociados a una orden.
 * Funciona en conjunto con otras partes del sistema que se encargan
 * de subir o registrar la ubicación de estos archivos.
 *
 * Por qué existe dentro de la solución:
 * Existe para permitir que los archivos almacenados en el servidor
 * puedan ser accedidos mediante un endpoint HTTP. Esto facilita que
 * el frontend pueda visualizar o descargar documentos asociados a
 * las órdenes sin necesidad de acceder directamente al sistema de
 * archivos del servidor. (teniendo en cuenta la URL que se crea al momento de guardar
 * el archivo en la base de datos)
 */

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "http://localhost:4200")
public class FileController {

    // Carpeta donde guardaste los archivos
    private final Path uploadsFolder = Paths.get(System.getProperty("user.dir"), "uploads");

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> getFile(@PathVariable String filename) {
        try {
            Path file = uploadsFolder.resolve(filename).normalize();
            Resource resource = new UrlResource(file.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}