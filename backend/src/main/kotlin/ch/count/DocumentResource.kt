package ch.count

import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import org.jboss.resteasy.reactive.multipart.FileUpload
import org.jboss.resteasy.reactive.RestForm
import java.io.FileInputStream

@Path("/api/documents")
class DocumentResource(
    private val storage: DocumentStorageService,
) {
    companion object {
        private val ALLOWED_TYPES = setOf(
            "application/pdf",
            "image/jpeg",
            "image/png",
        )
    }

    @POST
    @Path("/upload")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    fun upload(
        @RestForm file: FileUpload,
        @RestForm tenantId: String,
        @RestForm documentId: String,
    ): Response {
        val contentType = file.contentType()
        if (contentType !in ALLOWED_TYPES) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(mapOf("error" to "Dateityp nicht erlaubt. Nur PDF, JPG, PNG."))
                .build()
        }

        val size = file.size()
        if (size > 12 * 1024 * 1024) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(mapOf("error" to "Datei zu gross. Maximal 12 MB."))
                .build()
        }

        val filename = file.fileName()
        FileInputStream(file.filePath().toFile()).use { input ->
            storage.upload(tenantId, documentId, filename, contentType, input, size)
        }

        return Response.ok(
            mapOf(
                "status" to "ok",
                "tenantId" to tenantId,
                "documentId" to documentId,
                "filename" to filename,
            )
        ).build()
    }

    @GET
    @Path("/{tenantId}/{documentId}/{filename}")
    fun download(
        @PathParam("tenantId") tenantId: String,
        @PathParam("documentId") documentId: String,
        @PathParam("filename") filename: String,
    ): Response {
        return try {
            val stored = storage.download(tenantId, documentId, filename)
            Response.ok(stored.stream, stored.contentType)
                .header("Cache-Control", "private, max-age=3600")
                .build()
        } catch (e: Exception) {
            Response.status(Response.Status.NOT_FOUND)
                .entity(mapOf("error" to "Datei nicht gefunden"))
                .type(MediaType.APPLICATION_JSON)
                .build()
        }
    }
}
