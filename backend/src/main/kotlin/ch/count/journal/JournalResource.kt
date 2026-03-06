package ch.count.journal

import jakarta.annotation.security.RolesAllowed
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import org.eclipse.microprofile.jwt.JsonWebToken

@Path("/api/journal")
@Produces(MediaType.APPLICATION_JSON)
@RolesAllowed("Hauptbuchhalter", "Buchhalter", "User")
class JournalResource(
    private val journalService: JournalService,
    private val jwt: JsonWebToken,
) {
    @GET
    fun list(@QueryParam("tenantId") tenantId: String): List<JournalEntryDto> {
        return journalService.listByTenant(jwt.subject, tenantId)
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    fun create(request: CreateJournalEntryRequest): Response {
        val entry = journalService.create(jwt.subject, request)
        return Response.status(Response.Status.CREATED).entity(entry).build()
    }
}
