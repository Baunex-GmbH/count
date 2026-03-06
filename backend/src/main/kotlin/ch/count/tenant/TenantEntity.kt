package ch.count.tenant

import io.quarkus.hibernate.orm.panache.kotlin.PanacheRepositoryBase
import jakarta.enterprise.context.ApplicationScoped
import jakarta.persistence.*

@Entity
@Table(name = "tenant")
class TenantEntity {
    @Id
    lateinit var id: String

    @Column(nullable = false)
    lateinit var name: String

    var address: String? = null

    var uid: String? = null

    @Column(nullable = false)
    var plan: String = "Starter"
}

@ApplicationScoped
class TenantRepository : PanacheRepositoryBase<TenantEntity, String>
