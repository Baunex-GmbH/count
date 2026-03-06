package ch.count.tenant

import ch.count.auth.UserRepository
import jakarta.enterprise.context.ApplicationScoped
import jakarta.ws.rs.ForbiddenException
import jakarta.ws.rs.NotFoundException

@ApplicationScoped
class TenantService(
    private val userRepository: UserRepository,
    private val tenantRepository: TenantRepository,
) {
    fun requireAccess(userId: String, tenantId: String) {
        val user = userRepository.findById(userId)
            ?: throw NotFoundException("Benutzer nicht gefunden")
        val hasAccess = user.tenants.any { it.id == tenantId }
        if (!hasAccess) {
            throw ForbiddenException("Kein Zugriff auf diesen Mandanten")
        }
    }

    fun getTenantsForUser(userId: String): List<TenantDto> {
        val user = userRepository.findById(userId)
            ?: throw NotFoundException("Benutzer nicht gefunden")
        return user.tenants.map { toDto(it) }
    }

    private fun toDto(entity: TenantEntity) = TenantDto(
        id = entity.id,
        name = entity.name,
        address = entity.address,
        uid = entity.uid,
        plan = entity.plan,
    )
}

data class TenantDto(
    val id: String,
    val name: String,
    val address: String?,
    val uid: String?,
    val plan: String,
)
