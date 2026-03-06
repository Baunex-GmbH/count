package ch.count.auth

import io.quarkus.hibernate.orm.panache.kotlin.PanacheRepositoryBase
import jakarta.enterprise.context.ApplicationScoped
import jakarta.persistence.*

@Entity
@Table(name = "app_user")
class UserEntity {
    @Id
    lateinit var id: String

    @Column(nullable = false, unique = true)
    lateinit var email: String

    @Column(nullable = false)
    lateinit var name: String

    @Column(name = "password_hash", nullable = false)
    lateinit var passwordHash: String

    @Column(nullable = false)
    lateinit var role: String

    @Column(name = "avatar_initials")
    var avatarInitials: String? = null

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_tenant",
        joinColumns = [JoinColumn(name = "user_id")],
        inverseJoinColumns = [JoinColumn(name = "tenant_id")]
    )
    var tenants: MutableList<ch.count.tenant.TenantEntity> = mutableListOf()
}

@ApplicationScoped
class UserRepository : PanacheRepositoryBase<UserEntity, String> {
    fun findByEmail(email: String): UserEntity? = find("email", email).firstResult()
}
