package ch.count.kontenrahmen

import jakarta.annotation.security.RolesAllowed
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType

data class KontoDto(
    val nummer: String,
    val bezeichnung: String,
    val kategorie: String,
)

@Path("/api/kontenrahmen")
@Produces(MediaType.APPLICATION_JSON)
@RolesAllowed("Hauptbuchhalter", "Buchhalter", "User")
class KontenrahmenResource(
    private val kontoRepository: KontoRepository,
) {
    @GET
    fun list(): List<KontoDto> {
        return kontoRepository.findAllOrdered().map {
            KontoDto(nummer = it.nummer, bezeichnung = it.bezeichnung, kategorie = it.kategorie)
        }
    }
}
