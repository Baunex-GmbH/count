package ch.count.auth

import jakarta.annotation.security.PermitAll
import jakarta.annotation.security.RolesAllowed
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import org.eclipse.microprofile.jwt.JsonWebToken

@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
class AuthResource(
    private val authService: AuthService,
    private val jwt: JsonWebToken,
) {
    @POST
    @Path("/login")
    @PermitAll
    @Consumes(MediaType.APPLICATION_JSON)
    fun login(request: LoginRequest): Response {
        return try {
            val result = authService.login(request.email, request.password)
            Response.ok(result).build()
        } catch (e: AuthException) {
            Response.status(Response.Status.UNAUTHORIZED)
                .entity(mapOf("error" to e.message))
                .build()
        }
    }

    @GET
    @Path("/me")
    @RolesAllowed("Hauptbuchhalter", "Buchhalter", "User")
    fun me(): Response {
        val userId = jwt.subject
        return try {
            val user = authService.findById(userId)
            Response.ok(user).build()
        } catch (e: AuthException) {
            Response.status(Response.Status.NOT_FOUND)
                .entity(mapOf("error" to e.message))
                .build()
        }
    }
}
