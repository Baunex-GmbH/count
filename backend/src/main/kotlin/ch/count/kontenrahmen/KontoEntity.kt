package ch.count.kontenrahmen

import io.quarkus.hibernate.orm.panache.kotlin.PanacheRepositoryBase
import jakarta.enterprise.context.ApplicationScoped
import jakarta.persistence.*

@Entity
@Table(name = "konto")
class KontoEntity {
    @Id
    lateinit var nummer: String

    @Column(nullable = false)
    lateinit var bezeichnung: String

    @Column(nullable = false)
    lateinit var kategorie: String
}

@ApplicationScoped
class KontoRepository : PanacheRepositoryBase<KontoEntity, String> {
    fun findAllOrdered(): List<KontoEntity> = list("ORDER BY nummer")
}
