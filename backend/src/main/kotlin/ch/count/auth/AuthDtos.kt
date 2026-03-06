package ch.count.auth

data class LoginRequest(
    val email: String = "",
    val password: String = "",
)

data class LoginResponse(
    val token: String,
    val user: UserDto,
)

data class UserDto(
    val id: String,
    val email: String,
    val name: String,
    val role: String,
    val avatarInitials: String?,
    val tenantIds: List<String>,
)
