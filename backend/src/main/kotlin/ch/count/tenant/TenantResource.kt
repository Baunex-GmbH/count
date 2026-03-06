package ch.count.tenant

import jakarta.annotation.security.RolesAllowed
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import org.eclipse.microprofile.jwt.JsonWebToken

@Path("/api/tenants")
@Produces(MediaType.APPLICATION_JSON)
@RolesAllowed("Hauptbuchhalter", "Buchhalter", "User")
class TenantResource(
    private val tenantService: TenantService,
    private val jwt: JsonWebToken,
) {
    @GET
    fun list(): List<TenantDto> {
        return tenantService.getTenantsForUser(jwt.subject)
    }
}
