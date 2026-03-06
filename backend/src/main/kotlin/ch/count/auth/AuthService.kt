package ch.count.auth

import io.smallrye.jwt.build.Jwt
import jakarta.enterprise.context.ApplicationScoped
import org.mindrot.jbcrypt.BCrypt

@ApplicationScoped
class AuthService(
    private val userRepository: UserRepository,
) {
    fun login(email: String, password: String): LoginResponse {
        val user = userRepository.findByEmail(email)
            ?: throw AuthException("Ungültige Anmeldedaten")

        if (!BCrypt.checkpw(password, user.passwordHash)) {
            throw AuthException("Ungültige Anmeldedaten")
        }

        val tenantIds = user.tenants.map { it.id }

        val token = Jwt.issuer("count-app")
            .subject(user.id)
            .upn(user.email)
            .claim("userId", user.id)
            .claim("email", user.email)
            .claim("name", user.name)
            .claim("role", user.role)
            .claim("tenantIds", tenantIds)
            .groups(setOf(user.role))
            .sign()

        return LoginResponse(
            token = token,
            user = toDto(user),
        )
    }

    fun findById(userId: String): UserDto {
        val user = userRepository.findById(userId)
            ?: throw AuthException("Benutzer nicht gefunden")
        return toDto(user)
    }

    private fun toDto(user: UserEntity) = UserDto(
        id = user.id,
        email = user.email,
        name = user.name,
        role = user.role,
        avatarInitials = user.avatarInitials,
        tenantIds = user.tenants.map { it.id },
    )
}

class AuthException(message: String) : RuntimeException(message)
