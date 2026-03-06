package ch.count.document

import jakarta.annotation.security.PermitAll
import jakarta.annotation.security.RolesAllowed
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import org.eclipse.microprofile.jwt.JsonWebToken
import org.jboss.resteasy.reactive.RestForm
import org.jboss.resteasy.reactive.multipart.FileUpload
import java.io.FileInputStream

@Path("/api/documents")
@Produces(MediaType.APPLICATION_JSON)
@RolesAllowed("Hauptbuchhalter", "Buchhalter", "User")
class DocumentResource(
    private val documentService: DocumentService,
    private val storageService: DocumentStorageService,
    private val jwt: JsonWebToken,
) {
    companion object {
        private val ALLOWED_TYPES = setOf(
            "application/pdf",
            "image/jpeg",
            "image/png",
        )
    }

    @GET
    fun list(@QueryParam("tenantId") tenantId: String): List<DocumentDto> {
        return documentService.listByTenant(jwt.subject, tenantId)
    }

    @GET
    @Path("/{id}")
    fun getById(@PathParam("id") id: String): DocumentDto {
        return documentService.findById(jwt.subject, id)
    }

    @POST
    @Path("/upload")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
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
        val dateityp = filename.substringAfterLast('.', "pdf")

        FileInputStream(file.filePath().toFile()).use { input ->
            storageService.upload(tenantId, documentId, filename, contentType, input, size)
        }

        val doc = documentService.createFromUpload(
            documentId = documentId,
            tenantId = tenantId,
            userId = jwt.subject,
            dateiname = filename,
            dateityp = dateityp,
        )

        return Response.ok(doc).build()
    }

    @PUT
    @Path("/{id}/status")
    @Consumes(MediaType.APPLICATION_JSON)
    fun updateStatus(
        @PathParam("id") id: String,
        request: StatusUpdateRequest,
    ): DocumentDto {
        return documentService.updateStatus(jwt.subject, id, request.status)
    }

    @PUT
    @Path("/{id}/ocr")
    @Consumes(MediaType.APPLICATION_JSON)
    fun updateOcr(
        @PathParam("id") id: String,
        request: OcrUpdateRequest,
    ): DocumentDto {
        return documentService.updateOcr(jwt.subject, id, request.ocrResult)
    }

    @PUT
    @Path("/{id}/archive")
    fun archive(@PathParam("id") id: String): DocumentDto {
        return documentService.archive(jwt.subject, id)
    }

    @PUT
    @Path("/{id}/restore")
    @RolesAllowed("Hauptbuchhalter", "Buchhalter")
    fun restore(@PathParam("id") id: String): DocumentDto {
        return documentService.restore(jwt.subject, id)
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed("Hauptbuchhalter")
    fun delete(@PathParam("id") id: String): Response {
        documentService.delete(jwt.subject, id, storageService)
        return Response.noContent().build()
    }

    @GET
    @Path("/{tenantId}/{documentId}/{filename}")
    @PermitAll
    fun download(
        @PathParam("tenantId") tenantId: String,
        @PathParam("documentId") documentId: String,
        @PathParam("filename") filename: String,
    ): Response {
        return try {
            val stored = storageService.download(tenantId, documentId, filename)
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
