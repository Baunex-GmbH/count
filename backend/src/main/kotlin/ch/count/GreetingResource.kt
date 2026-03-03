package ch.count

import jakarta.ws.rs.GET
import jakarta.ws.rs.Path
import jakarta.ws.rs.Produces
import jakarta.ws.rs.core.MediaType

@Path("/api")
class GreetingResource {

    @GET
    @Path("/health")
    @Produces(MediaType.APPLICATION_JSON)
    fun health(): Map<String, String> {
        return mapOf("status" to "ok", "app" to "count-backend")
    }
}
